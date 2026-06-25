// Minimal markdown renderer for report previews (headings, tables, lists, bold).
import React from 'react';

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table block
    if (line.trim().startsWith('|') && lines[i + 1]?.includes('---')) {
      const header = line.split('|').map((s) => s.trim()).filter(Boolean);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].split('|').map((s) => s.trim()).filter(Boolean));
        i++;
      }
      out.push(
        <table key={key++} className="my-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {header.map((h, j) => (
                <th key={j} className="py-1.5 pr-4 font-medium">{inline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-border/60">
                {r.map((c, ci) => (
                  <td key={ci} className="py-1.5 pr-4">{inline(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    if (line.startsWith('### ')) out.push(<h3 key={key++} className="mt-4 text-base font-semibold">{inline(line.slice(4))}</h3>);
    else if (line.startsWith('## ')) out.push(<h2 key={key++} className="mt-5 text-lg font-bold text-primary">{inline(line.slice(3))}</h2>);
    else if (line.startsWith('# ')) out.push(<h1 key={key++} className="text-2xl font-bold">{inline(line.slice(2))}</h1>);
    else if (/^\d+\.\s/.test(line)) out.push(<div key={key++} className="ml-4 text-sm">{inline(line)}</div>);
    else if (line.startsWith('- ')) out.push(<div key={key++} className="ml-4 text-sm">• {inline(line.slice(2))}</div>);
    else if (line.trim() === '') out.push(<div key={key++} className="h-2" />);
    else out.push(<p key={key++} className="text-sm text-muted-foreground">{inline(line)}</p>);
    i++;
  }

  return <div className="space-y-1 leading-relaxed">{out}</div>;
}
