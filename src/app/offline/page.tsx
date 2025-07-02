import { Metadata } from 'next';
import OfflineClient from './OfflineClient';

export const metadata: Metadata = {
  title: 'Offline - Blog',
  description: 'You are currently offline. Access cached content.',
};

export default function OfflinePage() {
  return <OfflineClient />;
} 