'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

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
- Each html item must be a complete, structured HTML article fragment, not plain text wrapped in a single tag.
- Every html item must start with <article> and end with </article>.
- Structure each version with a heading, multiple paragraphs, and sections. Use lists and blockquotes when they help represent the source accurately.
- Use semantic tags such as <article>, <section>, <header>, <h2>, <h3>, <p>, <strong>, <em>, <blockquote>, <ul>, <ol>, and <li>.
- Do not include <html>, <body>, scripts, styles, classes, Markdown, or images.
- difficult_words must contain one array for each level. Include challenging words or short expressions that actually appear in the corresponding version.
- short_description must be an English summary with no more than 180 characters.
- Generate a lowercase, URL-safe English slug using only letters, numbers, and hyphens.
- Preserve the original author when available; otherwise, use the publication name.
- Add the original article URL to links.
- Ensure the response is valid JSON with no trailing commas.

Return only the JSON object. Do not use Markdown fences and do not add explanations before or after it.

Use exactly this structure:
{
  "title": "News article title",
  "short_description": "A short summary of the news article.",
  "html": [
    "<article><header><h2>Article title</h2></header><section><p>Beginner introduction...</p><p>Beginner article content...</p></section></article>",
    "<article><header><h2>Article title</h2></header><section><p>Intermediate introduction...</p><p>Intermediate article content...</p></section></article>",
    "<article><header><h2>Article title</h2></header><section><p>Advanced introduction...</p><p>Advanced article content...</p></section></article>"
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

export default function Page() {
  const router = useRouter()
  const [articleUrl, setArticleUrl] = useState('')
  const [json, setJson] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prompt = createPrompt(articleUrl)

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    let body: NewsPayload

    try {
      body = JSON.parse(json) as NewsPayload
    } catch {
      setError('The provided content is not valid JSON.')
      return
    }

    if (!body || Array.isArray(body) || typeof body !== 'object') {
      setError('The JSON must contain an object.')
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
      setError(
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

      if (typeof body.slug === 'string' && body.slug) {
        router.push(`/app/news/${encodeURIComponent(body.slug)}`)
      } else {
        router.push('/app/news')
      }

      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create the news article.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <Link
        href="/app/news"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        ← Back to news
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="mt-1 text-3xl font-semibold">New article</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the source URL, copy the prompt into an AI, then paste its JSON
          response below.
        </p>
      </header>

      <section className="mb-8 space-y-4 rounded-lg border p-5">
        <div>
          <label htmlFor="article-url" className="text-sm font-medium">
            Article URL
          </label>
          <input
            id="article-url"
            type="url"
            value={articleUrl}
            onChange={(event) => {
              setArticleUrl(event.target.value)
              setCopied(false)
            }}
            placeholder="https://example.com/news/article"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="ai-prompt" className="text-sm font-medium">
              AI prompt
            </label>
            <button
              type="button"
              onClick={handleCopyPrompt}
              disabled={!articleUrl}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? 'Copied!' : 'Copy prompt'}
            </button>
          </div>
          <textarea
            id="ai-prompt"
            readOnly
            rows={14}
            value={prompt}
            className="mt-2 w-full resize-y rounded-lg border border-input bg-muted/30 p-4 font-mono text-xs leading-5 outline-none"
          />
        </div>
      </section>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label htmlFor="news-json" className="text-sm font-medium">
          AI-generated JSON
        </label>
        <textarea
          id="news-json"
          required
          rows={30}
          spellCheck={false}
          value={json}
          onChange={(event) => setJson(event.target.value)}
          className="w-full resize-y rounded-lg border border-input bg-background p-4 font-mono text-sm leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Paste the JSON returned by the AI here"
        />

        {error && (
          <p
            role="alert"
            className="whitespace-pre-line rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/app/news"
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Publishing…' : 'Publish article'}
          </button>
        </div>
      </form>
    </section>
  )
}
