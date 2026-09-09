import type { Metadata } from 'next';
import { PositionTrackingView } from '@/app/outils/position-tracking/PositionTrackingView';

export const metadata: Metadata = { title: 'Position Tracking — HuntPilote' };

export default function PositionTrackingPage() {
  return <PositionTrackingView />;
}
