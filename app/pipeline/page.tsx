import type { Metadata } from 'next';
import { PipelineView } from '@/app/pipeline/PipelineView';

export const metadata: Metadata = { title: 'Pipeline commercial — HuntPilote' };

export default function PipelinePage() {
  return <PipelineView />;
}
