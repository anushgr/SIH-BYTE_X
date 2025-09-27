"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AssessmentData {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  dwellers: number;
  roof_area: number;
  roof_type: string;
  open_space?: number;
  current_water_source?: string;
  monthly_water_bill?: number;
  latitude?: number;
  longitude?: number;
}

interface RunoffAnalysis {
  roof_details: {
    area_sqft: number;
    area_sqm: number;
    material: string;
    runoff_coefficient: number;
    collection_efficiency: number;
    quality_rating: string;
  };
  annual_summary: {
    total_rainfall_mm: number;
    total_runoff_liters: number;
    average_monthly_runoff_liters: number;
  };
  runoff_calculations: {
    annual_rainfall_mm: number;
    gross_annual_runoff_liters: number;
    net_annual_collectible_liters: number;
    average_monthly_collectible_liters: number;
    collection_efficiency_percent: number;
  };
  water_demand_analysis: {
    daily_demand_per_person_liters: number;
    total_daily_demand_liters: number;
    annual_demand_liters: number;
    demand_fulfillment_percentage: number;
  };
  monthly_breakdown: Array<{
    month: number;
    rainfall_mm: number;
    runoff_liters: number;
  }>;
  system_recommendations: {
    first_flush_diverter_liters: number;
    recommended_storage_tank_liters: number;
    daily_average_collection_liters: number;
  };
}

interface SoilAnalysis {
  soil_type?: string;
  soil_class?: string;
  soil_code?: number;
  suitability?: string;
  suitability_score?: number;
  infiltration_rate?: string;
  recommendations?: string[];
  error?: string;
  message?: string;
}

interface RainfallAnalysis {
  annual_rainfall_mm?: number;
  average_monthly_mm?: number;
  wettest_month?: {
    name: string;
    rainfall_mm: number;
  };
  driest_month?: {
    name: string;
    rainfall_mm: number;
  };
  year?: number;
  monthly_data?: Array<{
    month: number;
    month_name: string;
    monthly_rain_mm: number;
  }>;
  error?: string;
  message?: string;
}

interface AquiferAnalysis {
  aquifers?: Array<{
    basic_info: {
      name: string;
      type: string;
      location: string;
      water_storage: string;
    };
    water_characteristics: {
      depth: {
        category: string;
        description: string;
        raw_data: string;
      };
      yield: {
        category: string;
        description: string;
        household_equivalent: string;
        raw_data: string;
      };
      permeability: {
        category: string;
        description: string;
        raw_data: string;
      };
    };
    rwh_suitability: {
      level: string;
      description: string;
      recommendation: string;
    };
    seasonal_notes: {
      recharge: string;
      reliability: string;
      maintenance: string;
    };
    technical_details: {
      transmissivity: string;
      storage_coefficient: string;
      hydraulic_conductivity: string;
      porosity: string;
    };
  }>;
  count?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  summary?: {
    total_aquifers: number;
    primary_aquifer: string;
    overall_suitability: string;
  };
  user_friendly?: boolean;
  error?: string;
  message?: string;
}

interface GroundwaterAnalysis {
  nearest_station?: {
    station_code?: string;
    station_name?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    distance_km?: number;
  };
  data_availability?: {
    "2024_data"?: boolean;
    "2023_data"?: boolean;
  };
  groundwater_analysis?: {
    period?: string;
    annual_summary?: Array<any>;
    monthly_data?: Array<Array<any>>;
  };
  input_coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
  message?: string;
}

interface FeasibilityAssessment {
  overall_feasibility: {
    total_score: number;
    rating: string;
    recommendation: string;
    priority: string;
    confidence_level: string;
  };
  factor_scores: {
    rainfall_adequacy: {
      score: number;
      weight: number;
      weighted_score: number;
    };
    soil_suitability: {
      score: number;
      weight: number;
      weighted_score: number;
    };
    groundwater_conditions: {
      score: number;
      weight: number;
      weighted_score: number;
    };
    technical_viability: {
      score: number;
      weight: number;
      weighted_score: number;
    };
    economic_viability: {
      score: number;
      weight: number;
      weighted_score: number;
    };
  };
  detailed_analysis: {
    rainfall_analysis: {
      annual_rainfall_mm: number;
      adequacy_level: string;
      seasonal_distribution: string;
      reliability_score: number;
    };
    soil_analysis: {
      soil_type: string;
      infiltration_capacity: string;
      recharge_potential: string;
      structural_suitability: string;
    };
    groundwater_analysis: {
      depth_category: string;
      seasonal_variation: string;
      recharge_need: string;
      station_distance: string;
    };
    technical_analysis: {
      roof_area_adequacy: string;
      roof_material_quality: string;
      collection_efficiency_percent: number;
      demand_fulfillment_percent: number;
      demand_adequacy: string;
      potential_annual_collection_liters: number;
      annual_water_demand_liters: number;
    };
    economic_analysis: {
      estimated_system_cost_inr: number;
      estimated_annual_savings_inr: number;
      payback_period_years: number | string;
      payback_category: string;
      investment_attractiveness: string;
    };
  };
  recommendations: string[];
  limiting_factors: string[];
  implementation_strategy: {
    primary_focus: string;
    system_complexity: string;
    monitoring_requirements: string;
  };
  error?: string;
  message?: string;
}

