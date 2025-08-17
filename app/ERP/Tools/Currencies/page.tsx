'use client'

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiMoreVertical, FiArrowLeft } from 'react-icons/fi';
import ERP from '../../page';
import { useRouter } from 'next/navigation';


interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Currency[];
  message?: string;
}

const Currencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);


  const router = useRouter();
  const handleBackClick = () => {
    router.push('/ERP/Tools');
  };


  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    isDefault: false,
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/currencies', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data: ApiResponse = await response.json();
        if (data.success) {
          setCurrencies(data.data);
        } else {
          setError(data.message || 'Failed to fetch currencies');
        }
      } catch (err) {
        setError('An error occurred while fetching currencies');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const toggleDropdown = (id: string) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleEditClick = (currency: Currency) => {
    setCurrentCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isDefault: currency.isDefault,
    });
    setIsEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      try {
        setDeletingId(id);
        const token = sessionStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`https://nvccz-pi.vercel.app/api/accounting/currencies/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const result = await response.json();
        if (result.success) {
          setCurrencies(currencies.filter(currency => currency.id !== id));
        } else {
          alert(result.message || 'Failed to delete currency');
        }
      } catch (err) {
        alert('An error occurred while deleting the currency');
      } finally {
        setDeletingId(null);
      }
    }
    setDropdownOpen(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = currentCurrency 
      ? `https://nvccz-pi.vercel.app/api/accounting/currencies/${currentCurrency.id}`
      : 'https://nvccz-pi.vercel.app/api/accounting/currencies';
    
    const method = currentCurrency ? 'PUT' : 'POST';

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        if (method === 'POST') {
          setCurrencies([...currencies, result.data]);
        } else {
          setCurrencies(currencies.map(c => 
            c.id === currentCurrency?.id ? result.data : c
          ));
        }
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="p-6 text-red-500">{error}</div>
      
    );
  }



  return (
    
      <div className="p-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
        <button
            onClick={handleBackClick}
            className="group flex items-center space-x-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:from-blue-100 hover:to-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:from-blue-900/30 dark:to-blue-800/30 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40"
            >
            <FiArrowLeft className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:-translate-x-1 dark:text-blue-400" />
            <span className="hidden text-sm font-medium text-blue-700 sm:inline-flex dark:text-blue-200">
                Back 
            </span>
            <span className="inline-flex text-sm font-medium text-blue-700 sm:hidden dark:text-blue-200">
                Back
            </span>
            </button>
          <h1 className="text-2xl font-semibold">Currencies</h1>
          <button 
            onClick={() => {
              setCurrentCurrency(null);
              setFormData({
                code: '',
                name: '',
                symbol: '',
                isDefault: false,
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> New Currency
          </button>
        </div>

        {/* Currencies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currencies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No currencies found
                    </td>
                  </tr>
                ) : (
                  currencies.map((currency) => (
                    <tr key={currency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {currency.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currency.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currency.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(currency.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currency.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {currency.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currency.isDefault ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {currency.isDefault ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button
                          onClick={() => toggleDropdown(currency.id)}
                          className="text-gray-500 hover:text-gray-700"
                          disabled={deletingId === currency.id}
                        >
                          {deletingId === currency.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                          ) : (
                            <FiMoreVertical />
                          )}
                        </button>
                        {dropdownOpen === currency.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditClick(currency)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <FiEdit2 className="mr-2" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(currency.id)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <FiTrash2 className="mr-2" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Currency Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create New Currency</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                      Code*
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="symbol">
                      Symbol*
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="mr-2"
                      disabled={submitting}
                    />
                    <label htmlFor="isDefault" className="text-gray-700 text-sm">
                      Set as default currency
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-20"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        'Create'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Currency Modal */}
        {isEditModalOpen && currentCurrency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Currency</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                      Code*
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="symbol">
                      Symbol*
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="mr-2"
                      disabled={submitting}
                    />
                    <label htmlFor="isDefault" className="text-gray-700 text-sm">
                      Set as default currency
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-20"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default Currencies;