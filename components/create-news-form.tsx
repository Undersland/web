'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { DrawerClose } from '@/components/ui/drawer'

function createPrompt(articleUrl: string) {
  return `Access and analyze this news article:

${articleUrl || 'ARTICLE_URL'}

Create English-learning content based exclusively on the article. Preserve all facts, names, dates, numbers, places, and the original meaning. Do not invent information.

Create exactly three English versions:
1. Beginner — CEFR A1–A2
2. Intermediate — CEFR B1–B2
3. Advanced — CEFR C1–C2

Requirements:
- Rewrite the content instead of copying long passages from the source.
- html[0], html[1], and html[2] must contain the Beginner, Intermediate, and Advanced versions, respectively.
- Each html item must be a complete, structured HTML article fragment. Plain text without tags is invalid.
- Encode every HTML opening bracket < as the JSON Unicode escape \\u003C and every closing bracket > as \\u003E. This prevents chat interfaces from rendering or removing the tags. Do not output literal < or > characters inside html values.
- Inside every JSON string, encode quotation marks that belong to the article text as \\u0022. Never place an unescaped " character inside an html string. For example, a quotation must be written as \\u003Cblockquote\\u003E\\u003Cp\\u003E\\u0022Quoted text.\\u0022\\u003C/p\\u003E\\u003C/blockquote\\u003E.
- After JSON decoding, every html item must start with <article> and end with </article>.
- Structure each version with a heading, multiple paragraphs, and sections. Use lists and blockquotes when they help represent the source accurately.
- Use semantic tags such as <article>, <section>, <header>, <h2>, <h3>, <p>, <strong>, <em>, <blockquote>, <ul>, <ol>, and <li>.
- Every paragraph must be enclosed in <p>...</p>. Headings and section titles must also retain their HTML tags.
- Do not include <html>, <body>, scripts, styles, classes, Markdown, or images.
- difficult_words must contain one array for each level. Include challenging words or short expressions that actually appear in the corresponding version.
- short_description must be an English summary with no more than 180 characters.
- Generate a lowercase, URL-safe English slug using only letters, numbers, and hyphens.
- Preserve the original author when available; otherwise, use the publication name.
- Add the original article URL to links as a plain absolute URL. Do not use Markdown link syntax, brackets, parentheses, or HTML in the link field.
- Ensure the response is valid JSON with no trailing commas.

Before responding, verify all of the following:
1. The complete response can be parsed by JSON.parse() without any error.
2. All three html strings contain encoded article, heading, section, and paragraph tags.
3. Every quotation mark inside article content is encoded as \\u0022 and cannot terminate its JSON string.
4. The link field contains only the plain URL that begins with http:// or https://.
5. No html value contains only readable prose without encoded tags.

Return only the JSON object. Do not use Markdown fences and do not add explanations before or after it. The output must be directly accepted by JSON.parse().

Use exactly this structure:
{
  "title": "News article title",
  "short_description": "A short summary of the news article.",
  "html": [
    "\\u003Carticle\\u003E\\u003Cheader\\u003E\\u003Ch2\\u003EArticle title\\u003C/h2\\u003E\\u003C/header\\u003E\\u003Csection\\u003E\\u003Cp\\u003EBeginner introduction...\\u003C/p\\u003E\\u003Cp\\u003EBeginner article content...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E",
    "\\u003Carticle\\u003E\\u003Cheader\\u003E\\u003Ch2\\u003EArticle title\\u003C/h2\\u003E\\u003C/header\\u003E\\u003Csection\\u003E\\u003Cp\\u003EIntermediate introduction...\\u003C/p\\u003E\\u003Cp\\u003EIntermediate article content...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E",
    "\\u003Carticle\\u003E\\u003Cheader\\u003E\\u003Ch2\\u003EArticle title\\u003C/h2\\u003E\\u003C/header\\u003E\\u003Csection\\u003E\\u003Cp\\u003EAdvanced introduction...\\u003C/p\\u003E\\u003Cp\\u003EAdvanced article content...\\u003C/p\\u003E\\u003C/section\\u003E\\u003C/article\\u003E"
  ],
  "difficult_words": [
    ["beginner word"],
    ["intermediate word"],
    ["advanced word"]
  ],
  "slug": "news-article-title",
  "links": [
    {
      "link": "${articleUrl || 'ARTICLE_URL'}",
      "text": "Original article — Publication name"
    }
  ],
  "author": {
    "name": "Author or publication name"
  }
}`
}

type NewsPayload = {
  slug?: unknown
  [key: string]: unknown
}

type ApiError = {
  message?: string
  issues?: Record<string, string[] | undefined>
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
      body = JSON.parse(json) as NewsPayload
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
          !/<h[1-6](?:\s[^>]*)?>[\s\S]*?<\/h[1-6]>/i.test(content) ||
          (content.match(/<p(?:\s[^>]*)?>/gi)?.length ?? 0) < 2,
      )
    ) {
      showError(
        'The JSON must contain exactly three structured HTML articles, each with an <article> element, a heading, and at least two paragraphs.',
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
