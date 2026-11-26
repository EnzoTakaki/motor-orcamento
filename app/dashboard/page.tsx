import type { Metadata } from 'next';
import { Dashboard } from '@/components/dashboard/Dashboard';

export const metadata: Metadata = { title: 'Dashboard · Motor de Orçamento' };

export default function PaginaDashboard() {
  return <Dashboard />;
}
