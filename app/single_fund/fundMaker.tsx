"use client";

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type FundMakerProps = {
  createFundAction: (
    prevState: { success: boolean; message: string } | null,
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

const FundMaker = ({ createFundAction }: FundMakerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction] = useActionState(createFundAction, null);

  // Close modal on successful submission
  if (state?.success) {
    setTimeout(() => setIsModalOpen(false), 2000);
  }

  return (
    <div className="mb-6">
      {/* Create Fund Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/50"
        >
          Create New Fund
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Create New Fund</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {state && !state.success && (
                <div className="mb-4 p-3 bg-red-100/90 text-red-700 rounded-md backdrop-blur-sm">
                  {state.message}
                </div>
              )}

              {state?.success && (
                <div className="mb-4 p-3 bg-green-100/90 text-green-700 rounded-md backdrop-blur-sm">
                  {state.message}
                </div>
              )}

              <form action={formAction}>
                <div className="mb-4">
                  <label htmlFor="fund_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Fund Name
                  </label>
                  <input
                    type="text"
                    id="fund_name"
                    name="fund_name"
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Value (USD)
                  </label>
                  <input
                    type="number"
                    id="value"
                    name="value"
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 backdrop-blur-sm"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="commencement" className="block text-sm font-medium text-gray-700 mb-1">
                    Commencement Date
                  </label>
                  <input
                    type="date"
                    id="commencement"
                    name="commencement"
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                    Sector
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/70 backdrop-blur-sm"
                    required
                  >
                    <option value="">Select a sector</option>
                    <option value="Finance">Finance</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100/80 hover:bg-gray-200/90 transition-colors rounded-md backdrop-blur-sm shadow-sm"
                  >
                    Cancel
                  </button>
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-700/90 text-white transition-colors rounded-md backdrop-blur-sm shadow-sm flex items-center"
      disabled={pending}
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating...
        </>
      ) : 'Create Fund'}
    </button>
  );
};

export default FundMaker;