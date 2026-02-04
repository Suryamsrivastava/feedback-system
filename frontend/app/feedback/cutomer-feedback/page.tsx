'use client'

import { useState, useEffect, FormEvent } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Customer {
  name: string;
  email: string;
  mobile: string;
  service_date: string;
}

export default function CutomerFeedbackPage() {
  const [token, setToken] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    overallSatisfaction: '',
    serviceQuality: '',
    valueForMoney: '',
    wouldRecommend: '',
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
        experience: formData.overallSatisfaction,
        recommendation: formData.wouldRecommend ? parseInt(formData.wouldRecommend) : 0,
        tip_asked: 'no',
        liked: `Service Quality: ${formData.serviceQuality}, Value: ${formData.valueForMoney}`,
        improvement: formData.comments || ''
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your feedback link...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">{tokenError}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">Customer Feedback</h1>
            <p className="text-blue-100 text-center mt-2">We value your opinion</p>
          </div>

          {customer && (
            <div className="bg-blue-50 px-8 py-4 border-b border-blue-100">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Customer:</span> {customer.name}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Satisfaction <span className="text-red-500">*</span>
              </label>
              <select
                name="overallSatisfaction"
                value={formData.overallSatisfaction}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
                <option value="very-poor">Very Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Quality (1-5) <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceQuality"
                value={formData.serviceQuality}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select rating...</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value for Money (1-5) <span className="text-red-500">*</span>
              </label>
              <select
                name="valueForMoney"
                value={formData.valueForMoney}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select rating...</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend us? (0-10) <span className="text-red-500">*</span>
              </label>
              <select
                name="wouldRecommend"
                value={formData.wouldRecommend}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your thoughts..."
              />
              <p className="text-sm text-gray-500 mt-1">{charCount}/500 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
