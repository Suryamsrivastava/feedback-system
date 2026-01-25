'use client'

import { useState, FormEvent } from 'react'

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    experience: '',
    buddyOnTime: '',
    buddyCourteous: '',
    buddyHandling: '',
    buddyPickup: '',
    salesUnderstanding: '',
    salesClarity: '',
    salesProfessionalism: '',
    salesTransparency: '',
    salesFollowup: '',
    salesDecision: '',
    cxOnboarding: '',
    cxCourteous: '',
    cxResolution: '',
    cxCommunication: '',
    recommendation: '',
    tipAsked: '',
    tipDetails: '',
    liked: '',
    improvement: ''
  })

  const [charCounts, setCharCounts] = useState({
    tipDetails: 0,
    liked: 0,
    improvement: 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update character count for textareas
    if (name in charCounts) {
      setCharCounts(prev => ({
        ...prev,
        [name]: value.length
      }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your feedback! Your response has been submitted successfully.')
    
    // Reset form
    setFormData({
      name: '',
      experience: '',
      buddyOnTime: '',
      buddyCourteous: '',
      buddyHandling: '',
      buddyPickup: '',
      salesUnderstanding: '',
      salesClarity: '',
      salesProfessionalism: '',
      salesTransparency: '',
      salesFollowup: '',
      salesDecision: '',
      cxOnboarding: '',
      cxCourteous: '',
      cxResolution: '',
      cxCommunication: '',
      recommendation: '',
      tipAsked: '',
      tipDetails: '',
      liked: '',
      improvement: ''
    })
    setCharCounts({
      tipDetails: 0,
      liked: 0,
      improvement: 0
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-10 md:p-12">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src="/smg-og.png" 
            alt="Store My Goods Logo" 
            className="inline-block h-20 sm:h-24 w-auto"
          />
        </div>
        
        {/* Grey line under logo */}
        <div className="border-b border-gray-300 mb-6"></div>

        {/* Title and Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
          Store My Goods - Feedback Form
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 px-2">
          We value your feedback! Please take a moment to share your experience with Store My Goods. 
          Your input helps us improve our services and serve you better.
        </p>
        
        {/* Black line after description */}
        <div className="border-b-2 border-gray-900 mb-8 sm:mb-12"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
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

          {/* Overall Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How was your overall experience? <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-2 sm:gap-6">
              {[
                { value: 'very-poor', emoji: '😡', label: 'Very Poor' },
                { value: 'poor', emoji: '😠', label: 'Poor' },
                { value: 'average', emoji: '😐', label: 'Average' },
                { value: 'good', emoji: '😊', label: 'Good' },
                { value: 'excellent', emoji: '😄', label: 'Excellent' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    formData.experience === option.value ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={option.value}
                    checked={formData.experience === option.value}
                    onChange={handleInputChange}
                    required
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-4xl transition-all ${
                      formData.experience === option.value
                        ? 'bg-yellow-400 shadow-lg'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    {option.emoji}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rate the Buddy Section - Only show if experience is not 'excellent' */}
          {formData.experience && formData.experience !== 'excellent' && (
          <div className="border-t pt-6 sm:pt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Rate the Buddy (Pick up Manager) based on the following criterias: <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-6">
              {/* Did the team arrive on time? */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Did the team arrive on time?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="buddyOnTime"
                        value={rating}
                        checked={formData.buddyOnTime === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.buddyOnTime && Number(formData.buddyOnTime) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Were they courteous and respectful? */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Were they courteous and respectful during the interaction?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="buddyCourteous"
                        value={rating}
                        checked={formData.buddyCourteous === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.buddyCourteous && Number(formData.buddyCourteous) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Was handling and packaging done smoothly? */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Was handling and packaging done smoothly?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="buddyHandling"
                        value={rating}
                        checked={formData.buddyHandling === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.buddyHandling && Number(formData.buddyHandling) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Was the pick up delivery process smooth? */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Was the pick up delivery process smooth?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="buddyPickup"
                        value={rating}
                        checked={formData.buddyPickup === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.buddyPickup && Number(formData.buddyPickup) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Rate the Sales Team Section - Only show if experience is not 'excellent' */}
          {formData.experience && formData.experience !== 'excellent' && (
          <div className="border-t pt-6 sm:pt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Rate the sales team based on the following criterias: <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-6">
              {/* Understanding storage needs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">How well did the sales consultant understand your storage?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesUnderstanding"
                        value={rating}
                        checked={formData.salesUnderstanding === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesUnderstanding && Number(formData.salesUnderstanding) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clarity in explaining */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Was the consultant clear in explaining pricing, plans and process?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesClarity"
                        value={rating}
                        checked={formData.salesClarity === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesClarity && Number(formData.salesClarity) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Professionalism and courtesy */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">How would you rate the consultant&apos;s professionalism and courtesy?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesProfessionalism"
                        value={rating}
                        checked={formData.salesProfessionalism === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesProfessionalism && Number(formData.salesProfessionalism) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transparency */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">How transparent was the consultant about charges, process and policies?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesTransparency"
                        value={rating}
                        checked={formData.salesTransparency === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesTransparency && Number(formData.salesTransparency) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Follow up and responsiveness */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">How would you rate their follow up and responsiveness after the initial call?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesFollowup"
                        value={rating}
                        checked={formData.salesFollowup === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesFollowup && Number(formData.salesFollowup) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Informed decision */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Did the consultant help you make a well-informed decision?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="salesDecision"
                        value={rating}
                        checked={formData.salesDecision === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.salesDecision && Number(formData.salesDecision) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Rate the Customer Experience Team Section - Only show if experience is not 'excellent' */}
          {formData.experience && formData.experience !== 'excellent' && (
          <div className="border-t pt-6 sm:pt-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Rate the Customer Experience Team based on the following criterias: <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-6">
              {/* Onboarding process */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Did the customer experience representative explain the Onboarding (KYC / Declaration) process clearly?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="cxOnboarding"
                        value={rating}
                        checked={formData.cxOnboarding === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.cxOnboarding && Number(formData.cxOnboarding) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>★</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Courteous and respectful */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Were they courteous and respectful during the interaction?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="cxCourteous"
                        value={rating}
                        checked={formData.cxCourteous === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.cxCourteous && Number(formData.cxCourteous) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>★</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Timely resolution */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Was a timely resolution provided to you if any issues were faced?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="cxResolution"
                        value={rating}
                        checked={formData.cxResolution === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.cxResolution && Number(formData.cxResolution) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>★</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear communication */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                <p className="text-sm text-gray-600 mb-3 sm:mb-0 sm:w-2/5">Was the communication Clear and simple?</p>
                <div className="flex justify-evenly sm:flex-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="cxCommunication"
                        value={rating}
                        checked={formData.cxCommunication === String(rating)}
                        onChange={handleInputChange}
                        required
                        className="sr-only"
                      />
                      <span className={`text-3xl sm:text-4xl transition-colors ${
                        formData.cxCommunication && Number(formData.cxCommunication) >= rating
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}>★</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Recommendation Scale */}
          <div className="border-t pt-6 sm:pt-8">
            <label className="block text-sm font-medium text-gray-700 mb-6">
              How likely would you recommend Store my goods to a friend or colleague? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* Slider with value display */}
              <div className="relative px-2">
                {formData.recommendation && (
                  <div 
                    className="absolute -top-8 bg-teal-500 text-white px-3 py-1 rounded text-sm font-medium"
                    style={{ left: `calc(${(Number(formData.recommendation) / 10) * 100}% - 20px)` }}
                  >
                    {formData.recommendation}
                  </div>
                )}
                <input
                  type="range"
                  name="recommendation"
                  min="0"
                  max="10"
                  value={formData.recommendation || '0'}
                  onChange={handleInputChange}
                  required
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  style={{
                    background: formData.recommendation 
                      ? `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(Number(formData.recommendation) / 10) * 100}%, #e5e7eb ${(Number(formData.recommendation) / 10) * 100}%, #e5e7eb 100%)`
                      : '#e5e7eb'
                  }}
                />
                {/* Number labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>0</span>
                  <span className="hidden sm:inline"></span>
                  <span>10</span>
                </div>
              </div>
              {/* Text Labels */}
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 px-2">
                <span>Unlikely</span>
                <span>Maybe</span>
                <span>Very Likely</span>
              </div>
            </div>
          </div>

          {/* Tip Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Did any of our team members ask for any kind of tip? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 sm:gap-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipAsked"
                  value="yes"
                  checked={formData.tipAsked === 'yes'}
                  onChange={handleInputChange}
                  required
                  className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                />
                <span className="text-sm sm:text-base">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipAsked"
                  value="no"
                  checked={formData.tipAsked === 'no'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                />
                <span className="text-sm sm:text-base">No</span>
              </label>
            </div>

            {/* Conditional Field */}
            {formData.tipAsked === 'yes' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <label htmlFor="tipDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  If yes, kindly provide extra details.
                </label>
                <textarea
                  id="tipDetails"
                  name="tipDetails"
                  value={formData.tipDetails}
                  onChange={handleInputChange}
                  maxLength={5000}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-y"
                />
                <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
                  {charCounts.tipDetails} / 5000
                </div>
              </div>
            )}
          </div>

          {/* What did you like */}
          <div>
            <label htmlFor="liked" className="block text-sm font-medium text-gray-700 mb-2">
              What did you like the most about our service?
            </label>
            <textarea
              id="liked"
              name="liked"
              value={formData.liked}
              onChange={handleInputChange}
              maxLength={5000}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-y"
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {charCounts.liked} / 5000
            </div>
          </div>

          {/* Improvement suggestions */}
          <div>
            <label htmlFor="improvement" className="block text-sm font-medium text-gray-700 mb-2">
              We&apos;re always looking to improve, how can we do better?
            </label>
            <textarea
              id="improvement"
              name="improvement"
              value={formData.improvement}
              onChange={handleInputChange}
              maxLength={5000}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-y"
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {charCounts.improvement} / 5000
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 sm:py-4 px-6 rounded-md transition duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>© 2026 Store My Goods. Thank you for your feedback!</p>
        </div>
      </div>
    </div>
  )
}






