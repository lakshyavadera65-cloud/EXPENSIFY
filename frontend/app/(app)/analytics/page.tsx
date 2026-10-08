import type { Metadata } from 'next'
import { AnalyticsView } from '@/components/analytics/analytics-view'

export const metadata: Metadata = {
  title: 'Analytics | EXPENSIFY',
  description: 'Spending analytics, category breakdowns, and reports calculated by Java Spring Boot.',
}

export default function AnalyticsPage() {
  return <AnalyticsView />
}
