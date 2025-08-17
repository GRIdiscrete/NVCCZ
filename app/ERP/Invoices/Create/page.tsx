'use client'
import { useState, useEffect } from 'react'
import { FiCalendar, FiPlus, FiX, FiDollarSign, FiUser, FiTrash2 } from 'react-icons/fi'
import ERP from "../../page"

// Type definitions
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
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type InvoiceItem = {
  description: string
  amount: number
  category: string
}

type InvoiceFormData = {
  customerId: string
  amount: string
  currencyId: string
  transactionDate: string
  description: string
  invoiceNumber: string
  isTaxable: boolean
  items: InvoiceItem[]
}

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

const CreateInvoice = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: '',
    amount: '',
    currencyId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    invoiceNumber: '',
    isTaxable: true,
    items: [{
      description: '',
      amount: 0,
      category: ''
    }]
  })

  // Fetch customers and currencies
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const token = sessionStorage.getItem('token')
      
      try {
        // Fetch customers
        // Fetch customers
        const customersResponse = await fetch('https://nvccz-pi.vercel.app/api/accounting/customers', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!customersResponse.ok) throw new Error('Failed to fetch customers')
        const customersData = await customersResponse.json()
        
        // Add more robust checking of the response structure
        if (customersData.success && customersData.data && Array.isArray(customersData.data.customers)) {
            setCustomers(customersData.data.customers)
        } else {
            console.error('Unexpected customers data format:', customersData)
            throw new Error('Unexpected customers data format')
        }

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
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'amount' ? Number(value) : value
    }
    setFormData(prev => ({
      ...prev,
      items: newItems,
      amount: newItems.reduce((sum, item) => sum + (item.amount || 0), 0).toString()
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0, category: '' }]
    }))
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      items: newItems,
      amount: newItems.reduce((sum, item) => sum + (item.amount || 0), 0).toString()
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true) // Set submitting state
    
    const token = sessionStorage.getItem('token')
    
    try {
      const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          items: formData.items.map(item => ({
            ...item,
            amount: Number(item.amount)
          }))
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
      if (data.success) {
        // Reset form on success
        setFormData({
          customerId: '',
          amount: '',
          currencyId: currencies.find(c => c.isDefault)?.id || '',
          transactionDate: new Date().toISOString().split('T')[0],
          description: '',
          invoiceNumber: '',
          isTaxable: true,
          items: [{ description: '', amount: 0, category: '' }]
        })
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    //   setError(error instanceof Error ? error.message : 'Failed to save invoice')
    } finally {
      setIsSubmitting(false) // Reset submitting state
    }
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">New Invoice</h1>
            <p className="text-gray-500 mt-1">Create and send professional invoices to your clients</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <FiX className="mr-2" /> Clear
            </button>
            <button
              type="submit"
              form="invoice-form"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors shadow-md flex items-center"
              disabled={isLoading}
            >
              {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <form 
            id="invoice-form"
            onSubmit={handleSubmit} 
            className="divide-y divide-gray-100"
          >
            {/* Client & Basic Info Section */}
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Client & Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Dropdown */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                      disabled={isLoading}
                    >
                      <option value="">{isLoading ? 'Loading clients...' : 'Select a client'}</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice #</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="INV-2025-001"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="transactionDate"
                      value={formData.transactionDate}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="currencyId"
                      value={formData.currencyId}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                      disabled={isLoading}
                    >
                      <option value="">{isLoading ? 'Loading currencies...' : 'Select currency'}</option>
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Taxable */}
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    name="isTaxable"
                    checked={formData.isTaxable}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">Include tax</label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes or terms"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Service or product"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Consulting"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          className="block w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        disabled={formData.items.length <= 1}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(parseFloat(formData.amount || '0'), formData.currencyId ? currencies.find(c => c.id === formData.currencyId)?.code || 'USD' : 'USD')}</span>
                  </div>
                  {formData.isTaxable && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax:</span>
                      <span>Calculated at payment</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {formatCurrency(parseFloat(formData.amount || '0'), formData.currencyId ? currencies.find(c => c.id === formData.currencyId)?.code || 'USD' : 'USD')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateInvoice