'use client'

import { useState, useEffect } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface FormStat {
  form_type: string;
  response_count: number;
}

interface FormStatistics {
  total_forms: number;
  form_statistics: FormStat[];
  total_responses: number;
}

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<FormStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/form-statistics`)
      const result = await response.json()

      if (result.success) {
        setStatistics(result.data)
      } else {
        setError(result.message || 'Failed to fetch statistics')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFormDisplayName = (formType: string): string => {
    const names: { [key: string]: string } = {
      'ticket_closure': 'Ticket Closure',
      'customer_satisfaction': 'Customer Satisfaction',
      'cutomer_feedback': 'Customer Feedback',
      'churn_feedback': 'Churn Feedback',
      'relocation_feedback': 'Relocation Feedback'
    }
    return names[formType] || formType
  }

  const getFormColor = (formType: string): string => {
    const colors: { [key: string]: string } = {
      'ticket_closure': 'bg-blue-500',
      'customer_satisfaction': 'bg-green-500',
      'cutomer_feedback': 'bg-indigo-500',
      'churn_feedback': 'bg-red-500',
      'relocation_feedback': 'bg-emerald-500'
    }
    return colors[formType] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">PHASE-1: Feedback System Metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics?.total_forms || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics?.total_responses || 0}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics && statistics.total_forms > 0
                    ? Math.round((statistics.total_responses / statistics.total_forms) * 100) / 100
                    : 0}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Form Statistics Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-xl font-bold text-white">Form Response Breakdown</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics?.form_statistics.map((stat, index) => {
                  const percentage = statistics.total_responses > 0
                    ? Math.round((stat.response_count / statistics.total_responses) * 100)
                    : 0

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getFormColor(stat.form_type)} mr-3`}></div>
                          <div className="text-sm font-medium text-gray-900">
                            {getFormDisplayName(stat.form_type)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{stat.response_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '100px' }}>
                            <div
                              className={`h-2 rounded-full ${getFormColor(stat.form_type)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stat.response_count > 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No Responses
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong className="font-semibold">PHASE-1 Dashboard:</strong> This dashboard shows basic metrics only. 
                Detailed analytics, charts, and insights will be available in PHASE-2.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchStatistics}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}
