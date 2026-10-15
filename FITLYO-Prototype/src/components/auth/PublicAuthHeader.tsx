import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

interface PublicAuthHeaderProps {
  action?: ReactNode
}

export function PublicAuthHeader({ action }: PublicAuthHeaderProps) {
  return (
    <header className="fitlyo-glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-18 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link to="/" aria-label="FITLYO - Trang chủ">
          <BrandLogo className="h-8 w-auto sm:h-9" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {action}
        </div>
      </div>
    </header>
  )
}
