import { memo } from 'react'
import { AdminContactsModule } from '@/components/admin/AdminContactsModule'

export const Contacts = memo(() => {
  return <AdminContactsModule />
})

Contacts.displayName = 'Contacts'
