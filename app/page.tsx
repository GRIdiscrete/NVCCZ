'use client'

import ProfileMenu from "@/components/ProfileMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import Newsletter from "./tabs/newsletter";
import { EventsData, NewsletterData, PostsData } from "@/types.db";
import Posts from "./tabs/posts";
import EventsCalendar from "./tabs/calendar";
import NewsletterCarousel from "./tabs/newsletter";
import FeedPage from "./tabs/feeds";
import Dashboard from "./tabs/dashboard";
import { ChatbotProvider } from "@/components/chatbot";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("feed");
  const [logged, setLogged] = useState(false);
  const router = useRouter(); // Make sure to import useRouter from 'next/router'

  const data: NewsletterData = {
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

  const eventsData: EventsData = {
    success: true,
    data: [
      {
        "id": "clx1234567890abcdef",
        "title": "Company Annual Meeting",
        "description": "Annual company meeting for all employees",
        "startDate": "2025-08-25T09:00:00.000Z",
        "endDate": "2025-08-25T17:00:00.000Z",
        "location": "Main Conference Room",
        "authorId": "clx1234567890abcdef",
        "author": {
          "id": "clx1234567890abcdef",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "isActive": true,
        "createdAt": "2025-08-03T12:49:27.562Z",
        "updatedAt": "2025-08-03T12:49:27.562Z"
      }
    ]
  };

  const postsData: PostsData = {
    success: true,
    data: [
      {
        "id": "clx1234567890abcdef",
        "title": "Important Company Announcement",
        "content": "This is the content of the post...",
        "authorId": "clx1234567890abcdef",
        "author": {
          "id": "clx1234567890abcdef",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "expiresAt": "2024-12-31T23:59:59.000Z",
        "isNotified": true,
        "isActive": true,
        "createdAt": "2025-08-03T12:46:52.798Z",
        "updatedAt": "2025-08-03T12:46:52.798Z",
        "replies": [
          {
            "id": "clx1234567890abcdef",
            "content": "This is a reply to the post...",
            "postId": "clx1234567890abcdef",
            "authorId": "clx1234567890abcdef",
            "author": {
              "id": "clx1234567890abcdef",
              "firstName": "Jane",
              "lastName": "Smith",
              "email": "jane@example.com"
            },
            "parentReplyId": "clx1234567890abcdef",
            "parentReply": "string",
            "replies": [
              "string"
            ],
            "createdAt": "2025-08-03T12:46:52.798Z",
            "updatedAt": "2025-08-03T12:46:52.798Z"
          }
        ]
      }
    ]
  };


  
  useEffect(() => {
    // Check session storage on initial load
    const userId = sessionStorage.getItem('userID');
    if (!userId) {
      setLogged(false);
      router.push('/auth'); 
      return;
    } else {
      setLogged(true);
    }
  
    // Only proceed with welcome animation if user is logged in
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setContentVisible(true);
    }, 2000);
  
    return () => clearTimeout(timer);
  }, [router]); // Add router to dependency array

  const tabVariants: Variants = {
    inactive: {
      y: 0,
      opacity: 0.8,
      transition: { duration: 0.2 }
    },
    active: {
      y: -3,
      opacity: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      transition: { duration: 0.1 }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <ChatbotProvider position="bottom-right">
      <>
        {/* Welcome Splash Screen */}
        {showWelcome && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000"
            style={{
              background: `
                radial-gradient(ellipse at center, rgba(29, 78, 216, 0.3) 0%, rgba(15, 23, 42, 1) 100%)
              `,
            }}
          >
            <div className="text-center animate-pulse">
              <h1 className="text-5xl font-bold text-white mb-4">Welcome to NVCCZ</h1>
              <p className="text-xl text-blue-200">Loading your experience...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div 
          className={`flex flex-col items-center justify-start min-h-screen p-4 transition-opacity duration-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            background: `
              radial-gradient(ellipse at top left, rgba(29, 78, 216, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(30, 58, 138, 0.25) 0%, transparent 50%),
              linear-gradient(to bottom right, #0f172a, #1e293b, #1e3a8a)
            `,
            backgroundAttachment: 'fixed'
          }}
        >
        {/* Profile Menu */}
        <ProfileMenu />
        
        <Tabs 
          defaultValue="feed" 
          className="w-full max-w-[90%]"
          onValueChange={(value) => setCurrentTab(value)}
        >
          <TabsList className="grid w-full grid-cols-5 gap-2 p-2 rounded-xl mb-8" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(55, 65, 81, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)'
          }}>
            <TabsTrigger value="feed" asChild>
              <motion.button
                className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                variants={tabVariants}
                initial="inactive"
                animate={currentTab === "feed" ? "active" : "inactive"}
                whileHover="hover"
                style={{
                  color: '#d1d5db',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="relative z-10">Feed</span>
                <span 
                  className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                  }}
                />
                <span 
                  className="absolute inset-0 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(30, 58, 138, 0)',
                    border: '1px solid transparent'
                  }}
                />
              </motion.button>
            </TabsTrigger>
            
            <TabsTrigger value="dashboard" asChild>
              <motion.button
                className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                variants={tabVariants}
                initial="inactive"
                animate={currentTab === "dashboard" ? "active" : "inactive"}
                whileHover="hover"
                style={{
                  color: '#d1d5db',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="relative z-10">Dashboard</span>
                <span 
                  className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                  }}
                />
              </motion.button>
            </TabsTrigger>
            
            <TabsTrigger value="newsletter" asChild>
              <motion.button
                className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                variants={tabVariants}
                initial="inactive"
                animate={currentTab === "newsletter" ? "active" : "inactive"}
                whileHover="hover"
                style={{
                  color: '#d1d5db',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="relative z-10">Newsletter</span>
                <span 
                  className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                  }}
                />
              </motion.button>
            </TabsTrigger>
            
            <TabsTrigger value="forum" asChild>
              <motion.button
                className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                variants={tabVariants}
                initial="inactive"
                animate={currentTab === "forum" ? "active" : "inactive"}
                whileHover="hover"
                style={{
                  color: '#d1d5db',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="relative z-10">Forum</span>
                <span 
                  className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                  }}
                />
              </motion.button>
            </TabsTrigger>
            
            <TabsTrigger value="calendar" asChild>
              <motion.button
                className="relative overflow-hidden rounded-lg px-6 py-3 text-sm font-medium group w-full"
                variants={tabVariants}
                initial="inactive"
                animate={currentTab === "calendar" ? "active" : "inactive"}
                whileHover="hover"
                style={{
                  color: '#d1d5db',
                  backgroundColor: 'transparent'
                }}
              >
                <span className="relative z-10">Calendar</span>
                <span 
                  className="absolute inset-0 opacity-0 rounded-lg transition-opacity duration-300 group-data-[state=active]:opacity-100" 
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)'
                  }}
                />
              </motion.button>
            </TabsTrigger>
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
                    <FeedPage/>
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
                      <Posts  />
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
      </>
    </ChatbotProvider>
  );
}