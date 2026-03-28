'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button, Card } from '../components/ui';

export default function SocialLinksListPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/contact-config');
  }, [router]);

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mạng xã hội đã được gộp</h1>
        <p className="text-sm text-slate-500">Quản lý link mạng xã hội tại trang Cấu hình Liên hệ.</p>
      </div>
      <Link href="/admin/contact-config">
        <Button className="gap-2">
          Đi tới Cấu hình Liên hệ
          <ArrowRight size={16} />
        </Button>
      </Link>
    </Card>
  );
}
