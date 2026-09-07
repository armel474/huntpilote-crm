import type { Metadata } from 'next';
import { OnboardingView } from '@/app/onboarding/OnboardingView';

export const metadata: Metadata = { title: 'Onboarding client — HuntPilote' };

export default function OnboardingPage() {
  return <OnboardingView />;
}
