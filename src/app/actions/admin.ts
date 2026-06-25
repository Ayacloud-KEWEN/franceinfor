'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/admin';
import type { LeadStatus } from '@prisma/client';

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST'];

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) throw new Error('forbidden');
  if (!STATUSES.includes(status)) throw new Error('invalid_status');

  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/${admin.locale}/admin`);
}