interface StructureRecommendations {
  strategy: string;
  primary_structures: Array<{
    type: string;
    name: string;
    capacity_liters?: number;
    dimensions?: string;
    material?: string;
    specifications: {
      material?: string;
      construction?: string;
      life_span: string;
      maintenance: string;
      installation?: string;
      type?: string;
      stages?: string;
      recharge_rate?: string;
    };
    estimated_cost: number;
    cost_breakdown: {
      [key: string]: number;
    };
    suitability: string;
    recharge_capacity_liters_per_hour?: number;
    capacity_liters_per_hour?: number;
    pros: string[];
    cons: string[];
  }>;
  secondary_structures: Array<{
    type: string;
    name: string;
    capacity_liters?: number;
    dimensions?: string;
    material?: string;
    specifications: {
      material?: string;
      construction?: string;
      life_span: string;
      maintenance: string;
      installation?: string;
      type?: string;
      stages?: string;
      recharge_rate?: string;
    };
    estimated_cost: number;
    cost_breakdown: {
      [key: string]: number;
    };
    suitability: string;
    recharge_capacity_liters_per_hour?: number;
    capacity_liters_per_hour?: number;
    pros: string[];
    cons: string[];
  }>;
  total_estimated_cost: number;
  implementation_phases: Array<{
    phase: number;
    title: string;
    description: string;
    structures: string[];
    estimated_cost: number;
    timeline: string;
    priority: string;
  }>;
  site_analysis: {
    roof_area_sqm: number;
    open_space_sqm: number;
    soil_infiltration_rate: number;
    recharge_suitability: string;
    annual_runoff_potential: number;
    annual_water_demand: number;
  };
  error?: string;
  message?: string;
}

interface AIRecommendations {
  success: boolean;
  ai_recommendation?: {
    structured_sections?: {
      [key: string]: string;
    };
    full_text?: string;
  };
  raw_response?: string;
  model_used?: string;
  error?: string;
  message?: string;
}

interface AssessmentResult {
  message: string;
  assessment_data: AssessmentData;
  preliminary_results: {
    estimated_annual_collection_liters: number;
    potential_monthly_savings_inr: number;
    feasibility_score: string;
    annual_rainfall_used_mm?: number;
    next_steps: string[];
  };
  runoff_analysis?: RunoffAnalysis;
  feasibility_assessment?: FeasibilityAssessment;
  structure_recommendations?: StructureRecommendations;
  soil_analysis?: SoilAnalysis;
  rainfall_analysis?: RainfallAnalysis;
  aquifer_analysis?: AquiferAnalysis;
  groundwater_analysis?: GroundwaterAnalysis;
  ai_recommendations?: AIRecommendations;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  status: string;
}

