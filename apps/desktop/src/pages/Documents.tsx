import { memo } from 'react'
import { AdminDossiersModule } from '@/components/admin/AdminDossiersModule'

export const Documents = memo(() => {
  return <AdminDossiersModule />
})

Documents.displayName = 'Documents'

