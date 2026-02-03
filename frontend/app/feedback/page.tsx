'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function FeedbackRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      router.replace(`/feedback/customer-satisfaction?token=${token}`)
    } else {
      router.replace('/feedback/customer-satisfaction')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to feedback form...</p>
      </div>
    </div>
  )
}

