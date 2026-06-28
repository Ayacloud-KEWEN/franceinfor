'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { saveDraftJsonAction } from '@/app/actions/playbooks-admin';
import { Save, Loader2, Check } from 'lucide-react';

// Minimal-loop editor: edit the playbook's raw JSON, validate on save. Authority
// names and reference URLs live here for the admin to verify before publishing.
export function PlaybookEditor({ id, initialJson }: { id: string; initialJson: string }) {
  const [json, setJson] = useState(initialJson);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function format() {
    try {
      setJson(JSON.stringify(JSON.parse(json), null, 2));
      setMsg(null);
    } catch {
      setMsg({ ok: false, text: 'Invalid JSON — cannot format.' });
    }
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('json', json);
      const res = await saveDraftJsonAction(fd);
      setMsg(res.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: `Error: ${res.error}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />} Save draft
        </Button>
        <Button size="sm" variant="outline" onClick={format}>Format JSON</Button>
        {msg && (
          <span className={`flex items-center gap-1 text-xs ${msg.ok ? 'text-primary' : 'text-destructive'}`}>
            {msg.ok ? <Check size={13} /> : null} {msg.text}
          </span>
        )}
      </div>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        rows={28}
        className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
      />
    </div>
  );
}
