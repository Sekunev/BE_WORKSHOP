'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  /**
   * AI tarafından üretilen Markdown içeriğini temizler ve düzeltir.
   * @param {string} content - Temizlenecek ham Markdown içeriği.
   * @returns {string} - Temizlenmiş ve düzenlenmiş Markdown içeriği.
   */
  function cleanMarkdownContent(content: string) {
    if (!content || typeof content !== 'string') {
      return '';
    }

    let cleanedContent = content.trim();

    // --- 1. Başlıkları (Headings) Düzelt ---

    // Birleşik başlıkları ayır (örn: "## ###" -> "###")
    // Satır başındaki # karakterlerini yakala ve ardından gelen gereksiz # karakterlerini temizle.
    cleanedContent = cleanedContent.replace(/^(#{1,6})\s*#{1,6}/gm, '$1');

    // Başlıktan sonra boşluk ekle (örn: "##Başlık" -> "## Başlık")
    // Satır başındaki # karakterlerinden sonra boşluk yoksa ekle.
    cleanedContent = cleanedContent.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

    // Başlıklardan önce doğru sayıda boşluk ekle
    // Bir metinden hemen sonra gelen bir başlığı, iki satır aşağıya indir.
    cleanedContent = cleanedContent.replace(/([^\n])\n(#{1,6})/g, '$1\n\n$2');

    // --- 2. Diğer Yaygın Markdown Hatalarını Düzelt ---

    // Kalın ve italik metinlerdeki gereksiz boşlukları temizle (örn: "** metin **" -> "**metin**")
    cleanedContent = cleanedContent.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**');
    cleanedContent = cleanedContent.replace(/\*\s+([^*]+?)\s+\*/g, '*$1*');

    // Linklerdeki gereksiz boşlukları temizle (örn: "[ metin ] ( url )" -> "[metin](url)")
    cleanedContent = cleanedContent.replace(/\[([^\]]+?)\]\s+\(([^)]+?)\)/g, '[$1]($2)');

    // Liste elemanlarından sonra boşluk ekle (örn: "*madde" -> "* madde")
    cleanedContent = cleanedContent.replace(/^(\*|\+|\-|\d+\.)\s*([^\s])/gm, '$1 $2');

    // --- 3. Nihai Temizlik ---

    // Üç veya daha fazla boş satırlı iki satıra düşür.
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    return cleanedContent;
  }

  // ÖRNEK KULLANIM:
  const aiGeneratedContent = `
Bu bir paragraf.##Hatalı Başlık
Bir önceki başlıktan sonra boşluk yok.
Bu başka bir paragraf.###Alt Başlık
## ### Birleşik Başlık
Bu da ** kalın metin ** ve * italik metin *.
*Liste elemanı1
* Liste elemanı2
[Bağlantı metni] (https://example.com)
`;

  const cleanedContent = cleanMarkdownContent(content);
  console.log(cleanedContent);

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          // Başlıklar - daha küçük fontlar
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 border-b border-gray-200 pb-1" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-bold mb-2 mt-4 text-gray-900" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-bold mb-2 mt-3 text-gray-900" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-bold mb-2 mt-3 text-gray-900" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-bold mb-2 mt-3 text-gray-900" {...props}>
              {children}
            </h6>
          ),

          // Paragraflar
          p: ({ children, ...props }) => (
            <p className="mb-3 text-gray-700 leading-relaxed text-base" {...props}>
              {children}
            </p>
          ),

          // Listeler
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 ml-4 text-gray-700" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 ml-4 text-gray-700" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="ml-1" {...props}>
              {children}
            </li>
          ),

          // Linkler
          a: ({ children, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // Kod blokları
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3 border border-gray-700 text-sm" {...props}>
              {children}
            </pre>
          ),

          // Alıntılar
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 py-2 mb-3 italic text-gray-700 bg-blue-50 text-sm"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // Tablolar
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full divide-y divide-gray-200 border text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700" {...props}>
              {children}
            </td>
          ),

          // Yatay çizgi
          hr: ({ ...props }) => (
            <hr className="my-4 border-t border-gray-200" {...props} />
          ),

          // Resimler
          img: ({ alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="max-w-full h-auto rounded-lg shadow-md my-3"
              alt={alt || ''}
              {...props}
            />
          ),

          // Strong (Bold)
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-gray-900" {...props}>
              {children}
            </strong>
          ),

          // Emphasis (Italic)
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}

