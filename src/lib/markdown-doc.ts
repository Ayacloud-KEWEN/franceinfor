// Minimal Markdown → HTML, and a Word-openable (.doc) document wrapper.
// Zero dependencies: a .doc is just an HTML file with Office namespaces that
// Word / Google Docs / Pages open as an editable, formatted document. Used to
// export reports, tender responses and outreach drafts as client-ready docs.

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
}

// Inline: **bold** and [text](url) links.
function inline(text: string): string {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_m, t, u) => `<a href="${u}">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}

export function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  let listOpen = false;
  const closeList = () => { if (listOpen) { out.push('</ul>'); listOpen = false; } };

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.trim().startsWith('|') && lines[i + 1]?.includes('---')) {
      closeList();
      const header = line.split('|').map((s) => s.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].split('|').map((s) => s.trim()).filter(Boolean));
        i++;
      }
      out.push('<table><thead><tr>' + header.map((h) => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>');
      for (const r of rows) out.push('<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
      out.push('</tbody></table>');
      continue;
    }

    if (line.startsWith('### ')) { closeList(); out.push(`<h3>${inline(line.slice(4))}</h3>`); }
    else if (line.startsWith('## ')) { closeList(); out.push(`<h2>${inline(line.slice(3))}</h2>`); }
    else if (line.startsWith('# ')) { closeList(); out.push(`<h1>${inline(line.slice(2))}</h1>`); }
    else if (/^\s*[-*]\s/.test(line)) {
      if (!listOpen) { out.push('<ul>'); listOpen = true; }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s/, ''))}</li>`);
    }
    else if (/^\s*\d+\.\s/.test(line)) { closeList(); out.push(`<p style="margin-left:1em">${inline(line)}</p>`); }
    else if (line.trim() === '') { closeList(); }
    else { closeList(); out.push(`<p>${inline(line)}</p>`); }
    i++;
  }
  closeList();
  return out.join('\n');
}

// Full Word-compatible HTML document. Open in Word/Docs/Pages → editable.
export function buildWordDoc(md: string, title: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body { font-family: Calibri, Arial, "PingFang SC", "Microsoft YaHei", sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 20pt; color: #0f172a; }
  h2 { font-size: 14pt; color: #1d4ed8; margin-top: 16pt; }
  h3 { font-size: 12pt; color: #0f172a; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  th, td { border: 1px solid #cbd5e1; padding: 4pt 8pt; text-align: left; font-size: 10.5pt; }
  th { background: #f1f5f9; }
  a { color: #1d4ed8; }
  .fg-header { border-bottom: 2px solid #1d4ed8; padding-bottom: 6pt; margin-bottom: 12pt; color: #64748b; font-size: 9pt; }
</style></head>
<body>
<div class="fg-header">FranceGo · ${esc(title)}</div>
${mdToHtml(md)}
</body></html>`;
}
