import type { Metadata } from 'next';
import { ClientHubView } from '@/app/clients/ClientHubView';

export const metadata: Metadata = { title: 'Client Hub — HuntPilote' };

export default function ClientsPage() {
  return <ClientHubView />;
}
