'use client'
import React, { useState, useEffect, useMemo } from 'react'
import ERP from "../../page";
import { FiEdit, FiTrash2, FiEye, FiFileText, FiDollarSign, FiCalendar, 
         FiUser, FiChevronUp, FiChevronDown, FiRefreshCw, FiSearch, FiX, 
         FiFilter} from 'react-icons/fi'
import Link from 'next/link'

type InvoiceItem = {
  amount: number
  category: string
  description: string
}

type JournalEntry = {
  id: string
  referenceNumber: string
  status: string
}

type Customer = {
  id: string
  name: string
  taxNumber: string
  contactPerson: string
  email: string
  phone: string
  address: string
  paymentTerms: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Currency = {
  id: string
  code: string
  name: string
  symbol: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

type Invoice = {
  id: string
  customerId: string
  amount: string
  vatAmount: string
  totalAmount: string
  currencyId: string
  transactionDate: string
  description: string
  items: InvoiceItem[]
  invoiceNumber: string
  isTaxable: boolean
  status: string
  isActive: boolean
  journalEntryId: string
  createdById: string
  createdAt: string
  updatedAt: string
  customer: Customer
  currency: Currency
  journalEntry: JournalEntry
}

type ApiResponse = {
  success: boolean
  message: string
  data: {
    invoices: Invoice[]
  }
}

const formatCurrency = (amount: string, currencyCode: string = 'USD', currencySymbol: string = '$') => {
  const numericAmount = parseFloat(amount)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount)
  } catch {
    return `${currencySymbol} ${numericAmount.toFixed(2)}`
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  VOID: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-yellow-100 text-yellow-800'
}

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'VOID', label: 'Void' },
  { value: 'PENDING', label: 'Pending' }
]

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const fetchInvoices = async () => {
    setIsLoading(true)
    setIsRefreshing(true)
    const token = sessionStorage.getItem('token')
    
    try {
      const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch invoices')
      
      const data: ApiResponse = await response.json()
      
      if (data.success && data.data?.invoices && Array.isArray(data.data.invoices)) {
        setInvoices(data.data.invoices)
        const initialExpandedState = data.data.invoices.reduce((acc, invoice) => {
          acc[invoice.id] = false
          return acc
        }, {} as Record<string, boolean>)
        setExpandedRows(initialExpandedState)
      } else {
        throw new Error('Unexpected data format')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }


  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`https://nvccz-pi.vercel.app/api/accounting/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update invoice status');
      
      const data = await response.json();
      
      if (data.success) {
        setInvoices(prev => prev.map(invoice => 
          invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
        ));
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update invoice status');
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.totalAmount.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  useEffect(() => {
    fetchInvoices()
  }, [])

  const toggleRow = (invoiceId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [invoiceId]: !prev[invoiceId]
    }))
  }

  const handleRefresh = () => {
    fetchInvoices()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    const token = sessionStorage.getItem('token')
    try {
      const response = await fetch(`https://nvccz-pi.vercel.app/api/accounting/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to delete invoice')
      
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))
    } catch (error) {
      console.error('Error deleting invoice:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete invoice')
    }
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
            <p className="text-gray-500 mt-1">Manage and view all your invoices</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by client, invoice #, or amount"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            

            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
            </div>
            <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
            >
                {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="py-2">
                    {option.label}
                </option>
                ))}
            </select>
            </div>
            
            <div>
              <button
                onClick={clearFilters}
                disabled={searchTerm === '' && statusFilter === 'ALL'}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FiX className="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right"
            >
              <FiX />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expand
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <React.Fragment key={`fragment-${invoice.id}`}>
                        <tr 
                          key={`summary-${invoice.id}`}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleRow(invoice.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invoice.customer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(invoice.transactionDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(invoice.totalAmount, invoice.currency.code, invoice.currency.symbol)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRow(invoice.id)
                                }}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50"
                              >
                                {expandedRows[invoice.id] ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedRows[invoice.id] && (
                          <tr key={`details-${invoice.id}`} className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Details</h3>
                                  <div className="space-y-2">
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Invoice ID:</span> {invoice.id}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Created:</span> {formatDate(invoice.createdAt)}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Description:</span> {invoice.description || 'N/A'}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Tax Status:</span> {invoice.isTaxable ? 'Taxable' : 'Non-taxable'}
                                    </p>
                                    {invoice.isTaxable && (
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700">VAT Amount:</span> {formatCurrency(invoice.vatAmount, invoice.currency.code, invoice.currency.symbol)}
                                      </p>
                                    )}
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Journal Entry:</span> {invoice.journalEntry?.referenceNumber} ({invoice.journalEntry?.status})
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Client Details</h3>
                                  <div className="space-y-2">
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Client ID:</span> {invoice.customer.id}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Contact:</span> {invoice.customer.contactPerson}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Email:</span> {invoice.customer.email}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Phone:</span> {invoice.customer.phone}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Tax Number:</span> {invoice.customer.taxNumber}
                                    </p>
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">Line Items</h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {invoice.items.map((item, index) => (
                                          <tr key={index}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {formatCurrency(item.amount.toString(), invoice.currency.code, invoice.currency.symbol)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <select
                                    value={invoice.status}
                                    onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                    {Object.entries(statusColors).map(([status, _]) => (
                                        <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                    </select>

                                    <button
                                    onClick={() => deleteInvoice(invoice.id)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    >
                                    <FiTrash2 className="mr-1" /> Delete
                                    </button>
                                </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        {invoices.length === 0 ? 'No invoices found' : 'No invoices match your search criteria'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Invoices