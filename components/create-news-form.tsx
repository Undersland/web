'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { DrawerClose } from '@/components/ui/drawer'

function createPrompt(articleUrl: string) {
  const normalizedArticleUrl = (() => {
    try {
      return new URL(articleUrl).href
        .replaceAll('[', '%5B')
        .replaceAll(']', '%5D')
        .replaceAll('(', '%28')
        .replaceAll(')', '%29')
    } catch {
      return 'ARTICLE_URL'
    }
  })()
  const faviconUrl = (() => {
    try {
      return new URL('/favicon.ico', normalizedArticleUrl).href
    } catch {
      return 'https://publication.example/favicon.ico'
    }
  })()
  const articleUrlJson = JSON.stringify(normalizedArticleUrl)
  const faviconUrlJson = JSON.stringify(faviconUrl)

  return `Read this news article and create graded English-learning versions based only on its facts:
${normalizedArticleUrl}

OUTPUT
Return the valid JSON inside one Markdown code block labeled json. Do not write anything before or after the code block. The response must look like the REQUIRED SHAPE below; never print literal <code> tags.

CONTENT
- Write everything in English and paraphrase the source. Do not invent facts.
- html[0]: Beginner (CEFR A1-A2), 300-400 words.
- html[1]: Intermediate (CEFR B1-B2), 450-600 words.
- html[2]: Advanced (CEFR C1-C2), 650-850 words.
- Each HTML string must decode to this pattern: <article><p>opening story paragraph...</p><section><h3>later section heading</h3><p>more story...</p></section></article>.
- The first child of <article> must be <p>. Never start an HTML string with the title, a headline, <header>, or a heading. Do not repeat the main title inside the HTML.
- Include at least two paragraphs and one later heading in each article.
- Use only these tags: <article>, <section>, <h2>, <h3>, <p>, <blockquote>, <ul>, <ol>, <li>, <strong>, and <em>. Do not use attributes.
- In the JSON source, write HTML brackets as \\u003C and \\u003E so the interface does not render the tags. Escape any quotation marks inside JSON strings correctly.

FIELDS
- title: factual English headline, maximum 60 characters.
- short_description: one short factual English sentence, maximum 80 characters. Do not truncate or use ellipses.
- difficult_words: exactly three arrays in the same order as html. Each array must contain exactly three words or short expressions that appear verbatim in its corresponding article.
- slug: lowercase English letters, numbers, and hyphens only.
- author.name: source byline; use the publication name if no person is credited.
- links: copy the two link values from the template exactly. Do not convert them to Markdown, add brackets, add spaces, or replace them with search/redirect URLs.

REQUIRED SHAPE
\`\`\`json
{
  "title": "Concise news title",
  "short_description": "Concise factual summary.",
  "html": [
    "\\u003Carticle\\u003E\\u003Cp\\u003E300-400 word Beginner story starts here...\\u003C/p\\u003E\\u003Csection\\u003E\\u003Ch3\\u003ELater heading\\u003C/h3\\u003E\\u003Cp\\u003EMore story...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E",
    "\\u003Carticle\\u003E\\u003Cp\\u003E450-600 word Intermediate story starts here...\\u003C/p\\u003E\\u003Csection\\u003E\\u003Ch3\\u003ELater heading\\u003C/h3\\u003E\\u003Cp\\u003EMore story...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E",
    "\\u003Carticle\\u003E\\u003Cp\\u003E650-850 word Advanced story starts here...\\u003C/p\\u003E\\u003Csection\\u003E\\u003Ch3\\u003ELater heading\\u003C/h3\\u003E\\u003Cp\\u003EMore story...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E"
  ],
  "difficult_words": [
    ["beginner word 1", "beginner word 2", "beginner word 3"],
    ["intermediate word 1", "intermediate word 2", "intermediate word 3"],
    ["advanced word 1", "advanced word 2", "advanced word 3"]
  ],
  "slug": "news-article-title",
  "links": [
    {
      "link": ${articleUrlJson},
      "text": "Original article — Publication name"
    },
    {
      "link": ${faviconUrlJson},
      "text": "Publication favicon"
    }
  ],
  "author": {
    "name": "Author or publication name"
  }
}
\`\`\``
}

type NewsPayload = {
  slug?: unknown
  [key: string]: unknown
}

type ApiError = {
  message?: string
  issues?: Record<string, string[] | undefined>
}

function isPlainHttpUrl(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    /\s/.test(value) ||
    ['[', ']', '(', ')'].some((character) => value.includes(character))
  ) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function formatApiError(error: ApiError | string | undefined) {
  if (typeof error === 'string') return error

  const message = error?.message ?? 'Unable to create the news article.'
  const issues = Object.entries(error?.issues ?? {}).flatMap(
    ([field, fieldIssues]) =>
      (fieldIssues ?? []).map((issue) => `${field}: ${issue}`),
  )

  return issues.length > 0 ? `${message}\n${issues.join('\n')}` : message
}

