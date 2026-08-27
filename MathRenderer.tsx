import React, { useMemo, useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  displayMode = false, // MathJax handles display mode natively based on $$ vs $
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    if (!content) return '';

    let processed = content.replace(/\$\$\$\$/g, '$$').replace(/\$\$\$/g, '$$');

    // Convert basic markdown formatting
    // Headers
    processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">$1</h3>');
    processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-5 mb-2">$1</h2>');
    processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-6 mb-3">$1</h1>');

    // Bold / Italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');

    // Unordered Lists
    processed = processed.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700">$1</li>');
    processed = processed.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700">$1</li>');

    // Handle newlines
    const lines = processed.split('\n');
    let inMathBlock = false;
    
    const formattedLines = lines.map(line => {
      // Check if we enter or exit a display math block
      const mathTokens = (line.match(/\$\$/g) || []).length + (line.match(/\\\[/g) || []).length + (line.match(/\\\]/g) || []).length;
      if (mathTokens % 2 !== 0) {
        inMathBlock = !inMathBlock;
      }
      
      if (inMathBlock || line.trim().startsWith('$$') || line.trim().startsWith('\\[')) {
        return line + '\n'; // Don't add <br> inside math blocks
      }
      
      if (line.trim().startsWith('<h') || line.trim().startsWith('<div') || line.trim().startsWith('<li') || line.trim().startsWith('<pre')) {
        return line;
      }
      if (line.trim() === '') {
        return '<div class="h-2"></div>';
      }
      return `<span>${line}</span><br/>`;
    });

    let finalHtml = formattedLines.join('');
    return finalHtml;
  }, [content]);

  useEffect(() => {
    let timeoutId: any;
    if (containerRef.current) {
      // Small timeout to allow React to render the raw text first
      timeoutId = setTimeout(() => {
        if ((window as any).MathJax) {
          try {
            (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
              console.warn('MathJax error:', err);
            });
          } catch (e) {
             console.warn('MathJax sync error:', e);
          }
        }
      }, 50);
    }
    return () => clearTimeout(timeoutId);
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className={`prose max-w-none text-slate-800 leading-relaxed math-rendered ${className} overflow-x-auto`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
