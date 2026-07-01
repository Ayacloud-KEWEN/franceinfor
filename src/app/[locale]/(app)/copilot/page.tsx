import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { CopilotChat } from '@/components/copilot/copilot-chat';
import { CopilotOrchestrator } from '@/components/copilot/orchestrator';

export const dynamic = 'force-dynamic';

export default async function CopilotPage() {
  const t = await getTranslations('copilot');
  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <CopilotOrchestrator />
      <CopilotChat />
    </div>
  );
}
