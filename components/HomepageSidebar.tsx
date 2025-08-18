import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { 
  FaBook, 
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from 'react-icons/fa';

// Navigation items - only Accounting and Performance Management
const NAV_ITEMS = [
  { 
    id: 'accounting', 
    label: 'Accounting', 
    icon: FaBook, 
    isActive: false, 
    type: 'single',
    description: 'Financial Reports',
    href: '/ERP/Dashboard',
    isExternal: false
  },
  { 
    id: 'performance', 
    label: 'Performance Management', 
    icon: FaChartLine, 
    isActive: false, 
    type: 'single',
    description: 'Analytics & KPIs',
    href: 'https://nvccz-performance-management1.vercel.app/',
    isExternal: true
  },
];

export default function HomepageSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileScreen = window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileScreen);
      
      // On mobile, default to closed; on desktop, default to open
      if (isMobileScreen) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleExternalClick = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    <motion.aside
        data-sidebar
        animate={{ width: isOpen ? 200 : (isMobile ? 0 : 50) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`h-screen flex flex-col bg-card border-r border-border shadow-sm overflow-hidden ${
          isMobile ? 'fixed left-0 top-0 z-50' : 'sticky top-0'
        } ${isMobile && !isOpen ? 'md:flex hidden' : ''}`}
        style={{ minWidth: isOpen ? 200 : (isMobile ? 0 : 50) }}
      >
      {/* Header Section */}
      <div className="flex flex-col items-center py-3 border-b border-border">
        {/* Logo/Brand Area */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="mb-3 text-center"
            >
              <div className='flex items-center gap-3'>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">N</span>
                </div>
                <p className="text-xs text-muted-foreground">NVCCZ Dashboard</p>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          className="p-1.5 rounded-lg bg-secondary border border-border hover:bg-accent hover:border-primary/30 transition-all duration-300"
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isOpen ? 
              <FaChevronLeft className="text-primary hover:text-primary/80" size={12} /> : 
              <FaChevronRight className="text-primary hover:text-primary/80" size={12} />
            }
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-2 py-3">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredSection(item.id)}
              onHoverEnd={() => setHoveredSection(null)}
              className="relative"
            >
                <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  key="expanded"
                  >
                  {item.isExternal ? (
                    <button
                    onClick={() => handleExternalClick(item.href)}
                    className="group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 text-foreground hover:bg-accent border-l-4 border-transparent hover:border-l-4 hover:border-primary w-full text-left"
                    >
                    <div className="flex-shrink-0">
                      <item.icon 
                      className="text-primary group-hover:text-primary/80"
                      size={14} 
                      />
                    </div>

                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <span className="font-light text-foreground group-hover:text-accent-foreground text-xs">
                        {item.label}
                      </span>
                      <FaExternalLinkAlt 
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                        size={8}
                      />
                    </div>
                    </button>
                  ) : (
                    <Link href={item.href} className="block">
                    <div className="group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 text-foreground hover:bg-accent border-l-4 border-transparent hover:border-l-4 hover:border-primary">
                      <div className="flex-shrink-0">
                      <item.icon 
                        className="text-primary group-hover:text-primary/80"
                        size={14} 
                      />
                      </div>

                      <div className="min-w-0 flex-1">
                      <span className="font-light text-foreground group-hover:text-accent-foreground text-xs">
                        {item.label}
                      </span>
                      </div>
                    </div>
                    </Link>
                  )}
                  </motion.div>
                ) : (
                  <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                  title={item.label}
                  key="collapsed"
                  >
                  {item.isExternal ? (
                    <button
                    onClick={() => handleExternalClick(item.href)}
                    className="group relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent w-full"
                    >
                    <div className="flex items-center justify-center">
                      <item.icon 
                      className="text-blue-400 group-hover:text-blue-300"
                      size={16} 
                      />
                    </div>
                    </button>
                  ) : (
                    <Link href={item.href}>
                    <div className="group relative p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent">
                      <div className="flex items-center justify-center">
                      <item.icon 
                        className="text-primary group-hover:text-primary/80"
                        size={16} 
                      />
                      </div>
                    </div>
                    </Link>
                  )}
                  </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="px-2 py-2 border-t border-border">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="text-center"
              key="footer-expanded"
            >
              <div className="text-xs text-muted-foreground">NVCCZ Dashboard</div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
              key="footer-collapsed"
            >
              <div className="w-5 h-5 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">N</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.aside>
    </>
  );
}