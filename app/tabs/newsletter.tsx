'use client'

import emailjs from '@emailjs/browser';
import { User, Plus, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterData {
  success: boolean;
  data: Newsletter[];
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  data: UserData[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    name: string;
    value: boolean;
  }[];
}

interface UserResponse {
  success: boolean;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    role: Role;
  };
}


const NewsletterCarousel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newsletters, setNewsletters] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNewsletters();
    fetchUserRole();
  }, []);


  const fetchUserRole = async () => {
    try {
      setUserLoading(true);
      const token = sessionStorage.getItem('token');
      const userId = sessionStorage.getItem('userID');
      
      if (!token || !userId) {
        throw new Error('Authentication data not found');
      }

      const response = await fetch(`https://nvccz-pi.vercel.app/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      
      if (data.success && data.data.role.name === 'admin') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    } finally {
      setUserLoading(false);
    }
  };


  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setExpandedImage(null);
      }
    };

    if (expandedImage) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [expandedImage]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/newsletters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch newsletters: ${response.status}`);
      }

      const data: NewsletterData = await response.json();
      setNewsletters(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (): Promise<UserData[]> => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      return data.data;
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  };

  const EMAILJS_USER_ID = 'NgwZzNEQN_63SAnSw'; // Replace with your actual ID
  const EMAILJS_SERVICE_ID = 'service_miw5uzq';   // Replace with your service ID
  const EMAILJS_TEMPLATE_ID = 'template_pclaerv'; 

  const sendEmailNotifications = async (newsletterTitle: string, newsletterContent: string) => {
    try {
      const users = await fetchAllUsers();
      if (users.length === 0) {
        console.log('No users to notify');
        return;
      }
  
      // Initialize EmailJS
      emailjs.init(EMAILJS_USER_ID);
  
      await Promise.all(users.map(async (user) => {
        try {
          const templateParams = {
            to_name: user.firstName,
            to_email: user.email,
            subject: `New Newsletter: ${newsletterTitle}`,
            message: `A new newsletter has been published:\n\n${newsletterTitle}\n\n${newsletterContent}\n\nBest regards,\nThe Newsletter Team`
          };
  
          const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
          );
  
          console.log(`Email sent to ${user.email}`, response.status, response.text);
        } catch (err) {
          console.error(`Failed to send email to ${user.email}:`, err);
        }
      }));
  
      console.log('Email notifications sent successfully');
    } catch (err) {
      console.error('Error sending email notifications:', err);
      throw err; // Re-throw if you want to handle this in the calling function
    }
  };

  const handleCreateNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true); // Start loading
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
  
      const response = await fetch('https://nvccz-pi.vercel.app/api/newsletters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create newsletter: ${response.status}`);
      }
  
      // Send email notifications after successful creation
      await sendEmailNotifications(formData.title, formData.content);
  
      await fetchNewsletters();
      setShowCreateForm(false);
      setFormData({
        title: '',
        content: '',
        image: null
      });
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create newsletter');
    } finally {
      setIsCreating(false); // End loading
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  // Safe date parsing utility
  const parseDateSafe = (dateString: string): Date => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const nextSlide = () => {
    if (!newsletters) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === newsletters.data.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!newsletters) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? newsletters.data.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 text-red-300 rounded-lg max-w-2xl mx-auto">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-4xl w-full max-h-[90vh]"
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={expandedImage}
              alt="Expanded view"
              className="w-full h-full max-h-[80vh] object-contain"
            />
          </motion.div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Newsletters</h1>
        {!userLoading && isAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="min-w-[120px] flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-expanded={showCreateForm}
            aria-controls="create-newsletter"
          >
            {showCreateForm ? 'Close' : 'Create Newsletter'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <motion.div
          id="create-newsletter"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl p-6"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(55, 65, 81, 0.4)'
          }}
        >
          <h2 className="mb-4 text-xl font-bold text-white">Create New Newsletter</h2>
          <form onSubmit={handleCreateNewsletter} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="image" className="mb-1 block text-sm font-medium text-gray-300">
                Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-600">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Choose Image
                  </div>
                </label>
                {imagePreview && (
                  <div
                    className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-gray-600"
                    onClick={() => handleImageClick(imagePreview)}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setImagePreview(null);
                }}
                className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? 'Creating…' : 'Create Newsletter'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {!newsletters || !newsletters.success || newsletters.data.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No newsletters available
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          {/* Carousel container */}
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {newsletters.data.map((newsletter, index) => (
              <div 
                key={newsletter.id} 
                className="w-full flex-shrink-0 px-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl overflow-hidden shadow-lg"
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(55, 65, 81, 0.4)'
                  }}
                >
                  {/* Image section */}
                  {newsletter.imageUrl && (
                    <div 
                      className="h-48 w-full relative overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(newsletter.imageUrl!)}
                    >
                      <img
                        src={newsletter.imageUrl}
                        alt={newsletter.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 p-2 rounded-full">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Header with title and author */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">{newsletter.title}</h2>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <User className="w-4 h-4 mr-1" />
                        {newsletter.author.firstName} {newsletter.author.lastName}
                      </div>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">
                        {formatDistanceToNow(parseDateSafe(newsletter.createdAt))} ago
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-300 whitespace-pre-line">{newsletter.content}</p>
                  </div>

                  {/* Footer with actions */}
                  <div className="px-6 py-4 border-t border-gray-700 flex justify-between">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Like
                    </button>
                    
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 text-white p-2 rounded-full shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 text-white p-2 rounded-full shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {newsletters.data.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-blue-500' : 'bg-gray-500'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsletterCarousel;