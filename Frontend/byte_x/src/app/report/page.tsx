"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

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
      <div className="no-print bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Rainwater Harvesting Assessment Report
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Generated on {reportDate}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={printReport} variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 w-full sm:w-auto text-sm sm:text-base">
                Print Report
              </Button>
              <Link href="/assessment">
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 w-full sm:w-auto text-sm sm:text-base">← Back to Assessment</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

        {/* CRISP SUMMARY SECTION */}
        <div className="space-y-6 mb-12">
          {/* Overall Feasibility Score Card */}
          {assessmentResult?.feasibility_assessment && !assessmentResult.feasibility_assessment.error && (
            <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Rainwater Harvesting Assessment Summary
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {assessmentData?.address}, {assessmentData?.city}, {assessmentData?.state}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generated on {reportDate}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${
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
                    <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${
                      assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Excellent' 
                        ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                        : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Good'
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        : assessmentResult.feasibility_assessment.overall_feasibility.rating === 'Moderate'
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                    }`}>
                      {assessmentResult.feasibility_assessment.overall_feasibility.rating} Feasibility
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Annual Collection Potential */}
            {assessmentResult?.runoff_analysis && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(assessmentResult.runoff_analysis.runoff_calculations.net_annual_collectible_liters / 1000).toFixed(0)}K L
                  </div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Annual Collection</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Potential Water Savings</div>
                </CardContent>
              </Card>
            )}

            {/* Monthly Savings */}
            {assessmentResult?.preliminary_results && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{assessmentResult.preliminary_results.potential_monthly_savings_inr}
                  </div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Monthly Savings</div>
                  <div className="text-xs text-green-600 dark:text-green-300">Estimated Cost Reduction</div>
                </CardContent>
              </Card>
            )}

            {/* Payback Period */}
            {assessmentResult?.feasibility_assessment?.detailed_analysis?.economic_analysis && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {typeof assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years === 'number' 
                      ? `${assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years} Yrs`
                      : assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years
                    }
                  </div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Payback Period</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-300">Return on Investment</div>
                </CardContent>
              </Card>
            )}

            {/* Total Investment */}
            {assessmentResult?.structure_recommendations && (
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ₹{(assessmentResult.structure_recommendations.total_estimated_cost / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Investment</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300">System Setup Cost</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Personalized Benefits */}
          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 dark:text-green-300">✅ Personalized Benefits</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">💧 Annual Water Savings:</span>
                  <span className="font-semibold dark:text-white">
                    {assessmentResult?.runoff_analysis 
                      ? `${(assessmentResult.runoff_analysis.runoff_calculations.net_annual_collectible_liters / 1000).toFixed(0)}K Liters`
                      : 'Calculating...'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">💰 Annual Cost Savings:</span>
                  <span className="font-semibold dark:text-white">
                    ₹{assessmentResult?.preliminary_results 
                      ? (assessmentResult.preliminary_results.potential_monthly_savings_inr * 12).toLocaleString()
                      : 'Calculating...'
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">🌱 CO₂ Reduction:</span>
                  <span className="font-semibold dark:text-white">
                    {assessmentResult?.runoff_analysis 
                      ? `${((assessmentResult.runoff_analysis.runoff_calculations.net_annual_collectible_liters * 0.298) / 1000).toFixed(1)} kg/year`
                      : 'Calculating...'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">🏆 Primary Focus:</span>
                  <span className="font-semibold capitalize dark:text-white">
                    {assessmentResult?.structure_recommendations?.strategy || 'Optimization'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended System Summary */}
          {assessmentResult?.structure_recommendations && (
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-xl text-blue-700 dark:text-blue-300">🏗️ Recommended System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 dark:text-white">Primary Structures:</h4>
                    <ul className="space-y-2">
                      {assessmentResult.structure_recommendations.primary_structures.slice(0, 3).map((structure, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-sm dark:text-gray-300">{structure.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (₹{(structure.estimated_cost / 1000).toFixed(0)}K)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 dark:text-white">Key Advantages:</h4>
                    <ul className="space-y-2">
                      {assessmentResult.structure_recommendations.primary_structures[0]?.pros.slice(0, 3).map((pro, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-sm dark:text-gray-300">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Overview */}
          {assessmentResult?.structure_recommendations?.implementation_phases && (
            <Card className="border-l-4 border-orange-500">
              <CardHeader>
                <CardTitle className="text-xl text-orange-700 dark:text-orange-300">📅 Implementation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentResult.structure_recommendations.implementation_phases.map((phase, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <span className="font-bold text-orange-600 dark:text-orange-400">{phase.phase}</span>
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-semibold dark:text-white">{phase.title}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{phase.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs">
                          <span className="text-orange-600 dark:text-orange-400">⏱️ {phase.timeline}</span>
                          <span className="text-green-600 dark:text-green-400">💰 ₹{(phase.estimated_cost / 1000).toFixed(0)}K</span>
                          <span className={`px-2 py-1 rounded ${
                            phase.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            phase.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}>
                            {phase.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="border-l-4 border-indigo-500">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">🚀 Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold dark:text-white">Immediate Actions:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-500 mt-1">1.</span>
                      <span className="text-sm dark:text-gray-300">Contact local CGWB office for technical guidance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-500 mt-1">2.</span>
                      <span className="text-sm dark:text-gray-300">Get quotes from certified RWH contractors</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-500 mt-1">3.</span>
                      <span className="text-sm dark:text-gray-300">Apply for government subsidies and tax rebates</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold dark:text-white">Government Incentives:</h4>
                  <div className="text-sm space-y-1 dark:text-gray-300">
                    <p>• BWSSB property tax rebate (up to 50%)</p>
                    <p>• Depreciation benefits under Income Tax</p>
                    <p>• State government RWH subsidies</p>
                  </div>
                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-sm text-indigo-800 dark:text-indigo-200">
                      💡 <strong>Best Time to Install:</strong> Pre-monsoon period (March-May) for optimal setup
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Save Water and Money?</h3>
              <p className="mb-4 text-green-100">
                Your property shows {assessmentResult?.feasibility_assessment?.overall_feasibility.rating.toLowerCase()} potential for rainwater harvesting. 
                Start your journey towards water independence today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-green-600 hover:bg-gray-100">
                  Find Certified Contractors
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Contact CGWB Office
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DETAILED ANALYSIS SECTION */}
        <div className="border-t-4 border-gray-300 dark:border-gray-600 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Detailed Technical Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive assessment data, environmental factors, and technical specifications. 
              Click on any section below to explore detailed analysis and recommendations.
            </p>
          </div>

          <div className="space-y-6">
            {/* Assessment Summary and Property Details - Collapsible */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader 
                className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                onClick={() => toggleSection('personalInfo')}
              >
                <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>Assessment Summary & Property Details</span>
                  </div>
                  <span className="text-2xl">
                    {expandedSections.personalInfo ? '−' : '+'}
                  </span>
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Basic property information and user details
                </CardDescription>
              </CardHeader>
              {expandedSections.personalInfo && (
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h4>
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
                  </div>

                  {/* Location Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Location Details</h4>
                    <div className="space-y-3">
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
                    </div>
                  </div>

                  {/* Property Specifications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Property Specifications</h4>
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
                  </div>

                  {/* Current Water Usage */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Current Water Usage</h4>
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
                  </div>
                </CardContent>
              )}
            </Card>

            {/* RTRWH Structure Recommendations - Collapsible */}
            {assessmentResult?.structure_recommendations && !assessmentResult.structure_recommendations.error && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader 
                  className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                  onClick={() => toggleSection('structureRecommendations')}
                >
                  <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>🏗️</span>
                      <span>Recommended RTRWH Structures</span>
                    </div>
                    <span className="text-2xl">
                      {expandedSections.structureRecommendations ? '−' : '+'}
                    </span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Customized rainwater harvesting and artificial recharge structure recommendations
                  </CardDescription>
                </CardHeader>
                {expandedSections.structureRecommendations && (
                  <CardContent className="space-y-6">
                    {/* Strategy Overview */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Recommended Strategy</h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm capitalize">
                        <strong>{assessmentResult.structure_recommendations.strategy}</strong> approach
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
                          Roof: {assessmentResult.structure_recommendations.site_analysis.roof_area_sqm} m²
                          <br />
                          Open: {assessmentResult.structure_recommendations.site_analysis.open_space_sqm} m²
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
                          Annual Potential: {assessmentResult.structure_recommendations.site_analysis.annual_runoff_potential} L
                          <br />
                          Annual Demand: {assessmentResult.structure_recommendations.site_analysis.annual_water_demand} L
                        </p>
                      </div>
                    </div>

                    {/* Primary Structures */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Primary Structures</h4>
                      <div className="space-y-4">
                        {assessmentResult.structure_recommendations.primary_structures.map((structure, index) => (
                          <div key={index} className="border dark:border-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-lg dark:text-white">{structure.name}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{structure.type}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                  ₹{(structure.estimated_cost / 1000).toFixed(0)}K
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {structure.suitability}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Specifications</h6>
                                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                  {structure.capacity_liters && (
                                    <li>Capacity: {structure.capacity_liters.toLocaleString()} L</li>
                                  )}
                                  {structure.dimensions && (
                                    <li>Dimensions: {structure.dimensions}</li>
                                  )}
                                  <li>Lifespan: {structure.specifications.life_span}</li>
                                  <li>Maintenance: {structure.specifications.maintenance}</li>
                                </ul>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Advantages</h6>
                                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                  {structure.pros.slice(0, 4).map((pro, proIndex) => (
                                    <li key={proIndex}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Investment Summary */}
                    <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 p-4 rounded-lg border dark:border-blue-800/30">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Total Investment Summary</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Complete RWH System Setup</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Including all primary and secondary structures</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₹{(assessmentResult.structure_recommendations.total_estimated_cost / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Principal Aquifer Analysis - Collapsible */}
            {assessmentResult?.aquifer_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader 
                  className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                  onClick={() => toggleSection('aquiferAnalysis')}
                >
                  <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>💧</span>
                      <span>Principal Aquifer Analysis</span>
                    </div>
                    <span className="text-2xl">
                      {expandedSections.aquiferAnalysis ? '−' : '+'}
                    </span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Underground water source information for your location
                  </CardDescription>
                </CardHeader>
                {expandedSections.aquiferAnalysis && (
                  <CardContent className="space-y-4">
                    {assessmentResult.aquifer_analysis.error ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                        <p className="text-yellow-800 dark:text-yellow-200">
                          {assessmentResult.aquifer_analysis.message || 'Aquifer data not available for this location.'}
                        </p>
                        {assessmentResult.aquifer_analysis.message && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                            {assessmentResult.aquifer_analysis.message}
                          </p>
                        )}
                      </div>
                    ) : assessmentResult.aquifer_analysis.aquifers && assessmentResult.aquifer_analysis.aquifers.length > 0 ? (
                      <>
                        {/* Summary Information */}
                        {assessmentResult.aquifer_analysis.summary && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Aquifer Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-blue-700 dark:text-blue-200">Total Aquifers:</span>
                                <span className="ml-2 font-medium dark:text-blue-100">{assessmentResult.aquifer_analysis.summary.total_aquifers}</span>
                              </div>
                              <div>
                                <span className="text-blue-700 dark:text-blue-200">Primary Aquifer:</span>
                                <span className="ml-2 font-medium dark:text-blue-100">{assessmentResult.aquifer_analysis.summary.primary_aquifer}</span>
                              </div>
                              <div>
                                <span className="text-blue-700 dark:text-blue-200">Overall Suitability:</span>
                                <span className="ml-2 font-medium dark:text-blue-100">{assessmentResult.aquifer_analysis.summary.overall_suitability}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Detailed Aquifer Information */}
                        {assessmentResult.aquifer_analysis.aquifers.map((aquifer, index) => (
                          <div key={index} className="border dark:border-gray-600 rounded-lg p-6 space-y-4">
                            {/* Basic Information */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{aquifer.basic_info.name}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                                  <p className="text-base dark:text-gray-200">{aquifer.basic_info.type}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                                  <p className="text-base dark:text-gray-200">{aquifer.basic_info.location}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Water Storage Capacity</p>
                                  <p className="text-base dark:text-gray-200">{aquifer.basic_info.water_storage}</p>
                                </div>
                              </div>
                            </div>

                            {/* Water Characteristics */}
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Water Characteristics</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Depth</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{aquifer.water_characteristics.depth.category}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{aquifer.water_characteristics.depth.description}</p>
                                  {aquifer.water_characteristics.depth.raw_data && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data: {aquifer.water_characteristics.depth.raw_data}</p>
                                  )}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Yield</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{aquifer.water_characteristics.yield.category}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{aquifer.water_characteristics.yield.description}</p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{aquifer.water_characteristics.yield.household_equivalent}</p>
                                  {aquifer.water_characteristics.yield.raw_data && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data: {aquifer.water_characteristics.yield.raw_data}</p>
                                  )}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Permeability</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{aquifer.water_characteristics.permeability.category}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{aquifer.water_characteristics.permeability.description}</p>
                                  {aquifer.water_characteristics.permeability.raw_data && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data: {aquifer.water_characteristics.permeability.raw_data}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* RWH Suitability */}
                            <div className={`p-4 rounded-lg border ${
                              aquifer.rwh_suitability.level.toLowerCase().includes('high') || aquifer.rwh_suitability.level.toLowerCase().includes('excellent')
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
                                : aquifer.rwh_suitability.level.toLowerCase().includes('moderate') || aquifer.rwh_suitability.level.toLowerCase().includes('good')
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                            }`}>
                              <h5 className={`font-semibold mb-2 ${
                                aquifer.rwh_suitability.level.toLowerCase().includes('high') || aquifer.rwh_suitability.level.toLowerCase().includes('excellent')
                                  ? 'text-green-900 dark:text-green-100'
                                  : aquifer.rwh_suitability.level.toLowerCase().includes('moderate') || aquifer.rwh_suitability.level.toLowerCase().includes('good')
                                  ? 'text-yellow-900 dark:text-yellow-100'
                                  : 'text-red-900 dark:text-red-100'
                              }`}>
                                RWH Suitability: {aquifer.rwh_suitability.level}
                              </h5>
                              <p className={`text-sm mb-2 ${
                                aquifer.rwh_suitability.level.toLowerCase().includes('high') || aquifer.rwh_suitability.level.toLowerCase().includes('excellent')
                                  ? 'text-green-700 dark:text-green-200'
                                  : aquifer.rwh_suitability.level.toLowerCase().includes('moderate') || aquifer.rwh_suitability.level.toLowerCase().includes('good')
                                  ? 'text-yellow-700 dark:text-yellow-200'
                                  : 'text-red-700 dark:text-red-200'
                              }`}>
                                {aquifer.rwh_suitability.description}
                              </p>
                              <p className={`text-sm font-medium ${
                                aquifer.rwh_suitability.level.toLowerCase().includes('high') || aquifer.rwh_suitability.level.toLowerCase().includes('excellent')
                                  ? 'text-green-800 dark:text-green-100'
                                  : aquifer.rwh_suitability.level.toLowerCase().includes('moderate') || aquifer.rwh_suitability.level.toLowerCase().includes('good')
                                  ? 'text-yellow-800 dark:text-yellow-100'
                                  : 'text-red-800 dark:text-red-100'
                              }`}>
                                Recommendation: {aquifer.rwh_suitability.recommendation}
                              </p>
                            </div>

                            {/* Seasonal Notes */}
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Seasonal Considerations</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Recharge Pattern</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.seasonal_notes.recharge}</p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Reliability</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.seasonal_notes.reliability}</p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Maintenance Needs</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.seasonal_notes.maintenance}</p>
                                </div>
                              </div>
                            </div>

                            {/* Technical Details */}
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Parameters</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Transmissivity</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.technical_details.transmissivity}</p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Storage Coefficient</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.technical_details.storage_coefficient}</p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Hydraulic Conductivity</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.technical_details.hydraulic_conductivity}</p>
                                </div>
                                <div>
                                  <h6 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Porosity</h6>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{aquifer.technical_details.porosity}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Location Information */}
                        {assessmentResult.aquifer_analysis.location && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Assessment Location</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Coordinates: {assessmentResult.aquifer_analysis.location.latitude.toFixed(6)}, {assessmentResult.aquifer_analysis.location.longitude.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400">
                          No aquifer data available for this location. This may indicate the area is outside major aquifer zones or data coverage.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Rainfall and Collection Analysis - Collapsible */}
            {assessmentResult?.rainfall_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader 
                  className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                  onClick={() => toggleSection('rainfallAnalysis')}
                >
                  <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>🌧️</span>
                      <span>Rainfall & Collection Analysis</span>
                    </div>
                    <span className="text-2xl">
                      {expandedSections.rainfallAnalysis ? '−' : '+'}
                    </span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Annual rainfall patterns and water collection potential
                  </CardDescription>
                </CardHeader>
                {expandedSections.rainfallAnalysis && (
                  <CardContent className="space-y-6">
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
                            {assessmentResult.rainfall_analysis.wettest_month.name} ({assessmentResult.rainfall_analysis.wettest_month.rainfall_mm}mm)
                          </span>
                        </div>
                      )}
                      {assessmentResult.rainfall_analysis.driest_month && (
                        <div className="flex justify-between">
                          <span className="dark:text-green-200">Driest Month:</span>
                          <span className="font-medium dark:text-green-100">
                            {assessmentResult.rainfall_analysis.driest_month.name} ({assessmentResult.rainfall_analysis.driest_month.rainfall_mm}mm)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Runoff Analysis if available */}
                    {assessmentResult?.runoff_analysis && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Collection Analysis</h4>
                        
                        {/* Collection Summary */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800/30">
                          <h5 className="font-semibold text-green-900 dark:text-green-100 mb-3">Annual Collection Potential</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="dark:text-green-200">Total Collectible:</span>
                              <span className="font-medium dark:text-green-100">
                                {(assessmentResult.runoff_analysis.runoff_calculations.net_annual_collectible_liters / 1000).toFixed(0)}K L
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="dark:text-green-200">Monthly Average:</span>
                              <span className="font-medium dark:text-green-100">
                                {(assessmentResult.runoff_analysis.runoff_calculations.average_monthly_collectible_liters / 1000).toFixed(1)}K L
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="dark:text-green-200">Collection Efficiency:</span>
                              <span className="font-medium dark:text-green-100">
                                {assessmentResult.runoff_analysis.runoff_calculations.collection_efficiency_percent}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="dark:text-green-200">Demand Fulfillment:</span>
                              <span className="font-medium dark:text-green-100">
                                {assessmentResult.runoff_analysis.water_demand_analysis.demand_fulfillment_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Soil & Groundwater Analysis - Collapsible */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader 
                className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                onClick={() => toggleSection('soilGroundwater')}
              >
                <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                  <div className="flex items-center space-x-2">
                    <span>🏔️</span>
                    <span>Soil & Groundwater Analysis</span>
                  </div>
                  <span className="text-2xl">
                    {expandedSections.soilGroundwater ? '−' : '+'}
                  </span>
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Site-specific soil conditions and groundwater characteristics
                </CardDescription>
              </CardHeader>
              {expandedSections.soilGroundwater && (
                <CardContent className="space-y-6">
                  {/* Soil Analysis */}
                  {assessmentResult?.soil_analysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Soil Analysis</h4>
                      {assessmentResult.soil_analysis.error ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                          <p className="text-yellow-800 dark:text-yellow-200">
                            {assessmentResult.soil_analysis.message || 'Soil data not available for this location.'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assessmentResult.soil_analysis.soil_type && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Soil Type</p>
                              <p className="text-base dark:text-gray-200">{assessmentResult.soil_analysis.soil_type}</p>
                            </div>
                          )}
                          {assessmentResult.soil_analysis.infiltration_rate && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Infiltration Rate</p>
                              <p className="text-base dark:text-gray-200">{assessmentResult.soil_analysis.infiltration_rate}</p>
                            </div>
                          )}
                          {assessmentResult.soil_analysis.suitability && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">RWH Suitability</p>
                              <p className="text-base dark:text-gray-200">{assessmentResult.soil_analysis.suitability}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aquifer Analysis */}
                  {assessmentResult?.aquifer_analysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Aquifer Analysis</h4>
                      {assessmentResult.aquifer_analysis.error ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                          <p className="text-yellow-800 dark:text-yellow-200">
                            {assessmentResult.aquifer_analysis.message || 'Aquifer data not available for this location.'}
                          </p>
                        </div>
                      ) : assessmentResult.aquifer_analysis.aquifers && assessmentResult.aquifer_analysis.aquifers.length > 0 && (
                        <div className="space-y-4">
                          {assessmentResult.aquifer_analysis.aquifers.slice(0, 2).map((aquifer, index) => (
                            <div key={index} className="border dark:border-gray-600 rounded-lg p-4">
                              <h5 className="font-semibold dark:text-white mb-2">{aquifer.basic_info.name}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                  <span className="ml-2 dark:text-gray-300">{aquifer.basic_info.type}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">RWH Suitability:</span>
                                  <span className="ml-2 dark:text-gray-300">{aquifer.rwh_suitability.level}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                {aquifer.rwh_suitability.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Groundwater Analysis */}
                  {assessmentResult?.groundwater_analysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Groundwater Monitoring</h4>
                      {assessmentResult.groundwater_analysis.error ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border dark:border-yellow-800/30">
                          <p className="text-yellow-800 dark:text-yellow-200">
                            {assessmentResult.groundwater_analysis.message || 'Groundwater monitoring data not available.'}
                          </p>
                        </div>
                      ) : assessmentResult.groundwater_analysis.nearest_station && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Nearest Monitoring Station</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-blue-700 dark:text-blue-200">Station:</span>
                              <span className="ml-2 dark:text-blue-100">{assessmentResult.groundwater_analysis.nearest_station.station_name}</span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-200">Distance:</span>
                              <span className="ml-2 dark:text-blue-100">{assessmentResult.groundwater_analysis.nearest_station.distance_km?.toFixed(1)} km</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Cost-Benefit Analysis - Collapsible */}
            {assessmentResult?.feasibility_assessment?.detailed_analysis?.economic_analysis && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader 
                  className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                  onClick={() => toggleSection('costBenefit')}
                >
                  <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>💰</span>
                      <span>Cost-Benefit Analysis</span>
                    </div>
                    <span className="text-2xl">
                      {expandedSections.costBenefit ? '−' : '+'}
                    </span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Investment analysis, savings potential, and return on investment
                  </CardDescription>
                </CardHeader>
                {expandedSections.costBenefit && (
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{(assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.estimated_system_cost_inr / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Total Investment</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ₹{(assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.estimated_annual_savings_inr / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">Annual Savings</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {typeof assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years === 'number'
                            ? `${assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years} Yrs`
                            : assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_period_years
                          }
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">Payback Period</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Investment Category</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.payback_category} - 
                        {assessmentResult.feasibility_assessment.detailed_analysis.economic_analysis.investment_attractiveness}
                      </p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Government Incentives Available</h5>
                      <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                        <li>• Property tax rebate up to 50% (varies by state)</li>
                        <li>• Income tax depreciation benefits</li>
                        <li>• State government subsidies for RWH installation</li>
                        <li>• Municipal corporation rebates and incentives</li>
                      </ul>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* AI-Powered Recommendations - Collapsible */}
            {assessmentResult?.ai_recommendations && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader 
                  className="pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
                  onClick={() => toggleSection('aiRecommendations')}
                >
                  <CardTitle className="flex items-center justify-between text-lg dark:text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">AI</span>
                      </div>
                      <span>AI-Powered Comprehensive Recommendations</span>
                    </div>
                    <span className="text-2xl">
                      {expandedSections.aiRecommendations ? '−' : '+'}
                    </span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Personalized insights generated using advanced AI analysis
                  </CardDescription>
                </CardHeader>
                {expandedSections.aiRecommendations && (
                  <CardContent>
                    {assessmentResult.ai_recommendations.success ? (
                      <div className="space-y-4">
                        {assessmentResult.ai_recommendations.ai_recommendation?.structured_sections && (
                          <div className="space-y-4">
                            {Object.entries(assessmentResult.ai_recommendations.ai_recommendation.structured_sections).map(([section, content]) => (
                              <div key={section} className="border-l-4 border-purple-500 pl-4">
                                <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 capitalize">
                                  {section.replace(/_/g, ' ')}
                                </h5>
                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(!assessmentResult.ai_recommendations.ai_recommendation?.structured_sections || 
                          Object.keys(assessmentResult.ai_recommendations.ai_recommendation.structured_sections).length === 0) && 
                         assessmentResult.ai_recommendations.ai_recommendation?.full_text && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border dark:border-purple-800/30">
                            <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap">
                              {assessmentResult.ai_recommendations.ai_recommendation.full_text}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border dark:border-red-800/30">
                        <p className="text-red-800 dark:text-red-200">
                          AI recommendations are currently unavailable. Please refer to the technical analysis above for detailed insights.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
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