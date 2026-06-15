'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import UserAccountNav from './UserAccountNav'
import Cart from './Cart'
import { User } from '@/payload-types'

interface MobileNavProps {
  user: User | null
}

const MobileNav = ({ user }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const pathname = usePathname()

  console.log('MobileNav user:', user)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden')
    else document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-red-700 transition-colors duration-200"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div>
      {/* Overlay */}
      <div className="relative z-40 lg:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300" onClick={() => setIsOpen(false)} />
      </div>

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 z-40 w-4/5 max-w-sm flex transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="flex flex-col w-full bg-[#070A16] shadow-2xl border-r border-red-900">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/20">
            <span className="text-white font-semibold text-lg">Menu</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-red-700 hover:bg-red-900/20 transition-colors duration-200"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-4 px-6 py-6 overflow-y-auto">
            {user ? (
              <div className="flow-root">
                <UserAccountNav user={user} />
              </div>
            ) : (
              <>
                <div className="flow-root">
                  <Link
                    onClick={() => closeOnCurrent('/sign-in')}
                    href="/sign-in"
                    className="block py-3 px-4 text-white font-medium text-lg rounded-md hover:bg-red-900/20 hover:text-red-700 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </div>
                <div className="flow-root">
                  <Link
                    onClick={() => closeOnCurrent('/sign-up')}
                    href="/sign-up"
                    className="block py-3 px-4 text-white font-medium text-lg rounded-md hover:bg-red-900/20 hover:text-red-700 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Cart Section */}
          <div className="border-t border-gray-200/20 px-6 py-6">
            <div className="flow-root">
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNav