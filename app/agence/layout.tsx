import type { Metadata } from 'next';
import { AgenceFrame } from './AgenceFrame';
import './agence.css';

export const metadata: Metadata = { title: 'Agence hub — HuntPilote' };
export default function AgenceLayout({ children }: { children: React.ReactNode }) {
  return <AgenceFrame>{children}</AgenceFrame>;
}