function ReportContent() {
  const searchParams = useSearchParams()
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [reportDate] = useState(new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))

  useEffect(() => {
    // Try to get data from localStorage first (new approach)
    const storedResult = localStorage.getItem('assessmentResult');
    const storedFormData = localStorage.getItem('assessmentFormData');
    const storedLocation = localStorage.getItem('assessmentLocation');

    if (storedResult && storedFormData) {
      try {
        const result = JSON.parse(storedResult);
        const formData = JSON.parse(storedFormData);
        const location = storedLocation ? JSON.parse(storedLocation) : null;
        
        setAssessmentResult(result);
        // Use the assessment_data from the API response if available, otherwise use form data
        const assessmentData = result.assessment_data || {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          dwellers: parseInt(formData.dwellers) || 0,
          roof_area: parseInt(formData.roofArea) || 0,
          roof_type: formData.roofType,
          open_space: parseInt(formData.openSpace) || 0,
          current_water_source: formData.currentWaterSource,
          monthly_water_bill: parseInt(formData.monthlyWaterBill) || 0
        };
        setAssessmentData({
          ...assessmentData,
          latitude: location?.latitude || result.location?.latitude,
          longitude: location?.longitude || result.location?.longitude
        });
        
        console.log('Assessment Result:', result);
      } catch (error) {
        console.error('Error parsing stored assessment data:', error);
      }
    } else {
      // Fallback to URL params (old approach)
      const data: AssessmentData = {
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        address: searchParams.get('address') || '',
        city: searchParams.get('city') || '',
        state: searchParams.get('state') || '',
        pincode: searchParams.get('pincode') || '',
        dwellers: parseInt(searchParams.get('dwellers') || '0') || 0,
        roof_area: parseInt(searchParams.get('roofArea') || '0') || 0,
        roof_type: searchParams.get('roofType') || '',
        open_space: parseInt(searchParams.get('openSpace') || '0') || 0,
        current_water_source: searchParams.get('currentWaterSource') || '',
        monthly_water_bill: parseInt(searchParams.get('monthlyWaterBill') || '0') || 0,
        latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
        longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      }
      setAssessmentData(data)
    }
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
              <span className="text-white font-bold text-lg">JS</span>
            </div>
            <span className="text-2xl font-bold dark:text-white">Jalsanchay</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Rainwater Harvesting Assessment Report</h1>
          <p className="text-gray-600 dark:text-gray-300">Central Ground Water Board Initiative</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generated on {reportDate}</p>
        </div>

        {/* Single Column Layout */}
        <div className="grid grid-cols-1 gap-8">
          {/* Single Column */}
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
                    <p className="text-base capitalize dark:text-gray-200">{assessmentData.current_water_source || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Water Bill</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.monthly_water_bill ? `₹${assessmentData.monthly_water_bill}` : 'Not provided'}</p>
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
                    <p className="text-base dark:text-gray-200">{assessmentData.roof_area ? `${assessmentData.roof_area} sq ft` : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Roof Type</p>
                    <p className="text-base capitalize dark:text-gray-200">{assessmentData.roof_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Open Space</p>
                    <p className="text-base dark:text-gray-200">{assessmentData.open_space ? `${assessmentData.open_space} sq ft` : 'Not provided'}</p>
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
                      <span className="font-medium dark:text-blue-100">{assessmentData.roof_area ? `${assessmentData.roof_area} sq ft` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-blue-200">Household Size:</span>
                      <span className="font-medium dark:text-blue-100">{assessmentData.dwellers ? `${assessmentData.dwellers} people` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-blue-200">Current Monthly Cost:</span>
                      <span className="font-medium dark:text-blue-100">{assessmentData.monthly_water_bill ? `₹${assessmentData.monthly_water_bill}` : 'N/A'}</span>
                    </div>
                    {assessmentResult?.preliminary_results && (
                      <>
                        <div className="flex justify-between">
                          <span className="dark:text-blue-200">Estimated Annual Collection:</span>
                          <span className="font-medium dark:text-blue-100">{assessmentResult.preliminary_results.estimated_annual_collection_liters.toLocaleString()} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-blue-200">Potential Monthly Savings:</span>
                          <span className="font-medium dark:text-blue-100">₹{assessmentResult.preliminary_results.potential_monthly_savings_inr.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="dark:text-blue-200">Feasibility Score:</span>
                          <span className={`font-medium ${
                            assessmentResult.preliminary_results.feasibility_score === 'Excellent' ? 'text-green-600 dark:text-green-400' :
                            assessmentResult.preliminary_results.feasibility_score === 'High' ? 'text-blue-600 dark:text-blue-400' :
                            assessmentResult.preliminary_results.feasibility_score === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {assessmentResult.preliminary_results.feasibility_score}
                          </span>
                        </div>
                        {assessmentResult.preliminary_results.annual_rainfall_used_mm && (
                          <div className="flex justify-between">
                            <span className="dark:text-blue-200">Annual Rainfall (Used):</span>
                            <span className="font-medium dark:text-blue-100">{assessmentResult.preliminary_results.annual_rainfall_used_mm} mm</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Next Steps</h4>
                  <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                    {assessmentResult?.preliminary_results?.next_steps ? (
                      assessmentResult.preliminary_results.next_steps.map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))
                    ) : (
                      <>
                        <li>• Detailed site analysis required</li>
                        <li>• Local rainfall data assessment</li>
                        <li>• System design and cost estimation</li>
                        <li>• Implementation planning</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feasibility Assessment */}
            {assessmentResult?.feasibility_assessment && !assessmentResult.feasibility_assessment.error && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <span>Detailed Feasibility Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Feasibility */}
                  <div className={`p-4 rounded-lg border ${
                    assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Excellent' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
                      : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Good'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30'
                      : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Moderate'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold text-lg ${
                        assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Excellent' 
                          ? 'text-green-900 dark:text-green-100'
                          : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Good'
                          ? 'text-blue-900 dark:text-blue-100'
                          : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Moderate'
                          ? 'text-yellow-900 dark:text-yellow-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        Overall Rating: {assessmentResult.feasibility_assessment.overall_feasibility.rating}
                      </h4>
                      <div className={`text-2xl font-bold ${
                        assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Excellent' 
                          ? 'text-green-600 dark:text-green-400'
                          : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Good'
                          ? 'text-blue-600 dark:text-blue-400'
                          : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Moderate'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {assessmentResult.feasibility_assessment.overall_feasibility.total_score}/100
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${
                      assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Excellent' 
                        ? 'text-green-700 dark:text-green-200'
                        : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Good'
                        ? 'text-blue-700 dark:text-blue-200'
                        : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Moderate'
                        ? 'text-yellow-700 dark:text-yellow-200'
                        : 'text-red-700 dark:text-red-200'
                    }`}>
                      {assessmentResult.feasibility_assessment.overall_feasibility.recommendation}
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        assessmentResult.feasibility_assessment.overall_feasibility.priority === 'high'
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : assessmentResult.feasibility_assessment.overall_feasibility.priority === 'medium'
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        Priority: {assessmentResult.feasibility_assessment.overall_feasibility.priority}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        assessmentResult.feasibility_assessment.overall_feasibility.confidence_level === 'high'
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : assessmentResult.feasibility_assessment.overall_feasibility.confidence_level === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                      }`}>
                        Confidence: {assessmentResult.feasibility_assessment.overall_feasibility.confidence_level}
                      </span>
                    </div>
                  </div>

                  {/* Factor Scores */}
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Assessment Factors</h5>
                    <div className="space-y-3">
                      {Object.entries(assessmentResult.feasibility_assessment.factor_scores).map(([factor, data]) => (
                        <div key={factor} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {factor.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {data.score}/100 ({data.weight}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  data.score >= 80 ? 'bg-green-500' :
                                  data.score >= 60 ? 'bg-blue-500' :
                                  data.score >= 40 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${data.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Implementation Strategy */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Primary Focus</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {assessmentResult.feasibility_assessment.implementation_strategy.primary_focus}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">System Complexity</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {assessmentResult.feasibility_assessment.implementation_strategy.system_complexity}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Monitoring</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {assessmentResult.feasibility_assessment.implementation_strategy.monitoring_requirements}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {assessmentResult.feasibility_assessment.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h5>
                      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        {assessmentResult.feasibility_assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limiting Factors */}
                  {assessmentResult.feasibility_assessment.limiting_factors.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Limiting Factors</h5>
                      <div className="flex flex-wrap gap-2">
                        {assessmentResult.feasibility_assessment.limiting_factors.map((factor, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* RTRWH Structure Recommendations Section */}
            {assessmentResult?.structure_recommendations && !assessmentResult.structure_recommendations.error && (
              <Card className="p-6 bg-white dark:bg-gray-800">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🏗️</span>
                    <span>Recommended RTRWH Structures</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Customized rainwater harvesting and artificial recharge structure recommendations based on your site conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  
                  {/* Strategy Overview */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Recommended Strategy</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm capitalize">
                      <strong>{assessmentResult.structure_recommendations.strategy.replace('_', ' ')}</strong> approach
                      {assessmentResult.structure_recommendations.strategy === 'storage_focused' && 
                        ' - Focus on collecting and storing rainwater for direct use'}
                      {assessmentResult.structure_recommendations.strategy === 'recharge_focused' && 
                        ' - Focus on groundwater recharge with minimal storage'}
                      {assessmentResult.structure_recommendations.strategy === 'hybrid' && 
                        ' - Balanced approach combining storage and recharge'}
                    </p>
                  </div>

                  {/* Site Analysis Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Available Space</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Roof: {Math.round(assessmentResult.structure_recommendations.site_analysis.roof_area_sqm)} m²
                        <br />
                        Open: {Math.round(assessmentResult.structure_recommendations.site_analysis.open_space_sqm)} m²
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Soil Conditions</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Infiltration: {assessmentResult.structure_recommendations.site_analysis.soil_infiltration_rate} mm/hr
                        <br />
                        Suitability: {assessmentResult.structure_recommendations.site_analysis.recharge_suitability}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Water Balance</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Annual Potential: {Math.round(assessmentResult.structure_recommendations.site_analysis.annual_runoff_potential).toLocaleString()} L
                        <br />
                        Annual Demand: {Math.round(assessmentResult.structure_recommendations.site_analysis.annual_water_demand).toLocaleString()} L
                      </p>
                    </div>
                  </div>

                  {/* Primary Structures */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Primary Structures</h4>
                    <div className="space-y-4">
                      {assessmentResult.structure_recommendations.primary_structures.map((structure, index) => (
                        <div key={index} className="border dark:border-gray-600 rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{structure.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{structure.type.replace('_', ' ')}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                ₹{structure.estimated_cost.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Specifications */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {structure.capacity_liters && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Capacity:</span>
                                <span className="text-sm font-medium dark:text-gray-200">{structure.capacity_liters.toLocaleString()} L</span>
                              </div>
                            )}
                            {structure.dimensions && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Dimensions:</span>
                                <span className="text-sm font-medium dark:text-gray-200">{structure.dimensions}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Life Span:</span>
                              <span className="text-sm font-medium dark:text-gray-200">{structure.specifications.life_span}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance:</span>
                              <span className="text-sm font-medium dark:text-gray-200">{structure.specifications.maintenance}</span>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="mb-3">
                            <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Cost Breakdown</h6>
                            <div className="space-y-1">
                              {Object.entries(structure.cost_breakdown).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600 dark:text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="text-gray-700 dark:text-gray-300">₹{Math.round(value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pros and Cons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Advantages</h6>
                              <ul className="text-xs space-y-1">
                                {structure.pros.map((pro, proIndex) => (
                                  <li key={proIndex} className="text-green-700 dark:text-green-300 flex items-start">
                                    <span className="text-green-500 mr-1">✓</span>
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">Considerations</h6>
                              <ul className="text-xs space-y-1">
                                {structure.cons.map((con, conIndex) => (
                                  <li key={conIndex} className="text-orange-700 dark:text-orange-300 flex items-start">
                                    <span className="text-orange-500 mr-1">!</span>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Structures */}
                  {assessmentResult.structure_recommendations.secondary_structures.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Secondary/Support Structures</h4>
                      <div className="space-y-3">
                        {assessmentResult.structure_recommendations.secondary_structures.map((structure, index) => (
                          <div key={index} className="border dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/30">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm">{structure.name}</h5>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                ₹{structure.estimated_cost.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{structure.suitability}</p>
                            <div className="flex flex-wrap gap-2">
                              {structure.pros.slice(0, 2).map((pro, proIndex) => (
                                <span key={proIndex} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                  {pro}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Implementation Timeline */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Implementation Timeline</h4>
                    <div className="space-y-3">
                      {assessmentResult.structure_recommendations.implementation_phases.map((phase, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">Phase {phase.phase}: {phase.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                ₹{phase.estimated_cost.toLocaleString()}
                              </span>
                              <br />
                              <span className="text-xs text-gray-500">{phase.timeline}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              phase.priority === 'High' 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                : phase.priority === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            }`}>
                              {phase.priority} Priority
                            </span>
                          </div>
                          <ul className="text-xs text-gray-600 dark:text-gray-400">
                            {phase.structures.map((structure, structIndex) => (
                              <li key={structIndex} className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                {structure}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Investment Summary */}
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 p-4 rounded-lg border dark:border-blue-800/30">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Total Investment Summary</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Complete RTRWH System</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Including all recommended structures and installation</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{assessmentResult.structure_recommendations.total_estimated_cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Rainfall Analysis Section */}
            {assessmentResult?.rainfall_analysis && (
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Rainfall Analysis</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="dark:text-green-200">Annual Rainfall:</span>
                      <span className="font-medium dark:text-green-100">{assessmentResult.rainfall_analysis.annual_rainfall_mm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-green-200">Average Monthly:</span>
                      <span className="font-medium dark:text-green-100">{assessmentResult.rainfall_analysis.average_monthly_mm} mm</span>
                    </div>
                    {assessmentResult.rainfall_analysis.wettest_month && (
                      <div className="flex justify-between">
                        <span className="dark:text-green-200">Wettest Month:</span>
                        <span className="font-medium dark:text-green-100">
                          {assessmentResult.rainfall_analysis.wettest_month.name} ({assessmentResult.rainfall_analysis.wettest_month.rainfall_mm} mm)
                        </span>
                      </div>
                    )}
                    {assessmentResult.rainfall_analysis.driest_month && (
                      <div className="flex justify-between">
                        <span className="dark:text-green-200">Driest Month:</span>
                        <span className="font-medium dark:text-green-100">
                          {assessmentResult.rainfall_analysis.driest_month.name} ({assessmentResult.rainfall_analysis.driest_month.rainfall_mm} mm)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Monthly Rainfall Data */}
                  {assessmentResult.rainfall_analysis.monthly_data && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Monthly Rainfall Pattern</h4>
                      
                      {/* Line Graph */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={assessmentResult.rainfall_analysis.monthly_data}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis 
                              dataKey="month_name" 
                              stroke="#6B7280"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              stroke="#6B7280"
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                              formatter={(value, name) => [
                                `${value} mm`,
                                'Rainfall'
                              ]}
                              labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="monthly_rain_mm" 
                              stroke="#3B82F6" 
                              strokeWidth={3}
                              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                              activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Monthly Data Grid (kept as backup/detailed view) */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          View detailed monthly data
                        </summary>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm mt-2">
                          {assessmentResult.rainfall_analysis.monthly_data.map((month, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-center">
                              <div className="font-medium text-gray-900 dark:text-white">{month.month_name}</div>
                              <div className="text-gray-600 dark:text-gray-300">{month.monthly_rain_mm} mm</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Seasonal Analysis */}
                  {assessmentResult.rainfall_analysis.wettest_month && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="text-md font-medium mb-2 text-green-900 dark:text-green-200">Collection Strategy</h4>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Based on the rainfall pattern, focus collection efforts during {assessmentResult.rainfall_analysis.wettest_month.name} when rainfall is highest. 
                        Consider additional storage capacity to capture monsoon rainfall effectively.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Runoff Analysis Section */}
            {assessmentResult?.runoff_analysis && (
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Runoff Analysis</h3>
                
                {/* Roof Specifications */}
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Roof Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-200">Area:</span>
                        <span className="font-medium dark:text-blue-100">{assessmentResult.runoff_analysis.roof_details.area_sqft} sq ft ({assessmentResult.runoff_analysis.roof_details.area_sqm.toFixed(1)} sq m)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-200">Roof Type:</span>
                        <span className="font-medium dark:text-blue-100 capitalize">{assessmentResult.runoff_analysis.roof_details.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-200">Runoff Coefficient:</span>
                        <span className="font-medium dark:text-blue-100">{assessmentResult.runoff_analysis.roof_details.runoff_coefficient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-200">Collection Efficiency:</span>
                        <span className="font-medium dark:text-blue-100">{(assessmentResult.runoff_analysis.roof_details.collection_efficiency * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-200">Quality Rating:</span>
                        <span className="font-medium dark:text-blue-100 capitalize">{assessmentResult.runoff_analysis.roof_details.quality_rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Collection Summary */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Collection Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-200">Annual Rainfall:</span>
                        <span className="font-medium dark:text-green-100">{assessmentResult.runoff_analysis.annual_summary.total_rainfall_mm} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-200">Total Annual Collection:</span>
                        <span className="font-medium dark:text-green-100">{assessmentResult.runoff_analysis.annual_summary.total_runoff_liters.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-200">Average Monthly Collection:</span>
                        <span className="font-medium dark:text-green-100">{assessmentResult.runoff_analysis.annual_summary.average_monthly_runoff_liters.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-200">Collection Efficiency:</span>
                        <span className="font-medium dark:text-green-100">{assessmentResult.runoff_analysis.runoff_calculations.collection_efficiency_percent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* System Recommendations */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">System Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700 dark:text-yellow-200">First Flush Diverter:</span>
                        <span className="font-medium dark:text-yellow-100">{assessmentResult.runoff_analysis.system_recommendations.first_flush_diverter_liters} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700 dark:text-yellow-200">Storage Tank Size:</span>
                        <span className="font-medium dark:text-yellow-100">{assessmentResult.runoff_analysis.system_recommendations.recommended_storage_tank_liters.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-yellow-700 dark:text-yellow-200">Daily Average Collection:</span>
                        <span className="font-medium dark:text-yellow-100">{assessmentResult.runoff_analysis.system_recommendations.daily_average_collection_liters.toFixed(1)} L</span>
                      </div>
                    </div>
                  </div>

                  {/* Water Demand Analysis */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border dark:border-cyan-800/30">
                    <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-3">Water Demand Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cyan-700 dark:text-cyan-200">Daily per person:</span>
                        <span className="font-medium dark:text-cyan-100">{assessmentResult.runoff_analysis.water_demand_analysis.daily_demand_per_person_liters} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700 dark:text-cyan-200">Total daily demand:</span>
                        <span className="font-medium dark:text-cyan-100">{assessmentResult.runoff_analysis.water_demand_analysis.total_daily_demand_liters} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700 dark:text-cyan-200">Annual demand:</span>
                        <span className="font-medium dark:text-cyan-100">{assessmentResult.runoff_analysis.water_demand_analysis.annual_demand_liters.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-700 dark:text-cyan-200">Demand fulfillment:</span>
                        <span className={`font-medium ${
                          assessmentResult.runoff_analysis.water_demand_analysis.demand_fulfillment_percentage >= 80 ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.runoff_analysis.water_demand_analysis.demand_fulfillment_percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {assessmentResult.runoff_analysis.water_demand_analysis.demand_fulfillment_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Breakdown Chart */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Monthly Collection Pattern</h4>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4" style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={assessmentResult.runoff_analysis.monthly_breakdown.map(month => ({
                            month: month.month,
                            month_name: new Date(2024, month.month - 1).toLocaleDateString('en-US', { month: 'short' }),
                            rainfall_mm: month.rainfall_mm,
                            runoff_liters: month.runoff_liters
                          }))}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="month_name" 
                            stroke="#6B7280"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Collectible Water (Liters)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(31, 41, 55, 0.9)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                            formatter={(value, name) => [
                              `${(value as number).toLocaleString()} ${name === 'rainfall_mm' ? 'mm' : 'L'}`,
                              name === 'runoff_liters' ? 'Collection' :
                              name === 'rainfall_mm' ? 'Rainfall' : name
                            ]}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="runoff_liters" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                            name="Collection"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rainfall_mm" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }}
                            name="Rainfall"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Monthly Data Grid */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        View detailed monthly breakdown
                      </summary>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mt-3">
                        {assessmentResult.runoff_analysis.monthly_breakdown.map((month, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                              {new Date(2024, month.month - 1).toLocaleDateString('en-US', { month: 'long' })}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Rainfall:</span>
                                <span className="dark:text-gray-300">{month.rainfall_mm} mm</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-green-700 dark:text-green-400">Collection:</span>
                                <span className="text-green-700 dark:text-green-400">{month.runoff_liters.toLocaleString()} L</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            )}

            {/* Detailed Feasibility Breakdown */}
            {assessmentResult?.feasibility_assessment && !assessmentResult.feasibility_assessment.error && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <span>Feasibility Factor Analysis</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Detailed breakdown of environmental and technical factors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rainfall Analysis */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Rainfall Assessment ({assessmentResult.feasibility_assessment.factor_scores.rainfall_adequacy.score}/100)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Annual Rainfall:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          {assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.annual_rainfall_mm} mm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Adequacy:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.adequacy_level === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.adequacy_level === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.adequacy_level === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.adequacy_level}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Distribution:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.seasonal_distribution === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.seasonal_distribution === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.seasonal_distribution}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Reliability:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          {assessmentResult.feasibility_assessment.detailed_analysis.rainfall_analysis.reliability_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Soil Analysis */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Soil Assessment ({assessmentResult.feasibility_assessment.factor_scores.soil_suitability.score}/100)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Soil Type:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          {assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.soil_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Infiltration:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.infiltration_capacity === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.infiltration_capacity === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.infiltration_capacity}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Recharge Potential:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.recharge_potential === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.recharge_potential === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.recharge_potential}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Structural Suitability:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.structural_suitability === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.structural_suitability === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.soil_analysis.structural_suitability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Analysis */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Technical Assessment ({assessmentResult.feasibility_assessment.factor_scores.technical_viability.score}/100)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Roof Area:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.roof_area_adequacy === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.roof_area_adequacy === 'good' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.roof_area_adequacy}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Collection Efficiency:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          {assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.collection_efficiency_percent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Demand Fulfillment:</span>
                        <span className={`ml-2 font-medium ${
                          assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.demand_fulfillment_percent >= 80 ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.demand_fulfillment_percent >= 50 ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.demand_fulfillment_percent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Annual Collection:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          {assessmentResult.feasibility_assessment.detailed_analysis.technical_analysis.potential_annual_collection_liters.toLocaleString()} L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Economic Analysis */}
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Economic Assessment ({assessmentResult.feasibility_assessment.factor_scores.economic_viability.score}/100)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                        <span className="ml-2 font-medium dark:text-gray-200">
                          ₹{assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.estimated_system_cost_inr.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Annual Savings:</span>
                        <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                          ₹{assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.estimated_annual_savings_inr.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Payback Period:</span>
                        <span className={`ml-2 font-medium ${
                          typeof assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years === 'number' &&
                          assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years <= 5
                            ? 'text-green-600 dark:text-green-400'
                            : typeof assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years === 'number' &&
                              assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years <= 8
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years} years
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Investment Grade:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.investment_attractiveness === 'high' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.investment_attractiveness === 'moderate' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.investment_attractiveness}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Groundwater Analysis */}
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Groundwater Assessment ({assessmentResult.feasibility_assessment.factor_scores.groundwater_conditions.score}/100)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Depth Category:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.depth_category === 'shallow' ? 'text-blue-600 dark:text-blue-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.depth_category === 'moderate' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.depth_category === 'deep' ? 'text-green-600 dark:text-green-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.depth_category}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Recharge Need:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.recharge_need === 'high' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.recharge_need === 'moderate' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.recharge_need}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Seasonal Variation:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.seasonal_variation === 'stable' ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.seasonal_variation === 'moderate' ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.seasonal_variation}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Data Reliability:</span>
                        <span className={`ml-2 font-medium capitalize ${
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.station_distance === 'very_close' || 
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.station_distance === 'close' 
                            ? 'text-green-600 dark:text-green-400' :
                          assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.station_distance === 'moderate' 
                            ? 'text-blue-600 dark:text-blue-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {assessmentResult.feasibility_assessment.detailed_analysis.groundwater_analysis.station_distance.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soil Analysis */}
            {assessmentResult?.soil_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <span>Soil Analysis</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Site-specific soil assessment for rainwater harvesting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessmentResult.soil_analysis.error ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> {assessmentResult.soil_analysis.error}
                      </p>
                      {assessmentResult.soil_analysis.message && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          {assessmentResult.soil_analysis.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Soil Type</p>
                          <p className="text-base font-medium dark:text-gray-200">{assessmentResult.soil_analysis.soil_type || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Soil Class</p>
                          <p className="text-base dark:text-gray-200">{assessmentResult.soil_analysis.soil_class || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      {assessmentResult.soil_analysis.suitability && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">RWH Suitability Assessment</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="dark:text-blue-200">Suitability:</span>
                              <span className={`font-medium ${
                                assessmentResult.soil_analysis.suitability === 'Excellent' ? 'text-green-600 dark:text-green-400' :
                                assessmentResult.soil_analysis.suitability === 'Very Good' ? 'text-blue-600 dark:text-blue-400' :
                                assessmentResult.soil_analysis.suitability === 'Good' ? 'text-yellow-600 dark:text-yellow-400' :
                                assessmentResult.soil_analysis.suitability === 'Fair' ? 'text-orange-600 dark:text-orange-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {assessmentResult.soil_analysis.suitability}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="dark:text-blue-200">Score:</span>
                              <span className="font-medium dark:text-blue-100">{assessmentResult.soil_analysis.suitability_score}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="dark:text-blue-200">Infiltration Rate:</span>
                              <span className="font-medium dark:text-blue-100">{assessmentResult.soil_analysis.infiltration_rate || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {assessmentResult.soil_analysis.recommendations && assessmentResult.soil_analysis.recommendations.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Soil-Specific Recommendations</h4>
                          <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                            {assessmentResult.soil_analysis.recommendations.map((recommendation, index) => (
                              <li key={index}>• {recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Aquifer Analysis */}
            {assessmentResult?.aquifer_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <span>Principal Aquifer Analysis</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Underground water source information for your location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessmentResult.aquifer_analysis.error ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> {assessmentResult.aquifer_analysis.error}
                      </p>
                      {assessmentResult.aquifer_analysis.message && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          {assessmentResult.aquifer_analysis.message}
                        </p>
                      )}
                    </div>
                  ) : assessmentResult.aquifer_analysis.aquifers && assessmentResult.aquifer_analysis.aquifers.length > 0 ? (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          {assessmentResult.aquifer_analysis.count} Principal aquifer(s) Found
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Underground water sources identified at your location
                        </p>
                      </div>
                      
                      {assessmentResult.aquifer_analysis.aquifers.map((aquifer, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            {aquifer.basic_info.name}
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.basic_info.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.basic_info.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.basic_info.water_storage}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Depth Category:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.water_characteristics.depth.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Yield Category:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.water_characteristics.yield.category}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Permeability:</span>
                                <span className="font-medium dark:text-gray-200">{aquifer.water_characteristics.permeability.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">RWH Suitability:</span>
                                <span className={`font-medium ${
                                  aquifer.rwh_suitability.level === 'Excellent' ? 'text-green-600 dark:text-green-400' :
                                  aquifer.rwh_suitability.level === 'High' ? 'text-blue-600 dark:text-blue-400' :
                                  aquifer.rwh_suitability.level === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {aquifer.rwh_suitability.level}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <div className="mt-3 pt-3 border-t dark:border-gray-600">
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Depth Description:</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{aquifer.water_characteristics.depth.description}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Yield Description:</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{aquifer.water_characteristics.yield.description}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">RWH Recommendation:</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{aquifer.rwh_suitability.recommendation}</p>
                              </div>
                            </div>
                          </div>

                          {/* Seasonal Notes */}
                          <div className="mt-3 pt-3 border-t dark:border-gray-600">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Seasonal Information:</p>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                              <p><strong>Recharge:</strong> {aquifer.seasonal_notes.recharge}</p>
                              <p><strong>Reliability:</strong> {aquifer.seasonal_notes.reliability}</p>
                              <p><strong>Maintenance:</strong> {aquifer.seasonal_notes.maintenance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Groundwater Recharge Potential</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          The presence of {assessmentResult.aquifer_analysis.count} aquifer(s) indicates good potential for groundwater recharge through rainwater harvesting. 
                          Consider implementing recharge wells or recharge pits to supplement the natural groundwater system.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No aquifers identified at this location. Consider surface water storage solutions for rainwater harvesting.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Groundwater Analysis Section */}
            {assessmentResult?.groundwater_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <span>Groundwater Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessmentResult.groundwater_analysis.error ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-700">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> {assessmentResult.groundwater_analysis.error}
                      </p>
                      {assessmentResult.groundwater_analysis.message && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                          {assessmentResult.groundwater_analysis.message}
                        </p>
                      )}
                    </div>
                  ) : assessmentResult.groundwater_analysis.nearest_station ? (
                    <>
                      {/* Station Information */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-700">
                        <h4 className="text-md font-medium mb-2 text-blue-900 dark:text-blue-200">
                          Nearest Monitoring Station: {assessmentResult.groundwater_analysis.nearest_station.station_name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Station Code:</span>
                            <span className="font-medium dark:text-blue-100 ml-2">
                              {assessmentResult.groundwater_analysis.nearest_station.station_code}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Distance:</span>
                            <span className="font-medium dark:text-blue-100 ml-2">
                              {assessmentResult.groundwater_analysis.nearest_station.distance_km?.toFixed(1)} km
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">District:</span>
                            <span className="font-medium dark:text-blue-100 ml-2">
                              {assessmentData.city || 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">State:</span>
                            <span className="font-medium dark:text-blue-100 ml-2">
                              {assessmentData.state || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Groundwater Level Data */}
                      {assessmentResult.groundwater_analysis.groundwater_analysis?.monthly_data && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium mb-3 text-gray-900 dark:text-white">
                            Monthly Groundwater Levels ({assessmentResult.groundwater_analysis.groundwater_analysis.period})
                          </h4>
                          
                          {/* Line Graph */}
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={assessmentResult.groundwater_analysis.groundwater_analysis.monthly_data.map((item: any[]) => ({
                                  year: item[0],
                                  month: item[1],
                                  month_name: new Date(0, item[1] - 1).toLocaleString('default', { month: 'short' }),
                                  avg_level: item[2],
                                  min_level: item[3],
                                  max_level: item[4],
                                  count: item[5]
                                }))}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis 
                                  dataKey="month_name" 
                                  stroke="#6B7280"
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                  stroke="#6B7280"
                                  tick={{ fontSize: 12 }}
                                  label={{ value: 'Depth (meters below ground level)', angle: -90, position: 'insideLeft' }}
                                  reversed={true}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                  formatter={(value, name) => [
                                    `${typeof value === 'number' ? value.toFixed(2) : value} m`,
                                    name === 'avg_level' ? 'Average Level' : 
                                    name === 'min_level' ? 'Minimum Level' :
                                    name === 'max_level' ? 'Maximum Level' : name
                                  ]}
                                  labelFormatter={(label) => `Month: ${label}`}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="avg_level" 
                                  stroke="#10B981" 
                                  strokeWidth={3}
                                  dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                                  activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="min_level" 
                                  stroke="#F59E0B" 
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={{ fill: '#F59E0B', strokeWidth: 1, r: 3 }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="max_level" 
                                  stroke="#EF4444" 
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={{ fill: '#EF4444', strokeWidth: 1, r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Data Interpretation */}
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="text-md font-medium mb-2 text-green-900 dark:text-green-200">Interpretation</h4>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              Groundwater levels show seasonal variations. Lower values indicate deeper groundwater levels. 
                              Consider rainwater harvesting to help recharge the groundwater and maintain sustainable levels.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No groundwater monitoring station found near this location.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI-Powered Comprehensive Recommendations */}
            {assessmentResult?.ai_recommendations && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span>AI-Powered Comprehensive Recommendations</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Personalized recommendations generated using advanced AI analysis of your site conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assessmentResult.ai_recommendations.success ? (
                    <div className="space-y-6">
                      {/* AI Model Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border dark:border-blue-800/30">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Generated by {assessmentResult.ai_recommendations.model_used || 'Claude AI'} • 
                          Analysis includes soil, rainfall, groundwater, feasibility, and economic factors
                        </p>
                      </div>

                      {/* Structured Sections */}
                      {assessmentResult.ai_recommendations.ai_recommendation?.structured_sections && (
                        <div className="space-y-4">
                          {Object.entries(assessmentResult.ai_recommendations.ai_recommendation.structured_sections).map(([sectionKey, content]) => {
                            const sectionTitle = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            
                            // Different styling for different sections
                            let sectionClass = "bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600";
                            let titleClass = "text-gray-900 dark:text-gray-100";
                            let contentClass = "text-gray-700 dark:text-gray-300";
                            
                            if (sectionKey.includes('executive') || sectionKey.includes('summary')) {
                              sectionClass = "bg-green-50 dark:bg-green-900/20 border dark:border-green-800/30";
                              titleClass = "text-green-900 dark:text-green-100";
                              contentClass = "text-green-800 dark:text-green-200";
                            } else if (sectionKey.includes('benefit') || sectionKey.includes('savings')) {
                              sectionClass = "bg-blue-50 dark:bg-blue-900/20 border dark:border-blue-800/30";
                              titleClass = "text-blue-900 dark:text-blue-100";
                              contentClass = "text-blue-800 dark:text-blue-200";
                            } else if (sectionKey.includes('cost') || sectionKey.includes('economic')) {
                              sectionClass = "bg-amber-50 dark:bg-amber-900/20 border dark:border-amber-800/30";
                              titleClass = "text-amber-900 dark:text-amber-100";
                              contentClass = "text-amber-800 dark:text-amber-200";
                            } else if (sectionKey.includes('implementation') || sectionKey.includes('roadmap')) {
                              sectionClass = "bg-purple-50 dark:bg-purple-900/20 border dark:border-purple-800/30";
                              titleClass = "text-purple-900 dark:text-purple-100";
                              contentClass = "text-purple-800 dark:text-purple-200";
                            }

                            return (
                              <div key={sectionKey} className={`p-4 rounded-lg ${sectionClass}`}>
                                <h4 className={`font-semibold mb-3 ${titleClass}`}>
                                  {sectionTitle}
                                </h4>
                                <div className={`text-sm whitespace-pre-line ${contentClass}`}>
                                  {content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Full Text Fallback */}
                      {(!assessmentResult.ai_recommendations.ai_recommendation?.structured_sections || 
                        Object.keys(assessmentResult.ai_recommendations.ai_recommendation.structured_sections).length === 0) && 
                       assessmentResult.ai_recommendations.ai_recommendation?.full_text && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                            Complete AI Analysis
                          </h4>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {assessmentResult.ai_recommendations.ai_recommendation.full_text}
                          </div>
                        </div>
                      )}

                      {/* Call to Action */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border dark:border-gray-600">
                        <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          Ready to Get Started?
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          These AI-generated recommendations are based on comprehensive analysis of your specific site conditions. 
                          For implementation support, consider consulting with local rainwater harvesting experts.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                            Find Local Experts
                          </Button>
          
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border dark:border-red-800/30">
                      <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                        AI Recommendations Unavailable
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                        {assessmentResult.ai_recommendations.error || 'AI recommendations could not be generated at this time.'}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Don't worry - you can still access detailed technical analysis and basic recommendations below.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Basic Recommendations (Fallback) */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg dark:text-white">
                  <span>Technical Summary</span>
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
          <p>This report is generated by Jalsanchay - A Central Ground Water Board Initiative</p>
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