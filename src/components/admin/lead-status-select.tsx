'use client';

import { useTransition } from 'react';
import { updateLeadStatus } from '@/app/actions/admin';
import type { LeadStatus } from '@prisma/client';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST'];

export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [pending, start] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => start(() => updateLeadStatus(id, e.target.value as LeadStatus))}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
