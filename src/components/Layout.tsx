import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { useAdminStore } from '@/stores/adminStore'

export const Layout = memo(() => {
  const { lang } = useAdminStore()

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </div>
  )
})

Layout.displayName = 'Layout'

