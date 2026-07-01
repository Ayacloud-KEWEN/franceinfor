'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveDraftJsonAction, publishCheckedAction } from '@/app/actions/playbooks-admin';
import type { RawPlaybook, RawTask, PlaybookRef } from '@/lib/data/playbooks';
import {
  Save, Loader2, Check, Plus, Trash2, Rocket, Link2, AlertTriangle, ShieldCheck,
} from 'lucide-react';

type LS = { en: string; fr: string; zh: string };
type LSA = { en: string[]; fr: string[]; zh: string[] };
const LOCS: (keyof LS)[] = ['en', 'fr', 'zh'];
const emptyLS = (): LS => ({ en: '', fr: '', zh: '' });
const emptyLSA = (): LSA => ({ en: [], fr: [], zh: [] });
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

type LinkResult = { url: string; ok: boolean; status: number | null; error?: string };

const inputCls = 'w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm';
const labelCls = 'text-xs font-medium text-muted-foreground';

// ---- small field editors ----
function LSField({ label, value, onChange }: { label: string; value: LS; onChange: (v: LS) => void }) {
  return (
    <div className="space-y-1">
      <div className={labelCls}>{label}</div>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {LOCS.map((l) => (
          <input
            key={l}
            className={inputCls}
            placeholder={l.toUpperCase()}
            value={value?.[l] ?? ''}
            onChange={(e) => onChange({ ...emptyLS(), ...value, [l]: e.target.value })}
          />
        ))}
      </div>
    </div>
  );
}

function LSAField({ label, value, onChange }: { label: string; value: LSA; onChange: (v: LSA) => void }) {
  const t = useTranslations('admin.editor');
  const v = value ?? emptyLSA();
  return (
    <div className="space-y-1">
      <div className={labelCls}>{label} <span className="opacity-60">({t('oneperline')})</span></div>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {LOCS.map((l) => (
          <textarea
            key={l}
            rows={3}
            className={inputCls + ' font-mono'}
            placeholder={l.toUpperCase()}
            value={(v[l] ?? []).join('\n')}
            onChange={(e) => onChange({ ...emptyLSA(), ...v, [l]: e.target.value.split('\n') })}
          />
        ))}
      </div>
    </div>
  );
}

