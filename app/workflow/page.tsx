import type { Metadata } from 'next';
import { WorkflowView } from '@/app/workflow/WorkflowView';

export const metadata: Metadata = { title: 'Workflow & Automatisations — HuntPilote' };

export default function WorkflowPage() {
  return <WorkflowView />;
}
