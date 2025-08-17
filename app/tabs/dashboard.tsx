'use client'

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Activity, Target, Award, Download, Plus, ChevronDown, Building2, ArrowLeftRight, X } from 'lucide-react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
}

interface UserResponse {
  success: boolean;
  data: UserData;
}

interface TargetData {
  id: string;
  type: string;
  value: string;
  deadline: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    backgroundImage: string;
    createdAt: string;
    updatedAt: string;
    lastSeen: string;
  };
}

interface TargetsResponse {
  success: boolean;
  data: TargetData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('Choose Target');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [firstTarget, setFirstTarget] = useState('Choose Target');
  const [secondTarget, setSecondTarget] = useState('Choose Target');
  const [comparisonStartDate, setComparisonStartDate] = useState('2024-01-01');
  const [daysToInclude, setDaysToInclude] = useState('3000');
  
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Targets data state
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  
  // Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetFormData, setTargetFormData] = useState({
    type: 'Sales',
    value: '',
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    fetchTargets();
  }, []);

  const fetchUserData = async () => {
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
      if (data.success) {
        setUserData(data.data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      setTargetsLoading(true);
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/targets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.status}`);
      }

      const data: TargetsResponse = await response.json();
      if (data.success) {
        setTargets(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch targets');
      }
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setTargetsLoading(false);
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://nvccz-pi.vercel.app/api/targets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: targetFormData.type,
          value: parseFloat(targetFormData.value),
          deadline: new Date(targetFormData.deadline).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create target: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Add the new target to the existing targets array
        setTargets(prev => [result.data, ...prev]);
        
        // Reset form and close modal
        setTargetFormData({
          type: 'Sales',
          value: '',
          deadline: ''
        });
        setShowTargetModal(false);
      } else {
        throw new Error(result.message || 'Failed to create target');
      }
    } catch (err) {
      console.error('Error creating target:', err);
      alert(err instanceof Error ? err.message : 'Failed to create target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTargetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTargetName = (target: TargetData) => {
    const deadline = new Date(target.deadline).toLocaleDateString();
    const value = parseFloat(target.value).toLocaleString();
    return `${target.type} - $${value} (Due: ${deadline})`;
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Good morning, {userData ? `${userData.firstName} ${userData.lastName}` : 'admin'}
          </h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowTargetModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">+ Set Target</span>
          </button>
          
          <div className="relative">
            <select 
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="appearance-none flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 text-sm pr-8"
            >
              <option value="Choose Target">Choose Target</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {formatTargetName(target)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Target Per Month Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Target Per Month</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-green-400 text-sm font-medium">Progress: 0.0%</p>
            </div>
            <div className="text-right">
              <p className="text-blue-400 text-sm font-medium">Total: 0</p>
            </div>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No revenue data available.</p>
            <p className="text-gray-500 text-sm">Try selecting a different date range or target.</p>
          </div>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Date Range:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Start Date:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-gray-300 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">End Date:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-gray-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Target Comparison Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Target Comparison</h3>
        
        {/* Dropdown Menus */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <select 
              value={firstTarget}
              onChange={(e) => setFirstTarget(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 text-sm pr-8"
            >
              <option value="Choose Target">Choose Target</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {formatTargetName(target)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select 
              value={secondTarget}
              onChange={(e) => setSecondTarget(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg transition-all duration-200 text-gray-300 text-sm pr-8"
            >
              <option value="Choose Target">Choose Target</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {formatTargetName(target)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Comparison Chart Placeholder */}
        <div className="h-48 bg-gray-700/30 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Select two targets to compare.</p>
            <p className="text-gray-500 text-xs">Choose from the dropdown menus above.</p>
          </div>
        </div>
        
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Start Date:</span>
            <input 
              type="date" 
              value={comparisonStartDate}
              onChange={(e) => setComparisonStartDate(e.target.value)}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-gray-300 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Days to Include:</span>
            <input 
              type="number" 
              value={daysToInclude}
              onChange={(e) => setDaysToInclude(e.target.value)}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-gray-300 text-sm w-20"
            />
          </div>
        </div>
      </div>

                                                       {/* Target Creation Modal */}
         {showTargetModal && (
           <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div 
             className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl"
             style={{
               backdropFilter: 'blur(12px)',
               border: '1px solid rgba(55, 65, 81, 0.4)'
             }}
           >
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-white">Create New Target</h2>
               <button 
                 onClick={() => setShowTargetModal(false)}
                 className="text-gray-400 hover:text-white transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>

             <form onSubmit={handleTargetSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Target Type*
                   </label>
                   <select
                     name="type"
                     value={targetFormData.type}
                     onChange={handleInputChange}
                     className="w-full p-3 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                     required
                     disabled={isSubmitting}
                   >
                     <option value="Sales">Sales</option>
                     <option value="Revenue">Revenue</option>
                     <option value="Expenses">Expenses</option>
                     <option value="Profit">Profit</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Target Value*
                   </label>
                   <input
                     type="number"
                     name="value"
                     value={targetFormData.value}
                     onChange={handleInputChange}
                     className="w-full p-3 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                     placeholder="0.00"
                     step="0.01"
                     min="0"
                     required
                     disabled={isSubmitting}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Deadline*
                 </label>
                 <input
                   type="date"
                   name="deadline"
                   value={targetFormData.deadline}
                   onChange={handleInputChange}
                   className="w-full p-3 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                   required
                   disabled={isSubmitting}
                 />
               </div>

               <div className="flex space-x-4 pt-6 border-t border-gray-700">
                 <button
                   type="button"
                   onClick={() => setShowTargetModal(false)}
                   className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                   disabled={isSubmitting}
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 font-medium"
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Creating...
                     </div>
                   ) : (
                     'Create Target'
                   )}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
};

export default Dashboard; 