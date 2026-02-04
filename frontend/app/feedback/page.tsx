'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')

    if (!tokenParam) {
      router.replace('/feedback/customer-satisfaction')
      return
    }

    // Validate token and get form_type from backend
    fetch(`${API_BASE_URL}/api/feedback/validate/${tokenParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.valid) {
          const formType = data.form_type || 'customer_satisfaction'
          // Redirect to appropriate form with token
          router.replace(`/feedback/${formType.replace(/_/g, '-')}?token=${tokenParam}`)
        } else {
          // Invalid token - show error on customer-satisfaction page
          router.replace(`/feedback/customer-satisfaction?token=${tokenParam}`)
        }
      })
      .catch(() => {
        router.replace(`/feedback/customer-satisfaction?token=${tokenParam}`)
      })
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading feedback form...</p>
      </div>
    </div>
  )
}

