"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

interface AssessmentData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dwellers: string;
  roofArea: string;
  roofType: string;
  openSpace: string;
  currentWaterSource: string;
  monthlyWaterBill: string;
  latitude?: number;
  longitude?: number;
}

function ReportContent() {
  const searchParams = useSearchParams()
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [reportDate] = useState(new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))

  useEffect(() => {
    // Get data from URL params
    const data: AssessmentData = {
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      phone: searchParams.get('phone') || '',
      address: searchParams.get('address') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      pincode: searchParams.get('pincode') || '',
      dwellers: searchParams.get('dwellers') || '',
      roofArea: searchParams.get('roofArea') || '',
      roofType: searchParams.get('roofType') || '',
      openSpace: searchParams.get('openSpace') || '',
      currentWaterSource: searchParams.get('currentWaterSource') || '',
      monthlyWaterBill: searchParams.get('monthlyWaterBill') || '',
      latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
    }
    setAssessmentData(data)
  }, [searchParams])

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">No Assessment Data Found</h2>
          <p className="mb-4 dark:text-gray-300">Please complete an assessment first.</p>
          <Link href="/assessment">
            <Button className="dark:bg-blue-600 dark:hover:bg-blue-700">Go to Assessment</Button>
          </Link>
        </div>
      </div>
    )
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header - Hidden in print */}
      <div className="no-print bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Rainwater Harvesting Assessment Report
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Generated on {reportDate}</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={printReport} variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                Print Report
              </Button>
              <Link href="/assessment">
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">← Back to Assessment</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header for Print */}
        <div className="print-only mb-8 text-center border-b dark:border-gray-700 pb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RH</span>
            </div>
            <span className="text-2xl font-bold dark:text-white">RainHarvest</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Rainwater Harvesting Assessment Report</h1>
          <p className="text-gray-600 dark:text-gray-300">Central Ground Water Board Initiative</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generated on {reportDate}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.email || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Location Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Property Address</p>
                  <p className="text-base dark:text-gray-200">{assessmentData.address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">State</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">PIN Code</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.pincode || 'Not provided'}</p>
                  </div>
                </div>
                {assessmentData.latitude && assessmentData.longitude && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-gray-600">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude</p>
                      <p className="text-base font-mono dark:text-gray-200">{assessmentData.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude</p>
                      <p className="text-base font-mono dark:text-gray-200">{assessmentData.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Water Usage */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Current Water Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Water Source</p>
                    <p className="text-base capitalize dark:text-gray-200">{assessmentData.currentWaterSource || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Water Bill</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.monthlyWaterBill ? `₹${assessmentData.monthlyWaterBill}` : 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Property Specifications */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Property Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Dwellers</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.dwellers || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Roof Area</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.roofArea ? `${assessmentData.roofArea} sq ft` : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Roof Type</p>
                    <p className="text-base capitalize dark:text-gray-200">{assessmentData.roofType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Open Space</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.openSpace ? `${assessmentData.openSpace} sq ft` : 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Summary */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Assessment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Preliminary Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="dark:text-blue-200">Roof Collection Area:</span>
                      <span className="font-medium dark:text-blue-100">{assessmentData.roofArea ? `${assessmentData.roofArea} sq ft` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-blue-200">Household Size:</span>
                      <span className="font-medium dark:text-blue-100">{assessmentData.dwellers ? `${assessmentData.dwellers} people` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-blue-200">Current Monthly Cost:</span>
                      <span className="font-medium dark:text-blue-100">{assessmentData.monthlyWaterBill ? `₹${assessmentData.monthlyWaterBill}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Next Steps</h4>
                  <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                    <li>• Detailed site analysis required</li>
                    <li>• Local rainfall data assessment</li>
                    <li>• System design and cost estimation</li>
                    <li>• Implementation planning</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    Based on your property details, rainwater harvesting appears to be a viable option for your location.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Recommended Actions:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                      <li>Consult with local rainwater harvesting experts</li>
                      <li>Obtain detailed rainfall data for your area</li>
                      <li>Consider ground water recharge options</li>
                      <li>Plan for storage tank sizing based on needs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>This report is generated by RainHarvest - A Central Ground Water Board Initiative</p>
          <p className="mt-1">For technical assistance, contact your local CGWB office</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
          }
          .page-break {
            page-break-before: always;
          }
          /* Override dark mode colors in print */
          * {
            background: white !important;
            color: black !important;
            border-color: #e5e7eb !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default function Report() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <div className="text-lg dark:text-white">Loading report...</div>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}