function RefEditor({ refs, onChange }: { refs: PlaybookRef[]; onChange: (r: PlaybookRef[]) => void }) {
  const t = useTranslations('admin.editor');
  const list = refs ?? [];
  return (
    <div className="space-y-1">
      <div className={labelCls}>{t('references')}</div>
      {list.map((r, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            className={inputCls + ' max-w-[40%]'}
            placeholder={t('refLabel')}
            value={r.label}
            onChange={(e) => { const n = clone(list); n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
          />
          <input
            className={inputCls}
            placeholder="https://..."
            value={r.url}
            onChange={(e) => { const n = clone(list); n[i] = { ...n[i], url: e.target.value }; onChange(n); }}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(list.filter((_, j) => j !== i))}>
            <Trash2 size={13} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { label: '', url: '' }])}>
        <Plus size={13} /> {t('addReference')}
      </Button>
    </div>
  );
}

// ---- main editor ----
export function PlaybookEditor({ id, initialJson }: { id: string; initialJson: string }) {
  const router = useRouter();
  const t = useTranslations('admin.editor');
  const [obj, setObj] = useState<RawPlaybook>(() => JSON.parse(initialJson));
  const [tab, setTab] = useState<'form' | 'json' | 'verify'>('form');
  const [jsonText, setJsonText] = useState(initialJson);
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // verification state
  const [links, setLinks] = useState<Record<string, LinkResult>>({});
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [publishing, setPublishing] = useState(false);

  const set = (patch: Partial<RawPlaybook>) => setObj((o) => ({ ...o, ...patch }));
  const setTask = (i: number, patch: Partial<RawTask>) =>
    setObj((o) => { const tasks = clone(o.tasks); tasks[i] = { ...tasks[i], ...patch }; return { ...o, tasks }; });

  const authorities = useMemo(() => {
    const s = new Set<string>();
    for (const t of obj.tasks ?? []) { if (t.authority) s.add(t.authority); if (t.permit) s.add(t.permit); }
    return Array.from(s);
  }, [obj]);

  const urls = useMemo(() => {
    const s = new Set<string>();
    for (const r of obj.references ?? []) if (r.url) s.add(r.url);
    for (const t of obj.tasks ?? []) for (const r of t.references ?? []) if (r.url) s.add(r.url);
    return Array.from(s);
  }, [obj]);

  const allConfirmed =
    [...authorities, ...urls].length > 0 &&
    [...authorities, ...urls].every((k) => confirmed[k]) &&
    urls.every((u) => links[u]?.ok !== false);

  // keep JSON tab in sync when switching away from it / saving
  function syncJsonFromObj() { setJsonText(JSON.stringify(obj, null, 2)); }
  function applyJsonToObj(): boolean {
    try { setObj(JSON.parse(jsonText)); setJsonError(''); return true; }
    catch (e) { setJsonError((e as Error).message); return false; }
  }

  function switchTab(next: 'form' | 'json' | 'verify') {
    if (tab === 'json') { if (!applyJsonToObj()) return; }
    if (next === 'json') syncJsonFromObj();
    setTab(next);
  }

  async function save() {
    setSaving(true); setMsg(null);
    const raw = tab === 'json' ? jsonText : JSON.stringify(obj);
    if (tab === 'json' && !applyJsonToObj()) { setSaving(false); return; }
    try {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('json', raw);
      const res = await saveDraftJsonAction(fd);
      setMsg(res.ok ? { ok: true, text: t('saved') } : { ok: false, text: res.error ?? '' });
    } finally { setSaving(false); }
  }

  async function checkLinks() {
    setChecking(true);
    try {
      const res = await fetch('/api/admin/check-links', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const json = await res.json();
      const map: Record<string, LinkResult> = {};
      for (const r of (json.results as LinkResult[]) ?? []) map[r.url] = r;
      setLinks(map);
    } finally { setChecking(false); }
  }

  async function publish() {
    setPublishing(true); setMsg(null);
    try {
      // save current edits first, then publish with server-side link gate
      const fd = new FormData(); fd.set('id', id); fd.set('json', JSON.stringify(obj));
      await saveDraftJsonAction(fd);
      const res = await publishCheckedAction(id);
      if (res.ok) { router.push('../playbooks'); router.refresh(); }
      else if (res.error === 'broken_links') setMsg({ ok: false, text: `${t('brokenLinks')}: ${res.brokenLinks?.join(', ')}` });
      else setMsg({ ok: false, text: res.error ?? '' });
    } finally { setPublishing(false); }
  }

  return (
    <div className="space-y-3">
      {/* tab bar + save */}
      <div className="flex flex-wrap items-center gap-2">
        {(['form', 'json', 'verify'] as const).map((tb) => (
          <Button key={tb} size="sm" variant={tab === tb ? 'default' : 'outline'} onClick={() => switchTab(tb)}>
            {tb === 'verify' ? t('tabVerify') : tb === 'json' ? t('tabJson') : t('tabForm')}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {msg && (
            <span className={`flex items-center gap-1 text-xs ${msg.ok ? 'text-primary' : 'text-destructive'}`}>
              {msg.ok ? <Check size={13} /> : <AlertTriangle size={13} />} {msg.text}
            </span>
          )}
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />} {t('saveDraft')}
          </Button>
        </div>
      </div>

      {tab === 'form' && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <div className={labelCls}>{t('slug')}</div>
              <Input value={obj.slug ?? ''} onChange={(e) => set({ slug: e.target.value })} />
            </div>
            <div className="space-y-1">
              <div className={labelCls}>{t('sector')}</div>
              <Input value={obj.sector ?? ''} onChange={(e) => set({ sector: e.target.value })} />
            </div>
          </div>
          <LSField label={t('titleField')} value={obj.title} onChange={(v) => set({ title: v })} />
          <LSField label={t('summary')} value={obj.summary} onChange={(v) => set({ summary: v })} />
          <LSAField label={t('applicableTo')} value={obj.applicableTo} onChange={(v) => set({ applicableTo: v })} />
          <LSAField label={t('prerequisites')} value={obj.prerequisites} onChange={(v) => set({ prerequisites: v })} />

          {/* tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{t('tasks')} ({obj.tasks?.length ?? 0})</div>
              <Button type="button" variant="outline" size="sm"
                onClick={() => set({ tasks: [...(obj.tasks ?? []), { id: '', name: emptyLS(), description: emptyLS() }] })}>
                <Plus size={13} /> {t('addTask')}
              </Button>
            </div>
            {(obj.tasks ?? []).map((task, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <input className={inputCls + ' max-w-[200px]'} placeholder={t('taskId')}
                    value={task.id} onChange={(e) => setTask(i, { id: e.target.value })} />
                  <Button type="button" variant="ghost" size="sm" className="ml-auto"
                    onClick={() => set({ tasks: (obj.tasks ?? []).filter((_, j) => j !== i) })}>
                    <Trash2 size={13} />
                  </Button>
                </div>
                <LSField label={t('name')} value={task.name} onChange={(v) => setTask(i, { name: v })} />
                <LSField label={t('description')} value={task.description} onChange={(v) => setTask(i, { description: v })} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className={labelCls}>{t('authority')}</div>
                    <input className={inputCls} value={task.authority ?? ''} onChange={(e) => setTask(i, { authority: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <div className={labelCls}>{t('permit')}</div>
                    <input className={inputCls} value={task.permit ?? ''} onChange={(e) => setTask(i, { permit: e.target.value })} />
                  </div>
                </div>
                <LSField label={t('cost')} value={task.cost ?? emptyLS()} onChange={(v) => setTask(i, { cost: v })} />
                <LSField label={t('timeline')} value={task.timeline ?? emptyLS()} onChange={(v) => setTask(i, { timeline: v })} />
                <LSAField label={t('documents')} value={task.documents ?? emptyLSA()} onChange={(v) => setTask(i, { documents: v })} />
                <LSAField label={t('risks')} value={task.risks ?? emptyLSA()} onChange={(v) => setTask(i, { risks: v })} />
                <div className="space-y-1">
                  <div className={labelCls}>{t('dependsOn')}</div>
                  <input className={inputCls} value={(task.dependsOn ?? []).join(', ')}
                    onChange={(e) => setTask(i, { dependsOn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </div>
                <RefEditor refs={task.references ?? []} onChange={(r) => setTask(i, { references: r })} />
              </div>
            ))}
          </div>

          <LSAField label={t('overallRisks')} value={obj.risks} onChange={(v) => set({ risks: v })} />
          <LSField label={t('estCost')} value={obj.estCost} onChange={(v) => set({ estCost: v })} />
          <LSField label={t('estTimeline')} value={obj.estTimeline} onChange={(v) => set({ estTimeline: v })} />
          <RefEditor refs={obj.references ?? []} onChange={(r) => set({ references: r })} />
          <div className="space-y-1">
            <div className={labelCls}>{t('keywords')}</div>
            <input className={inputCls} value={(obj.keywords ?? []).join(', ')}
              onChange={(e) => set({ keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </div>
        </div>
      )}

      {tab === 'json' && (
        <div className="space-y-1">
          {jsonError && <p className="text-xs text-destructive">{t('invalidJson')}: {jsonError}</p>}
          <textarea value={jsonText} spellCheck={false} rows={28}
            onChange={(e) => setJsonText(e.target.value)} onBlur={applyJsonToObj}
            className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
        </div>
      )}

      {tab === 'verify' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium"><ShieldCheck size={15} /> {t('verifyHeading')}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('verifyDesc')}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="text-sm font-semibold">{t('refLinks')} ({urls.length})</div>
              <Button size="sm" variant="outline" onClick={checkLinks} disabled={checking || !urls.length}>
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 size={13} />} {t('checkLinks')}
              </Button>
            </div>
            <div className="space-y-1">
              {urls.map((u) => {
                const r = links[u];
                return (
                  <label key={u} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
                    <input type="checkbox" checked={!!confirmed[u]}
                      onChange={(e) => setConfirmed((c) => ({ ...c, [u]: e.target.checked }))} />
                    <span className="flex-1 truncate font-mono">{u}</span>
                    {r && (
                      <span className={r.ok ? 'text-primary' : 'text-destructive'}>
                        {r.ok ? `OK ${r.status ?? ''}` : `✗ ${r.error ?? r.status ?? 'broken'}`}
                      </span>
                    )}
                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">{t('open')}</a>
                  </label>
                );
              })}
              {!urls.length && <p className="text-xs text-muted-foreground">{t('noUrls')}</p>}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-sm font-semibold">{t('authorities')} ({authorities.length})</div>
            <div className="space-y-1">
              {authorities.map((a) => (
                <label key={a} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
                  <input type="checkbox" checked={!!confirmed[a]}
                    onChange={(e) => setConfirmed((c) => ({ ...c, [a]: e.target.checked }))} />
                  <span className="flex-1">{a}</span>
                </label>
              ))}
              {!authorities.length && <p className="text-xs text-muted-foreground">{t('noAuthorities')}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={publish} disabled={!allConfirmed || publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket size={14} />} {t('publish')}
            </Button>
            {!allConfirmed && (
              <span className="text-xs text-muted-foreground">{t('publishHint')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
