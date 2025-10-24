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
  function cleanMarkdownContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    let cleanedContent = content.trim();

    // Satırları ayır ve işle
    const lines = cleanedContent.split('\n');
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let currentLine = lines[i];
      const nextLine = lines[i + 1];

      // Birleşik karakterleri ayır (satır içinde)
      // #####* -> ##### ve * olarak ayır
      if (/(#{1,6})([\*\-\+])/.test(currentLine)) {
        const match = currentLine.match(/(#{1,6})([\*\-\+].*)/);
        if (match) {
          processedLines.push(match[1].trim()); // Başlık
          processedLines.push(''); // Boşluk
          currentLine = match[2]; // Liste
        }
      }

      // Mevcut satırı ekle
      processedLines.push(currentLine);

      // Başlık kontrolü (# ile başlayan satırlar)
      const isCurrentHeading = /^#{1,6}\s/.test(currentLine);
      const isNextHeading = nextLine && /^#{1,6}\s/.test(nextLine);
      const isNextText = nextLine && nextLine.trim() && !isNextHeading && !nextLine.startsWith('*') && !nextLine.startsWith('-') && !nextLine.startsWith('+');

      // Liste kontrolü
      const isCurrentList = /^[\*\-\+]\s/.test(currentLine);
      const isNextList = nextLine && /^[\*\-\+]\s/.test(nextLine);

      // Boşluk ekleme kuralları
      if (currentLine.trim()) {
        // 1. Başlık sonrası metin varsa boşluk ekle
        if (isCurrentHeading && isNextText) {
          processedLines.push('');
        }
        // 2. Metin sonrası başlık varsa boşluk ekle  
        else if (!isCurrentHeading && !isCurrentList && isNextHeading) {
          processedLines.push('');
        }
        // 3. Liste öncesi/sonrası boşluk ekle
        else if (!isCurrentList && nextLine && /^[\*\-\+]\s/.test(nextLine)) {
          processedLines.push('');
        }
        else if (isCurrentList && nextLine && !isNextList && nextLine.trim() && !isNextHeading) {
          processedLines.push('');
        }
      }
    }

    // Sonucu birleştir
    cleanedContent = processedLines.join('\n');

    // KRİTİK DÜZELTME: Birleşik karakterleri ayır
    // #####* -> ##### *
    cleanedContent = cleanedContent.replace(/(#{1,6})([\*\-\+])/g, '$1\n\n$2');

    // Başlık formatını düzelt (##Başlık -> ## Başlık)
    cleanedContent = cleanedContent.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

    // Liste formatını düzelt (*madde -> * madde)  
    cleanedContent = cleanedContent.replace(/^([\*\-\+])([^\s])/gm, '$1 $2');

    // Birleşik başlık-metin durumları (##Metin -> ## Metin)
    cleanedContent = cleanedContent.replace(/(#{1,6})([A-ZÜĞŞÇÖİa-züğşçöı])/g, '$1 $2');

    // Birleşik liste-metin durumları (*Metin -> * Metin)
    cleanedContent = cleanedContent.replace(/([\*\-\+])([A-ZÜĞŞÇÖİa-züğşçöı])/g, '$1 $2');

    // Fazla boşlukları temizle
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    return cleanedContent.trim();
  }

  const cleanedContent = cleanMarkdownContent(content);

  // Debug için - sadece geliştirme ortamında
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('🔍 MARKDOWN DEBUG:');

    // Birleşik karakter kontrolü
    const hasMergedChars = /(#{1,6}[\*\-\+])/.test(content);
    const stillHasMerged = /(#{1,6}[\*\-\+])/.test(cleanedContent);

    if (hasMergedChars || stillHasMerged) {
      console.log('❌ Has merged chars:', hasMergedChars);
      console.log('✅ Still merged after cleaning:', stillHasMerged);
      console.log('Original sample:', content.substring(0, 200));
      console.log('Cleaned sample:', cleanedContent.substring(0, 200));
    }
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          // Başlıklar - optimize edilmiş boşluklar
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mb-6 mt-8 text-gray-900 leading-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold mb-4 mt-8 text-gray-900 border-b border-gray-200 pb-2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-bold mb-3 mt-5 text-gray-900" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-bold mb-2 mt-4 text-gray-900" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-base font-bold mb-2 mt-4 text-gray-900" {...props}>
              {children}
            </h6>
          ),

          // Paragraflar - daha iyi boşluk ve okunabilirlik
          p: ({ children, ...props }) => (
            <p className="mb-4 text-gray-700 leading-relaxed text-base" {...props}>
              {children}
            </p>
          ),

          // Listeler - daha iyi görünüm
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside mb-4 space-y-2 ml-6 text-gray-700" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside mb-4 space-y-2 ml-6 text-gray-700" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
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

