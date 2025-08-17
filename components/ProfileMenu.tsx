'use client'

import { User, Settings, LogOut, Building2, LayoutDashboard, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: {
      name: string;
      value: boolean;
    }[];
  };
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
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
        if (data.success) {
          setUserData(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="p-2 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/80 transition-all"
      >
        <User className="w-5 h-5 text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              <p>Welcome back</p>
              <p className="font-medium text-white">
                {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-400">{userData?.email}</p>
            </div>
            
            <button
              onClick={() => {
                setShowProfileModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <User className="mr-3 h-4 w-4" />
              Profile 
            </button>
            
            <a
              href="/organization"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Building2 className="mr-3 h-4 w-4" />
              Organization Settings
            </a>
            
            {/* <a
              href="/ERP/Dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Accounting 
            </a> */}
            
               {/* <a
              href="https://nvccz-performance-management1.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Building2 className="mr-3 h-4 w-4" />
              Perfomance Management
            </a> */}
            <div className="border-t border-gray-700" />
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && userData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Profile Information</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-navy-600 flex items-center justify-center text-white text-2xl">
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-gray-400">{userData.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Role</h4>
                  <p className="text-white capitalize">{userData.role.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{userData.role.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Member Since</h4>
                  <p className="text-white">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {userData.role.permissions
                      .filter(permission => permission.value)
                      .map(permission => (
                        <div 
                          key={permission.name}
                          className="bg-gray-700/50 rounded px-3 py-1.5 text-sm text-gray-300"
                        >
                          {permission.name.replace(/_/g, ' ')}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}