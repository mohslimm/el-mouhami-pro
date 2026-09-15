import { memo } from 'react'
import { AdminOverviewModule } from '@/components/admin/AdminOverviewModule'

export const Dashboard = memo(() => {
  return <AdminOverviewModule />
})

Dashboard.displayName = 'Dashboard'

