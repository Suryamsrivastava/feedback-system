'use client'

import { useState, useEffect, FormEvent } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Customer {
  name: string;
  email: string;
  mobile: string;
  service_date: string;
}

export default function ChurnFeedbackPage() {
  const [token, setToken] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  
  const [formData, setFormData] = useState({
    name: '',
    reasonForLeaving: '',
    satisfactionLevel: '',
    wouldReturnInFuture: '',
    recommendToOthers: '',
    suggestions: ''
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

    if (name === 'suggestions') {
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
        experience: formData.satisfactionLevel,
        recommendation: formData.recommendToOthers ? parseInt(formData.recommendToOthers) : 0,
        tip_asked: 'no',
        liked: formData.wouldReturnInFuture,
        improvement: `Reason: ${formData.reasonForLeaving}. Suggestions: ${formData.suggestions || 'None'}`
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
        alert('Thank you for your feedback! We appreciate your input.')
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
          <p className="text-gray-600">We appreciate your feedback and hope to serve you again in the future.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">We're Sorry to See You Go</h1>
            <p className="text-red-100 text-center mt-2">Help us improve by sharing your experience</p>
          </div>

          {customer && (
            <div className="bg-red-50 px-8 py-4 border-b border-red-100">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you leaving? <span className="text-red-500">*</span>
              </label>
              <select
                name="reasonForLeaving"
                value={formData.reasonForLeaving}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select reason...</option>
                <option value="pricing">Pricing too high</option>
                <option value="quality">Service quality issues</option>
                <option value="support">Poor customer support</option>
                <option value="features">Missing features</option>
                <option value="competitor">Switching to competitor</option>
                <option value="no-longer-needed">No longer need service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Satisfaction <span className="text-red-500">*</span>
              </label>
              <select
                name="satisfactionLevel"
                value={formData.satisfactionLevel}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                Would you return in the future? <span className="text-red-500">*</span>
              </label>
              <select
                name="wouldReturnInFuture"
                value={formData.wouldReturnInFuture}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="definitely">Definitely</option>
                <option value="probably">Probably</option>
                <option value="not-sure">Not Sure</option>
                <option value="probably-not">Probably Not</option>
                <option value="definitely-not">Definitely Not</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend us? (0-10) <span className="text-red-500">*</span>
              </label>
              <select
                name="recommendToOthers"
                value={formData.recommendToOthers}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement
              </label>
              <textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="What could we have done better?"
              />
              <p className="text-sm text-gray-500 mt-1">{charCount}/500 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
