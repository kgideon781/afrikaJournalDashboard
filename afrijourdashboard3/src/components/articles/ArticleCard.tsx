
import { IconUsers, IconQuote, IconFileText } from '@tabler/icons-react';

interface ArticleCardProps {
  article: {
    title: string;
    authors: string;
    citation_count: number;
    doi?: string | null;
    pdf?: string | null;
    url?: string | null;
    abstract: string;
  };
}
// bg-[#E6F7FF]
export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <div className="mb-6 rounded-lg    bg-[#e3effa] p-6 shadow-sm">
      <h1 className="mb-3 text-xl font-bold text-gray-900">{article.title}</h1>
      
      <div className="mb-3 flex items-center space-x-1 text-sm text-gray-700">
      <div className="rounded-full bg-[#FFFFFF] p-3 transition-colors hover:bg-primary/20">
        <IconUsers className="h-5 w-5 text-gray-500" />
        </div>
        <span className="font-semibold">Authors:</span>
        <span>{article.authors}</span>
      </div>

      <div className="mb-3 flex items-center space-x-1 text-sm text-green-700">
      <div className="rounded-full bg-[#FFFFFF] p-3 transition-colors hover:bg-primary/20">
        <IconQuote className="h-5 w-5 text-green-500" /></div>
        <span className="font-semibold">Citations:</span>
        <span>{article.citation_count}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-1 text-sm text-gray-700">
        <div className="rounded-full bg-[#FFFFFF] p-3 transition-colors hover:bg-primary/20">
          <IconFileText className="h-5 w-5 text-gray-500" /></div>
          <span className="font-semibold">Abstract:</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{article.abstract}</p>
      </div>

      {(() => {
        const readMoreHref = article.pdf || article.url || (article.doi ? `https://doi.org/${article.doi}` : null)
        if (!readMoreHref) return null
        return (
          <a
            href={readMoreHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            Read more →
          </a>
        )
      })()}
    </div>
  );
}