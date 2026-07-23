'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export default function MathRenderer({ content, className = '', inline = false }: MathRendererProps) {
  if (!content) return null;

  // Function to render math segments using katex
  const renderFormattedText = (text: string) => {
    // Regex for block math $$...$$ or \[...\] and inline math $...$ or \(...\)
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      let isBlockMath = false;
      let mathCode = '';

      if (part.startsWith('$$') && part.endsWith('$$')) {
        isBlockMath = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        isBlockMath = true;
        mathCode = part.slice(2, -2).trim();
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        mathCode = part.slice(1, -1).trim();
      } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        mathCode = part.slice(2, -2).trim();
      }

      if (mathCode) {
        try {
          const html = katex.renderToString(mathCode, {
            displayMode: isBlockMath,
            throwOnError: false,
          });
          return (
            <span
              key={idx}
              className={isBlockMath ? 'block my-3 text-center overflow-x-auto py-1' : 'inline-block px-1'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (_) {
          return <code key={idx} className="font-mono text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">{mathCode}</code>;
        }
      }

      // Render regular text, supporting line breaks
      return (
        <span key={idx}>
          {part.split('\n').map((line, lIdx, arr) => (
            <React.Fragment key={lIdx}>
              {line}
              {lIdx < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    });
  };

  const Component = inline ? 'span' : 'div';

  return (
    <Component className={`leading-relaxed ${className}`}>
      {renderFormattedText(content)}
    </Component>
  );
}

/**
 * Visual Diagram / Truth Table / Matrix Renderer
 */
export interface VisualDiagramData {
  type?: 'truthTable' | 'matrix' | 'logicGate' | 'flowchart' | 'equation' | 'svg' | 'image' | 'code';
  title?: string;
  content: string;
  headers?: string[];
  rows?: string[][];
  caption?: string;
}

export function VisualExplanationRenderer({ diagram }: { diagram: string | VisualDiagramData }) {
  if (!diagram) return null;

  if (typeof diagram === 'string') {
    // Check if string contains table syntax (| col | col |)
    if (diagram.includes('|') && diagram.includes('\n')) {
      const lines = diagram.trim().split('\n').filter((l) => !l.includes('---'));
      const rows = lines.map((l) => l.split('|').map((cell) => cell.trim()).filter(Boolean));
      if (rows.length > 0) {
        const headers = rows[0];
        const bodyRows = rows.slice(1);
        return (
          <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 font-bold border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                      <MathRenderer content={h} inline />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bodyRows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className={`p-3 border-r last:border-r-0 border-slate-100 dark:border-slate-800 font-mono ${
                        cIdx === r.length - 1 ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        <MathRenderer content={cell} inline />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Default string math or text diagram
    return (
      <div className="my-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <MathRenderer content={diagram} />
      </div>
    );
  }

  // Object visual diagram
  const { type, title, content, headers, rows, caption } = diagram;

  return (
    <div className="my-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <span>{type === 'truthTable' ? '📊 Truth Table' : type === 'matrix' ? '🔢 Matrix Representation' : type === 'logicGate' ? '⚡ Logic Gate Circuit' : '📐 Diagram / Formula'}</span>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 capitalize">{title}</span>
          </h4>
        </div>
      )}

      {type === 'truthTable' && headers && rows ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold border-b border-slate-200 dark:border-slate-700">
                {headers.map((h, i) => (
                  <th key={i} className="p-3 border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                    <MathRenderer content={h} inline />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {rows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  {r.map((c, cIdx) => (
                    <td key={cIdx} className={`p-3 font-mono border-r last:border-r-0 border-slate-100 dark:border-slate-850 ${
                      cIdx === r.length - 1 ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      <MathRenderer content={c} inline />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : type === 'matrix' && rows ? (
        <div className="flex justify-center my-4">
          <div className="inline-flex items-center px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border-x-4 border-y border-slate-800 dark:border-slate-200 shadow-md font-mono text-sm">
            <div className="grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${rows[0]?.length || 1}, minmax(0, 1fr))` }}>
              {rows.flatMap((r, rIdx) =>
                r.map((c, cIdx) => (
                  <div key={`${rIdx}-${cIdx}`} className="p-2 font-bold text-slate-800 dark:text-slate-100">
                    <MathRenderer content={c} inline />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <MathRenderer content={content} />
        </div>
      )}

      {caption && <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">{caption}</p>}
    </div>
  );
}
