'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdminDashboard } from '@/admin-panel/admin-dashboard'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdminHashRoute, setIsAdminHashRoute] = useState(false)

  useEffect(() => {
    function updateAdminRoute() {
      setIsAdminHashRoute(
        window.location.pathname === '/' &&
          window.location.hash.toLowerCase() === '#admin-panel',
      )
    }

    updateAdminRoute()
    window.addEventListener('hashchange', updateAdminRoute)
    window.addEventListener('popstate', updateAdminRoute)
    return () => {
      window.removeEventListener('hashchange', updateAdminRoute)
      window.removeEventListener('popstate', updateAdminRoute)
    }
  }, [pathname])

  if (isAdminHashRoute) return <AdminDashboard />

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
