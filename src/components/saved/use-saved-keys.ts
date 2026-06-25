'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ItemType } from '@prisma/client';

export type SavedItemDTO = {
  id: string;
  type: ItemType;
  refId: string;
  label: string;
};

const key = (type: ItemType, refId: string) => `${type}:${refId}`;

// Fetches the user's saved items once and exposes a fast membership check.
// Shared across all SaveButtons on a page via the react-query cache.
export function useSavedKeys() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['saved-keys'],
    queryFn: async (): Promise<SavedItemDTO[]> => {
      const res = await fetch('/api/saved');
      if (!res.ok) return [];
      const json = await res.json();
      return json.items ?? [];
    },
    staleTime: 30_000,
  });

  const set = new Set((data ?? []).map((i) => key(i.type, i.refId)));
  return {
    isSaved: (type: ItemType, refId: string) => set.has(key(type, refId)),
    invalidate: () => qc.invalidateQueries({ queryKey: ['saved-keys'] }),
  };
}
