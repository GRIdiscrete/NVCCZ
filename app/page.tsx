'use client'

import ProfileMenu from "@/components/ProfileMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { EventsData, NewsletterData, PostsData } from "@/types.db";
import Posts from "./tabs/posts";
import EventsCalendar from "./tabs/calendar";
import NewsletterCarousel from "./tabs/newsletter";
import FeedPage from "./tabs/feeds";
import Dashboard from "./tabs/dashboard";
import { ChatbotProvider } from "@/components/chatbot";
import HomepageSidebar from "@/components/HomepageSidebar";
import SocialMediaLinks from "@/components/mediapages/SocialMediaLinks";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("feed");
  const [logged, setLogged] = useState(false);
  const router = useRouter();

  // Mock data objects
  const eventsData: EventsData = {
    success: true,
    data: [
      {
        "id": "clx1234567890abcdef",
        "title": "Company Annual Meeting",
        "description": "Annual company meeting for all employees",
        "startDate": "2024-12-25T09:00:00.000Z",
        "endDate": "2024-12-25T17:00:00.000Z",
        "location": "Main Conference Room",
        "authorId": "clx1234567890abcdef",
        "author": {
          "id": "clx1234567890abcdef",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "isActive": true,
        "createdAt": "2025-08-03T12:17:54.136Z",
        "updatedAt": "2025-08-03T12:17:54.136Z"
      }
    ]
  };


  useEffect(() => {
    const isSessionActive = sessionStorage.getItem('userID');
    if (isSessionActive) {
      setLogged(true);
      setShowWelcome(false);
      setContentVisible(true);
    } else {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setContentVisible(false);
      }, 3000);
      router.push('/auth')
      return () => clearTimeout(timer);
    }
  }, []);

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const tabVariants: Variants = {
    inactive: { 
      scale: 1,
      transition: { duration: 0.2 }
    },
    active: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <ChatbotProvider position="bottom-right">
      <div className="flex min-h-screen bg-slate-700">
        {/* Sidebar */}
        <HomepageSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Right Social Media Links - Fixed Position */}
          <SocialMediaLinks />
          
          {/* Welcome Splash Screen */}
          <AnimatePresence mode="wait">
            {showWelcome && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, rgba(51, 65, 85, 1) 100%)`,
                }}
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center"
                >
                  <motion.h1 
                    className="text-5xl font-bold text-white mb-4"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to NVCCZ
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-blue-200"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Loading your experience...
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div 
            className={`flex flex-col items-center justify-start min-h-screen p-4 transition-opacity duration-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              background: `
                radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
                linear-gradient(to bottom right, #334155, #475569, #3b82f6)
              `,
              backgroundAttachment: 'fixed'
            }}
          >
            {/* Top-right controls (sticky) */}
            <div className="w-full sticky top-4 z-40 flex items-center justify-end gap-3">
              <div className="rounded-xl border border-slate-700/50 bg-[rgba(30,41,59,0.6)] backdrop-blur px-3 py-2 shadow-xl flex items-center gap-3">
                <div className="h-5 w-px bg-slate-600/60" />
                <ProfileMenu />
              </div>
            </div>
            
            <Tabs 
              defaultValue="feed" 
              className="w-[95%] max-w-none"
              onValueChange={(value) => setCurrentTab(value)}
            >
              <TabsList 
                className="grid w-full grid-cols-5 gap-2 p-2 rounded-xl mb-8" 
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {['feed', 'dashboard', 'newsletter', 'forum', 'calendar'].map((tabValue) => (
                  <TabsTrigger key={tabValue} value={tabValue} asChild>
                    <motion.button
                      className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                      variants={tabVariants}
                      initial="inactive"
                      animate={currentTab === tabValue ? "active" : "inactive"}
                      whileHover="hover"
                      style={{
                        color: '#d1d5db',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <span className="relative z-10 capitalize">{tabValue}</span>
                      <span 
                        className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                        style={{
                          background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                        }}
                      />
                    </motion.button>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div 
                className="p-6 rounded-xl shadow-xl relative min-h-[300px]"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(55, 65, 81, 0.4)'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={contentVariants}
                  >
                    {currentTab === "feed" && (
                      <TabsContent value="feed" className="text-gray-300">
                        <FeedPage />
                      </TabsContent>
                    )}
                    
                    {currentTab === "dashboard" && (
                      <TabsContent value="dashboard" className="text-gray-300">
                        <Dashboard />
                      </TabsContent>
                    )}
                    
                    {currentTab === "newsletter" && (
                      <TabsContent value="newsletter" className="text-gray-300">
                        <NewsletterCarousel />
                      </TabsContent>
                    )}
                    
                    {currentTab === "forum" && (
                      <TabsContent value="forum" className="text-gray-300">
                        <Posts />
                      </TabsContent>
                    )}
                    
                    {currentTab === "calendar" && (
                      <TabsContent value="calendar" className="text-gray-300">
                        <EventsCalendar events={eventsData} />
                      </TabsContent>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </ChatbotProvider>
  );
}
