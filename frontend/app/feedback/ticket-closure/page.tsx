'use client'

import { useState, useEffect, FormEvent } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Customer {
  name: string;
  email: string;
  mobile: string;
  service_date: string;
}

export default function TicketClosureFeedbackPage() {
  const [token, setToken] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    supportSatisfaction: '',
    resolutionSatisfied: '',
    comments: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");

    if (!tokenParam) {
      setTokenError("Invalid feedback link. Token is missing.");
      setValidating(false);
      return;
    }

    setToken(tokenParam);

    fetch(`${API_BASE_URL}/api/feedback/validate/${tokenParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.valid) {
          setCustomer(data.customer);
          setFormData((prev) => ({ ...prev, name: data.customer.name }));
        } else {
          setTokenError(data.message || "Invalid or expired token");
        }
      })
      .catch(() => setTokenError("Failed to validate token"))
      .finally(() => setValidating(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'comments') {
      setCharCount(value.length)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const feedbackData = {
        token,
        name: formData.name,
        support_satisfaction: formData.supportSatisfaction ? parseInt(formData.supportSatisfaction) : 0,
        resolution_satisfied: formData.resolutionSatisfied,
        comments: formData.comments || ''
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        alert('Thank you for your feedback! Your response has been submitted successfully.')
      } else {
        setError(result.message || 'Failed to submit feedback')
        alert('Error: ' + (result.message || 'Failed to submit feedback'))
      }
    } catch (err) {
      setError('Network error. Please try again.')
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your feedback link...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">{tokenError}</p>
          <p className="text-sm text-gray-500">
            This feedback link may have expired or already been used.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            We appreciate your time and input!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-10 md:p-12">
        <div className="text-center mb-6">
          <img 
            src="/smg-og.png" 
            alt="Store My Goods Logo" 
            className="inline-block h-20 sm:h-24 w-auto"
          />
        </div>
        
        <div className="border-b border-gray-300 mb-6"></div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
          Ticket Closure Feedback
        </h1>
        
        <div className="border-b-2 border-gray-900 mb-8 sm:mb-12"></div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Please enter your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="border-t pt-6 sm:pt-8">
            <label className="block text-sm font-medium text-gray-700 mb-6">
              On a scale of 1 to 10, how satisfied are you with the support experience? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="relative px-2">
                {formData.supportSatisfaction && (
                  <div 
                    className="absolute -top-8 bg-teal-500 text-white px-3 py-1 rounded text-sm font-medium"
                    style={{ left: `calc(${((Number(formData.supportSatisfaction) - 1) / 9) * 100}% - 20px)` }}
                  >
                    {formData.supportSatisfaction}
                  </div>
                )}
                <input
                  type="range"
                  name="supportSatisfaction"
                  min="1"
                  max="10"
                  value={formData.supportSatisfaction || '1'}
                  onChange={handleInputChange}
                  required
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  style={{
                    background: formData.supportSatisfaction 
                      ? `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((Number(formData.supportSatisfaction) - 1) / 9) * 100}%, #e5e7eb ${((Number(formData.supportSatisfaction) - 1) / 9) * 100}%, #e5e7eb 100%)`
                      : '#e5e7eb'
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>1</span>
                  <span className="hidden sm:inline"></span>
                  <span>10</span>
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 px-2">
                <span>Very Dissatisfied</span>
                <span>Very Satisfied</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Are you satisfied with the resolution provided? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 sm:gap-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="resolutionSatisfied"
                  value="yes"
                  checked={formData.resolutionSatisfied === 'yes'}
                  onChange={handleInputChange}
                  required
                  className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                />
                <span className="text-sm sm:text-base">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="resolutionSatisfied"
                  value="no"
                  checked={formData.resolutionSatisfied === 'no'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                />
                <span className="text-sm sm:text-base">No</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Any additional comments?
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              maxLength={20000}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-y"
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {charCount} / 20000
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">Feedback submitted successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 sm:py-4 px-6 rounded-md transition duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>© 2026 Store My Goods. Thank you for your feedback!</p>
        </div>
      </div>
    </div>
  )
}
