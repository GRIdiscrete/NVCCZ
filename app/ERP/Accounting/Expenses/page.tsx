'use client'
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiRefreshCw, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiDollarSign, FiUser, FiFileText, FiPlus, FiX } from 'react-icons/fi';
import ERP from "../../page";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// Type definitions
type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: string;
  children?: string[];
};

type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type JournalEntryLine = {
    id: string;
    journalEntryId: string;
    accountId: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    account?: {
      id: string;
      code: string;
      name: string;
      type: string;
    };
  };
  
  type JournalEntry = {
    id: string;
    referenceNumber: string;
    description: string;
    transactionDate: string;
    status: string;
    totalAmount: number;
    currencyId: string;
    currency: Currency;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    journalEntryLines?: JournalEntryLine[]; // Make this optional
  };

type Expense = {
  id: string;
  vendorId: string;
  categoryId: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  currencyId: string;
  transactionDate: string;
  description: string;
  receiptNumber: string;
  isTaxable: boolean;
  status: string;
  journalEntryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  category: Category;
  currency: Currency;
  journalEntry: JournalEntry;
};

type ExpenseFormData = {
    vendorId: string;
    categoryId: string;
    amount: string;
    currencyId: string;
    transactionDate: string;
    description: string;
    receiptNumber: string;
    isTaxable: boolean;
  };
  

