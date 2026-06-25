import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar isAdmin={user.role === 'ADMIN'} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user.name || user.email} isAdmin={user.role === 'ADMIN'} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
