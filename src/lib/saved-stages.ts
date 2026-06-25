import type { Stage } from '@prisma/client';

// Pipeline order (left → right on the board). Labels are translated in the UI
// via the `watchlist.stage.*` message keys.
export const STAGE_ORDER: Stage[] = ['LEAD', 'CONTACTED', 'NEGOTIATING', 'WON', 'LOST'];
