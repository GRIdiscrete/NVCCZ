'use client'

import { useRouter } from "next/navigation";
import ERP from "../../page";
import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight, FiFolder, FiDollarSign, FiCreditCard, FiTrendingUp, FiTrendingDown, FiPieChart, FiRefreshCw } from 'react-icons/fi';

type Account = {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  data: Account[];
};

const ChartOfAccounts = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});
    const router = useRouter()

    useEffect(() => {
        const fetchChartOfAccounts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/chart-of-accounts', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: ApiResponse = await response.json();
                
                if (data.success) {
                    setAccounts(data.data);
                    // Initialize all account types as expanded by default
                    const types = [...new Set(data.data.map(account => account.accountType))];
                    const initialExpandedState = types.reduce((acc, type) => {
                        acc[type] = true;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setExpandedTypes(initialExpandedState);
                } else {
                    throw new Error('Failed to fetch chart of accounts');
                }
            } catch (error) {
                console.error('Error fetching chart of accounts:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchChartOfAccounts();
    }, []);

    const toggleAccountType = (type: string) => {
        setExpandedTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const getIconForAccountType = (type: string) => {
        switch(type) {
            case 'ASSET':
                return <FiTrendingUp className="text-blue-600" size={20} />;
            case 'LIABILITY':
                return <FiTrendingDown className="text-red-600" size={20} />;
            case 'EQUITY':
                return <FiPieChart className="text-purple-600" size={20} />;
            case 'REVENUE':
                return <FiDollarSign className="text-green-600" size={20} />;
            case 'EXPENSE':
                return <FiCreditCard className="text-amber-600" size={20} />;
            default:
                return <FiFolder className="text-gray-600" size={20} />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const accountTypes = [...new Set(accounts.map(account => account.accountType))];

    return (
        <>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-light text-gray-800 tracking-tight">Chart of Accounts</h1>
                        <p className="text-gray-500 font-light">Hierarchical view of all accounts in your accounting system</p>
                    </div>
                    <button 
                        className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        <FiRefreshCw className="mr-2" />
                        Refresh
                    </button>
                </div>
    
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
    
              
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"> {/* Changed to items-start */}
                    {accountTypes.map((type) => (
                        <div 
                            key={type} 
                            className="bg-white rounded-xl border border-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300/50"
                        >
                            <div 
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() => toggleAccountType(type)}
                            >
                                <div className="flex items-center">
                                    {getIconForAccountType(type)}
                                    <h3 className="ml-3 text-lg font-light text-gray-800 tracking-tight">
                                        {type.charAt(0) + type.slice(1).toLowerCase()} Accounts
                                    </h3>
                                </div>
                                <div className="text-gray-400 transition-transform duration-200">
                                    {expandedTypes[type] ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                                </div>
                            </div>
                            
                            <div 
                                className={`transition-all duration-300 ease-in-out ${
                                    expandedTypes[type] 
                                        ? 'max-h-[400px] overflow-y-auto border-t border-gray-200/50' 
                                        : 'max-h-0 overflow-hidden'
                                }`}
                            >
                                {accounts
                                    .filter(account => account.accountType === type)
                                    .map(account => (
                                        <div 
                                            key={account.id} 
                                            className="p-4 hover:bg-gray-50/80 transition-colors"
                                            onClick={() => {

                                                sessionStorage.setItem('account', account.id)
                                                router.push('/ERP/Reports/ChartofAccounts/Single')
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-light text-gray-800">
                                                        {account.accountName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Code: {account.accountCode}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Created: {formatDate(account.createdAt)}
                                                    </p>
                                                </div>
                                                <button 
                                                    className="px-3 py-1 text-xs bg-navy-50 text-navy-600 rounded-md hover:bg-navy-100 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Account clicked:', account.id);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </>
);
}
 
export default ChartOfAccounts;