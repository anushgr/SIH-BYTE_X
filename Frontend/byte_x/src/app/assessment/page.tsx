"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { getCurrentLocationWithAddress } from "@/utils/geolocation"
import type { LocationResult } from "@/types/geolocation"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"

export default function Assessment() {
  const { user, isLoading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dwellers: "",
    roofArea: "",
    roofType: "",
    openSpace: "",
    currentWaterSource: "",
    monthlyWaterBill: ""
  })

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<string>("");

  // Dynamically import the map on client only
  const IndiaMap = useMemo(() => dynamic(() => import("@/components/IndiaMap"), { ssr: false }), [])

  // Auto-fill user information when user data is available
  useEffect(() => {
    if (user && !authLoading) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user, authLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLocation = async () => {
    setIsLoading(true);
    setLocationError("");
    setGeocodingStatus("");
    
    try {
      const result = await getCurrentLocationWithAddress();
      
      // Set coordinates
      setLocation({
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        accuracy: result.coordinates.accuracy,
      });
      
      // Handle reverse geocoding result
      if (result.geocoding.success && result.geocoding.data) {
        const addressData = result.geocoding.data;
        
        // Auto-fill form fields
        setFormData(prev => ({
          ...prev,
          address: addressData.address || prev.address,
          city: addressData.city || prev.city,
          state: addressData.state || prev.state,
          pincode: addressData.pincode || prev.pincode,
        }));
        
        setGeocodingStatus("Address details filled automatically!");
      } else {
        setGeocodingStatus(`Coordinates detected, but couldn't get address: ${result.geocoding.error || 'Unknown error'}`);
      }
    } catch (error) {
      setLocationError((error as Error).message || "Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Location:", location);
    // Here you would typically send the data to your backend
    alert("Assessment submitted! This would normally process your data and show results.");
  };

  const isFormValid = () => {
    return formData.name && formData.email && formData.address && 
           formData.dwellers && formData.roofArea && location;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      {/* Header */}
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rainwater Harvesting Assessment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Provide your property details to get a personalized assessment of your rainwater harvesting potential
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <span className="text-2xl">👤</span>
                  <span>Personal Information</span>
                  {user && (
                    <span className="ml-auto text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      Auto-filled from profile
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  {user 
                    ? "Information loaded from your profile. You can modify if needed."
                    : "Basic contact information for your assessment report"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your full name"}
                      required
                      disabled={authLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your email"}
                      required
                      disabled={authLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your phone number"}
                      disabled={authLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📍</span>
                    <CardTitle className="dark:text-white">Location Details</CardTitle>
                  </div>
                  <Button
                    type="button"
                    onClick={getLocation}
                    disabled={isLoading}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {isLoading ? "Getting Location..." : "Get Location automatically"}
                  </Button>
                </div>
                <CardDescription className="dark:text-gray-300">
                  Your property location for local climate and groundwater analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Will be auto-filled with GPS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Will be auto-filled with GPS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
                
                {/* GPS Location */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="mb-3">
                    <h3 className="font-semibold text-blue-900">GPS Coordinates & Address</h3>
                  </div>
                  
                  {location && (
                    <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-green-800 font-medium">Location Detected</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-green-700">
                        <div>Lat: {location.latitude.toFixed(6)}</div>
                        <div>Lng: {location.longitude.toFixed(6)}</div>
                        <div>Accuracy: {location.accuracy.toFixed(0)}m</div>
                      </div>
                    </div>
                  )}
                  
                  {geocodingStatus && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">🗺️</span>
                        <span className="text-blue-800 text-sm">{geocodingStatus}</span>
                      </div>
                    </div>
                  )}
                  
                  {locationError && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <span className="text-red-700">❌ {locationError}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-blue-600 mt-2">
                    💡 Your coordinates help us fetch local rainfall data and groundwater information for accurate assessment.
                  </div>

                  {/* Map showing user and stations */}
                  <div className="mt-4">
                    <IndiaMap
                      userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
                      onLocationChange={(lat, lng) => {
                        setLocation({ latitude: lat, longitude: lng, accuracy: 0 })
                        setGeocodingStatus("")
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Specifications */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <span className="text-2xl">🏠</span>
                  <span>Property Specifications</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Details about your property for calculating harvesting potential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dwellers">Number of Dwellers *</Label>
                    <Input
                      id="dwellers"
                      name="dwellers"
                      type="number"
                      min="1"
                      value={formData.dwellers}
                      onChange={handleInputChange}
                      placeholder="e.g., 4"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roofArea">Roof Area (sq ft) *</Label>
                    <Input
                      id="roofArea"
                      name="roofArea"
                      type="number"
                      min="100"
                      value={formData.roofArea}
                      onChange={handleInputChange}
                      placeholder="e.g., 1200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roofType">Roof Type</Label>
                    <select
                      id="roofType"
                      name="roofType"
                      value={formData.roofType}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Select roof type</option>
                      <option value="concrete">RCC/Concrete</option>
                      <option value="tile">Tile</option>
                      <option value="metal">Metal Sheets</option>
                      <option value="asbestos">Asbestos</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openSpace">Available Open Space (sq ft)</Label>
                    <Input
                      id="openSpace"
                      name="openSpace"
                      type="number"
                      min="0"
                      value={formData.openSpace}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentWaterSource">Current Water Source</Label>
                    <select
                      id="currentWaterSource"
                      name="currentWaterSource"
                      value={formData.currentWaterSource}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Select primary water source</option>
                      <option value="municipal">Municipal Supply</option>
                      <option value="borewell">Borewell</option>
                      <option value="well">Open Well</option>
                      <option value="tanker">Water Tanker</option>
                      <option value="mixed">Mixed Sources</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyWaterBill">Monthly Water Bill (₹)</Label>
                    <Input
                      id="monthlyWaterBill"
                      name="monthlyWaterBill"
                      type="number"
                      min="0"
                      value={formData.monthlyWaterBill}
                      onChange={handleInputChange}
                      placeholder="e.g., 2500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                className="px-12 py-3 text-lg"
                disabled={!isFormValid()}
              >
                Generate Assessment Report
              </Button>
            </div>
            
            {!isFormValid() && (
              <p className="text-center text-sm text-gray-600">
                Please fill in all required fields (*) and get your GPS location to proceed
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RH</span>
            </div>
            <span className="text-xl font-bold">RainHarvest</span>
          </div>
          <p className="text-gray-400 dark:text-gray-300">
            A Central Ground Water Board Initiative for Sustainable Water Management
          </p>
        </div>
      </footer>
    </div>
  )
}