export default function CreateNewsForm({
  inDrawer = false,
}: {
  inDrawer?: boolean
}) {
  const router = useRouter()
  const [articleUrl, setArticleUrl] = useState('')
  const [json, setJson] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prompt = createPrompt(articleUrl)

  function showError(message: string) {
    setError(message)
    toast.error(message)
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to copy the prompt.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    let body: NewsPayload

    try {
      const trimmedJson = json.trim()
      const fencedContent = trimmedJson.match(
        /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
      )?.[1]
      const legacyCodeContent = trimmedJson.match(
        /^<code>\s*([\s\S]*?)\s*<\/code>$/i,
      )?.[1]

      body = JSON.parse(
        fencedContent ?? legacyCodeContent ?? trimmedJson,
      ) as NewsPayload
    } catch {
      showError('The provided content is not valid JSON.')
      return
    }

    if (!body || Array.isArray(body) || typeof body !== 'object') {
      showError('The JSON must contain an object.')
      return
    }

    if (
      !Array.isArray(body.html) ||
      body.html.length !== 3 ||
      body.html.some(
        (content) =>
          typeof content !== 'string' ||
          !/^\s*<article(?:\s[^>]*)?>[\s\S]*<\/article>\s*$/i.test(content) ||
          !/^\s*<article(?:\s[^>]*)?>\s*<p(?:\s[^>]*)?>/i.test(content) ||
          !/<h[1-6](?:\s[^>]*)?>[\s\S]*?<\/h[1-6]>/i.test(content) ||
          (content.match(/<p(?:\s[^>]*)?>/gi)?.length ?? 0) < 2,
      )
    ) {
      showError(
        'The JSON must contain exactly three structured HTML articles, each starting with a paragraph instead of a title and containing a later heading plus at least two paragraphs.',
      )
      return
    }

    if (
      !Array.isArray(body.links) ||
      body.links.length < 2 ||
      body.links.some(
        (item) =>
          !item ||
          typeof item !== 'object' ||
          !('link' in item) ||
          !isPlainHttpUrl(item.link),
      )
    ) {
      showError(
        'Every link must be a plain HTTP URL string without Markdown, brackets, parentheses, or spaces.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: ApiError | string
      } | null

      if (!response.ok) {
        throw new Error(formatApiError(payload?.error))
      }

      toast.success('Article published successfully.')

      if (typeof body.slug === 'string' && body.slug) {
        router.push(`/app/news/${encodeURIComponent(body.slug)}`)
      } else {
        router.push('/app/news')
      }

      router.refresh()
    } catch (submitError) {
      showError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create the news article.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <section className={inDrawer ? '' : 'py-14'}>
      {!inDrawer && (
        <Link
          href="/app/news"
          className="text-sm gap-2.5 text-muted-foreground hover:text-foreground flex items-center"
        >
          <ChevronLeft className="text-foreground size-3.5" />

          <p className="text-xs font-sans text-muted-foreground">
            Back to news
          </p>
        </Link>
      )}

      <header className="mb-8 mt-6">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New article
        </h1>
        <p className="mt-2.5 text-sm leading-5 text-muted-foreground">
          Add a source link, copy the generated prompt, and paste the returned
          JSON to publish the article.
        </p>
      </header>

      <section className="flex flex-col gap-2.5">
        <div className="space-y-2">
          <label htmlFor="article-url" className="text-xs font-medium">
            Article URL
          </label>

          <div className="flex overflow-hidden rounded-lg border-2 border-input bg-background transition-colors focus-within:border-foreground">
            <input
              id="article-url"
              type="url"
              value={articleUrl}
              onChange={(event) => {
                setArticleUrl(event.target.value)
                setCopied(false)
              }}
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />

            {articleUrl.trim() && (
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex h-10 shrink-0 items-center border-l border-input px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="prompt" className="text-xs font-medium">
            Prompt
          </label>
          <form onSubmit={handleSubmit}>
            <textarea
              id="news-json"
              required
              rows={14}
              spellCheck={false}
              value={json}
              onChange={(event) => setJson(event.target.value)}
              className="w-full resize-none rounded-lg border-2 border-input bg-background p-4 font-sans text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />

            {error && (
              <p
                role="alert"
                className="whitespace-pre-line rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end gap-1.5 mt-2.5">
              {inDrawer ? (
                <DrawerClose className="inline-flex h-8 items-center rounded-full border px-4 text-sm font-medium hover:bg-muted">
                  Cancel
                </DrawerClose>
              ) : (
                <Link
                  href="/app/news"
                  className="inline-flex h-8 items-center rounded-full border px-4 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </Link>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Publishing…' : 'Publish article'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </section>
  )
}
