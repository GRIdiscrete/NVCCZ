'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  LineChart, 
  Building2, 
  Box, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const navItems = [
    { name: 'Organization Overview', path: '/funds', icon: LayoutDashboard },
    { name: 'Fund Performance', path: '/single_fund', icon: LineChart },
    { name: 'Company Performance', path: '/company', icon: Building2 },
    { name: 'Applications', path: '/applications', icon: Box },
  ]

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Modern Sidebar */}
      <div 
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-[#1e3a8a] tracking-tight">
              NVCCZ
            </h1>
          ) : (
            <div className="w-6 h-6" /> 
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[#e0e7ff] text-[#1e3a8a] transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="transition-transform duration-300" />
            ) : (
              <ChevronLeft size={20} className="transition-transform duration-300" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    isCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isActive(item.path) 
                      ? 'bg-[#e0e7ff] text-[#1e3a8a] font-medium shadow-sm' 
                      : 'text-[#4b5563] hover:bg-[#e0e7ff] hover:text-[#1e3a8a]'
                  }`}
                >
                  <item.icon 
                    className={`w-5 h-5 flex-shrink-0 ${
                      isCollapsed ? '' : 'mr-3'
                    } ${
                      isActive(item.path) ? 'text-[#1e3a8a]' : 'text-[#6b7280] group-hover:text-[#1e3a8a]'
                    }`} 
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap text-sm">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-[#e5e7eb] ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#1e3a8a] flex-shrink-0">
              <span className="text-sm font-medium">JD</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[#111827] truncate">John Doe</p>
                <p className="text-xs text-[#6b7280]">Admin</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Top Navigation */}
        <header className="bg-white border-b border-[#e5e7eb] p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-[#111827]">
            {navItems.find(item => isActive(item.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors duration-200 text-[#4b5563] hover:text-[#111827]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors duration-200 text-[#4b5563] hover:text-[#111827] relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-[#e5e7eb] mx-1"></div>
            <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#1e3a8a]">
                <span className="text-sm font-medium">JD</span>
              </div>
              {!isCollapsed && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f9fafb]">
          {children}
        </main>
      </div>
    </div>
  )
}