type ApiResponse = {
  success: boolean;
  data: Expense[];
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState<ExpenseFormData>({
    vendorId: '',
    categoryId: '',
    amount: '',
    currencyId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptNumber: '',
    isTaxable: true
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);



    // Fetch dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
          setIsLoadingOptions(true);
          const token = sessionStorage.getItem('token');
          
          try {
            // Fetch vendors
            const vendorsRes = await fetch('https://nvccz-pi.vercel.app/api/accounting/vendors', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (vendorsRes.ok) {
              const vendorsData = await vendorsRes.json();
              setVendors(vendorsData.data || []);
            }
    
            // Fetch categories
            // Update the category fetch part in your useEffect
            const categoriesRes = await fetch('https://nvccz-pi.vercel.app/api/accounting/expense-categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                console.log('Categories API Response:', categoriesData); // Debug log
                
                // Ensure we're getting an array and it's not empty
                if (categoriesData.success && Array.isArray(categoriesData.data)) {
                const activeCategories = categoriesData.data.filter((cat: Category) => cat.isActive);
                console.log('Active Categories:', activeCategories); // Debug log
                setCategories(activeCategories);
                } else {
                console.warn('Categories data is not in expected format:', categoriesData);
                }
            } else {
                console.error('Failed to fetch categories:', categoriesRes.status);
            }
    
            // Fetch currencies
// Fetch currencies
            const currenciesRes = await fetch('https://nvccz-pi.vercel.app/api/accounting/currencies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (currenciesRes.ok) {
                const currenciesData = await currenciesRes.json();
                // Filter currencies to only include active ones
                const activeCurrencies = currenciesData.data.filter((c: Currency) => c.isActive);
                setCurrencies(activeCurrencies || []);
                // Set default currency if available (only from active currencies)
                const defaultCurrency = activeCurrencies.find((c: Currency) => c.isDefault);
                if (defaultCurrency) {
                setFormData(prev => ({ ...prev, currencyId: defaultCurrency.id }));
                }
            }
          } catch (error) {
            console.error('Error fetching options:', error);
          } finally {
            setIsLoadingOptions(false);
          }
        };
    
        if (isCreateModalOpen) {
          fetchOptions();
        }
      }, [isCreateModalOpen]);




  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/expenses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        if (data.success && data.data) {
          setExpenses(data.data);
          setTotalEntries(data.data.length);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        // toast.error(`Failed to fetch expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    console.log(formData)
    
    try {
      const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // toast.success('Expense created successfully');
        setIsCreateModalOpen(false);
        // Refresh expenses list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    //   toast.error(`Failed to create expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
      }).format(amount);
    } catch {
      return amount.toString();
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      POSTED: 'bg-green-100 text-green-800',
      PENDING: 'bg-amber-100 text-amber-800',
      DRAFT: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };

    const className = statusClasses[status as keyof typeof statusClasses] || statusClasses.default;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-light ${className}`}>
        {status || 'UNKNOWN'}
      </span>
    );
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = expenses.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  return (
    <>



{isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Create New Expense</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoadingOptions}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                {/* In your category dropdown */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoadingOptions}
                >
                    <option value="">Select Category ({categories.length} available)</option>
                    {categories.length > 0 ? (
                    categories.map(category => (
                        <option key={category.id} value={category.id}>
                        {category.name} ({category.id})
                        </option>
                    ))
                    ) : (
                    <option value="" disabled>No categories found</option>
                    )}
                </select>
                {isLoadingOptions && <p className="text-xs text-gray-500 mt-1">Loading categories...</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="currencyId"
                    value={formData.currencyId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoadingOptions}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Taxable */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isTaxable"
                    checked={formData.isTaxable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Is Taxable</label>
                </div>

                {/* Receipt Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-600 text-black rounded-md hover:bg-navy-700"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? 'Creating...' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-light text-gray-800 tracking-tight">Expenses</h1>
            <p className="text-gray-500 font-light">Track and manage company expenses</p>
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>

          <div>
       <button 
         onClick={() => setIsCreateModalOpen(true)}
         className="flex text-black items-center px-4 py-2 bg-navy-600  rounded-lg hover:bg-navy-700 transition-colors"
       >
         <FiPlus className="mr-2" />
         Create Expense
       </button>
     </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/50">
                  {currentEntries.map((expense) => (
                    <React.Fragment key={`fragment-${expense.id}`}>
                      <tr 
                        key={expense.id} 
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => toggleRow(expense.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-gray-400" />
                            {formatDate(expense.transactionDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-900">
                          {expense.vendor?.name || 'Unknown Vendor'}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 max-w-xs truncate">
                          {expense.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-900">
                          {expense.category?.name || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-900">
                          {formatCurrency(expense.totalAmount, expense.currency?.code || 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(expense.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-gray-500">
                          {expandedRows[expense.id] ? (
                            <FiChevronUp className="h-5 w-5" />
                          ) : (
                            <FiChevronDown className="h-5 w-5" />
                          )}
                        </td>
                      </tr>
                      {expandedRows[expense.id] && (
                        <tr key={`expense-details-${expense.id}`} className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Expense Details</h3>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Receipt Number:</span> {expense.receiptNumber || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Base Amount:</span> {formatCurrency(expense.amount, expense.currency?.code || 'USD')}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">VAT Amount:</span> {formatCurrency(expense.vatAmount, expense.currency?.code || 'USD')}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Taxable:</span> {expense.isTaxable ? 'Yes' : 'No'}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Vendor Information</h3>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Contact:</span> {expense.vendor?.contactPerson || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> {expense.vendor?.email || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Phone:</span> {expense.vendor?.phone || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tax Number:</span> {expense.vendor?.taxNumber || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              {expense.journalEntry && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Journal Entry</h3>
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                        {expense.journalEntry.referenceNumber}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                        {formatDate(expense.journalEntry.transactionDate)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {expense.journalEntry.description}
                                    </p>
                                    <div className="space-y-2">
                                        {expense.journalEntry.journalEntryLines?.map((line, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                            {line.account?.name || 'Unknown Account'} ({line.account?.code || 'N/A'})
                                            </span>
                                            <span className={line.debitAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                                            {line.debitAmount > 0 
                                                ? formatCurrency(line.debitAmount, expense.journalEntry.currency?.code || 'USD')
                                                : formatCurrency(line.creditAmount, expense.journalEntry.currency?.code || 'USD')}
                                            </span>
                                        </div>
                                        ))}
                                    </div>
                                    </div>
                                </div>
                                )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200/50">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-light rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-light rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-light text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastEntry, totalEntries)}</span> of{' '}
                    <span className="font-medium">{totalEntries}</span> entries
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-light text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-light
                          ${currentPage === page 
                            ? 'bg-navy-600 text-white border-navy-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-light text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Expenses;