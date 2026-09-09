import type { Metadata } from 'next';
import { SiteAuditView } from '@/app/outils/site-audit/SiteAuditView';

export const metadata: Metadata = { title: 'Site Audit — HuntPilote' };

export default function SiteAuditPage() {
  return <SiteAuditView />;
}
