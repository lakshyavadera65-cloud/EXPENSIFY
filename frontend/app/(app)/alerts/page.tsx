import type { Metadata } from 'next'
import { AlertsView } from '@/components/alerts/alerts-view'

export const metadata: Metadata = { title: 'Alerts & Notifications' }

export default function AlertsPage() {
  return <AlertsView />
}
