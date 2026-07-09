import { IconUsers, IconQuote, IconFileText, IconExternalLink } from '@tabler/icons-react'

interface ArticleCardProps {
  article: {
    title: string
    authors: string
    citation_count: number
    doi?: string | null
    pdf?: string | null
    url?: string | null
    abstract: string
  }
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const readMoreHref =
    article.pdf || article.url || (article.doi ? `https://doi.org/${article.doi}` : null)

  return (
    <article className='mb-4 rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-lg'>
      <h2 className='mb-3 text-base font-semibold leading-snug md:text-lg'>
        {article.title}
      </h2>

      <div className='mb-3 flex items-center gap-2 text-xs text-muted-foreground'>
        <IconUsers className='h-4 w-4 text-muted-foreground shrink-0' />
        <span className='font-medium text-foreground/80 shrink-0'>Authors:</span>
        <span className='truncate'>{article.authors}</span>
      </div>

      <div className='mb-3 flex items-center gap-2 text-xs text-muted-foreground'>
        <IconQuote className='h-4 w-4 text-emerald-400 shrink-0' />
        <span className='font-medium text-foreground/80 shrink-0'>Citations:</span>
        <span>{article.citation_count}</span>
      </div>

      {article.abstract && (
        <div className='mb-4'>
          <div className='mb-1 flex items-center gap-2 text-xs'>
            <IconFileText className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='font-medium text-foreground/80'>Abstract</span>
          </div>
          <p className='line-clamp-3 text-sm text-muted-foreground'>
            {article.abstract}
          </p>
        </div>
      )}

      {readMoreHref && (
        <a
          href={readMoreHref}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80'
        >
          Read more
          <IconExternalLink className='h-4 w-4' />
        </a>
      )}
    </article>
  )
}
