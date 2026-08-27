import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  displayMode = false,
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If explicit displayMode is set for single formula
    if (displayMode) {
      try {
        return katex.renderToString(content.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        return `<span class="text-rose-600 font-mono">${escapeHtml(content)}</span>`;
      }
    }

    return renderMixedMathAndMarkdown(content);
  }, [content, displayMode]);

  return (
    <div
      className={`prose max-w-none text-slate-800 leading-relaxed math-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMixedMathAndMarkdown(rawText: string): string {
  if (!rawText) return '';

  // Clean up any accidentally duplicated $$ wrappers
  let processed = rawText.replace(/\$\$\$\$/g, '$$').replace(/\$\$\$/g, '$$');

  // Replace $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="my-2 overflow-x-auto py-1">${rendered}</div>`;
    } catch {
      return `<pre class="text-rose-600 bg-rose-50 p-2 rounded">${escapeHtml(math)}</pre>`;
    }
  });

  // Replace \[ ... \]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="my-2 overflow-x-auto py-1">${rendered}</div>`;
    } catch {
      return `<pre class="text-rose-600 bg-rose-50 p-2 rounded">${escapeHtml(math)}</pre>`;
    }
  });

  // Replace $ ... $ (inline math)
  // Ensure we don't match currency like $10 or empty $$
  processed = processed.replace(/\$([^\$\n\r]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<code class="text-rose-600">${escapeHtml(math)}</code>`;
    }
  });

  // Replace \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<code class="text-rose-600">${escapeHtml(math)}</code>`;
    }
  });

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

  // Handle literal \\ as newline if it's left over (outside math)
  processed = processed.replace(/\\\\/g, '<br/>');

  // Paragraph breaks & newlines (excluding inside existing tags)
  const lines = processed.split('\n');
  const formattedLines = lines.map(line => {
    if (line.trim().startsWith('<h') || line.trim().startsWith('<div') || line.trim().startsWith('<li') || line.trim().startsWith('<pre')) {
      return line;
    }
    if (line.trim() === '') {
      return '<div class="h-2"></div>';
    }
    return `<span>${line}</span><br/>`;
  });

  return formattedLines.join('');
}
