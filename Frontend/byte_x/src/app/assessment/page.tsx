"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { getCurrentLocationWithAddress, forwardGeocode } from "@/utils/geolocation"
import type { LocationResult } from "@/types/geolocation"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function Assessment() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
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
  const [nearestStation, setNearestStation] = useState<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    state: string;
    district?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<string>("");
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchNearestStation = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/groundwater/nearest-station?latitude=${latitude}&longitude=${longitude}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.nearest_station) {
        setNearestStation({
          id: data.nearest_station.id || data.nearest_station.station_id || data.nearest_station.station_code || 'unknown',
          name: data.nearest_station.name || data.nearest_station.station_name || 'Unknown Station',
          latitude: data.nearest_station.latitude,
          longitude: data.nearest_station.longitude,
          distance: data.nearest_station.distance || data.nearest_station.distance_km || 0,
          state: data.nearest_station.state || 'Unknown',
          district: data.nearest_station.district
        });
        
        console.log("Nearest station found:", data.nearest_station);
      }
    } catch (error) {
      console.error("Error fetching nearest station:", error);
      // Don't show error to user as this is a secondary feature
    }
  };

  const getLocation = async () => {
    setIsLoading(true);
    setLocationError("");
    setGeocodingStatus("");
    setNearestStation(null); // Reset station data
    
    try {
      const result = await getCurrentLocationWithAddress();
      
      // Set coordinates
      setLocation({
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        accuracy: result.coordinates.accuracy,
      });
      
      // Fetch nearest groundwater station
      await fetchNearestStation(result.coordinates.latitude, result.coordinates.longitude);
      
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
        setLastGeocodedAddress(addressData.address || "");
      } else {
        setGeocodingStatus(`Coordinates detected, but couldn't get address: ${result.geocoding.error || 'Unknown error'}`);
      }
    } catch (error) {
      setLocationError((error as Error).message || "Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeManualAddress = async () => {
    // Build a robust query using whatever parts user has provided
    const parts = [formData.address, formData.city, formData.state, formData.pincode]
      .map(p => (p || '').trim())
      .filter(p => p.length > 0);
    const fullAddress = parts.join(', ');

    // Require at least city or state (or a 3+ char address)
    const hasMinInfo = (
      (formData.address && formData.address.trim().length >= 3) ||
      (formData.city && formData.city.trim().length >= 2) ||
      (formData.state && formData.state.trim().length >= 2)
    );
    if (!hasMinInfo || fullAddress.length < 3) {
      setGeocodingStatus("Please enter address/city/state (and PIN if known) to get coordinates");
      return;
    }

    // Don't geocode if it's the same address we just geocoded
    if (fullAddress === lastGeocodedAddress) {
      return;
    }

    setIsGeocodingLoading(true);
    setLocationError("");
    setGeocodingStatus("Getting coordinates for your address...");
    setNearestStation(null); // Reset station data

    try {
      const result = await forwardGeocode(fullAddress);
      
      if (result.success && result.data) {
        setLocation({
          latitude: result.data.coordinates.latitude,
          longitude: result.data.coordinates.longitude,
          accuracy: 0, // Manual geocoding doesn't provide accuracy
        });
        
        // Fetch nearest groundwater station
        await fetchNearestStation(result.data.coordinates.latitude, result.data.coordinates.longitude);
        
        // Update form fields with more accurate data from geocoding
        setFormData(prev => ({
          ...prev,
          city: result.data?.city || prev.city,
          state: result.data?.state || prev.state,
          pincode: result.data?.pincode || prev.pincode,
        }));
        
        setGeocodingStatus(`✓ Coordinates found! Lat: ${result.data.coordinates.latitude.toFixed(6)}, Lng: ${result.data.coordinates.longitude.toFixed(6)}`);
        setLastGeocodedAddress(fullAddress);
      } else {
        setLocationError(result.error || "Could not find coordinates for this address");
        setGeocodingStatus("❌ Could not find coordinates for this address. Please check the address or use GPS location.");
      }
    } catch (error) {
      setLocationError((error as Error).message || "Failed to geocode address");
      setGeocodingStatus("❌ Error getting coordinates. Please try again or use GPS location.");
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert("Please fill in all required fields and get your GPS location");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for backend
      const assessmentData = {
        ...formData,
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy
      };

      console.log("Submitting Assessment Data:", assessmentData);
      
      // Call backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Backend Response:", result);

      // Store the assessment result in localStorage for the report page
      localStorage.setItem('assessmentResult', JSON.stringify(result));
      localStorage.setItem('assessmentFormData', JSON.stringify(formData));
      localStorage.setItem('assessmentLocation', JSON.stringify(location));

      // Navigate to report page
      router.push('/report');
      
    } catch (error) {
      console.error("Assessment submission error:", error);
      
      // Still navigate to report page even if API fails (for now)
      alert("Assessment data processed! Note: Backend API connection failed, but proceeding to report.");
      
      // Store form data for fallback display
      localStorage.setItem('assessmentFormData', JSON.stringify(formData));
      localStorage.setItem('assessmentLocation', JSON.stringify(location));
      
      router.push('/report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name && formData.email && formData.address && 
           formData.dwellers && formData.roofArea && location;
  };

  return (
    <>
      <LoadingSpinner 
        isLoading={isSubmitting} 
        message="Processing your assessment..." 
        overlay={true}
        colors={["#3b82f6", "#06b6d4", "#10b981", "#8b5cf6"]}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      {/* Header */}
      <section className="pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Rainwater Harvesting Assessment
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
            Provide your property details to get a personalized assessment of your rainwater harvesting potential
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
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
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your full name"}
                      required
                      disabled={authLoading}
                      className="h-10 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your email"}
                      required
                      disabled={authLoading}
                      className="h-10 text-base"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={authLoading ? "Loading..." : "Enter your phone number"}
                      disabled={authLoading}
                      className="h-10 text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="dark:text-white text-lg">Location Details</CardTitle>
                    <CardDescription className="dark:text-gray-300 text-sm mt-1">
                      Your property location for local climate and groundwater analysis
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={getLocation}
                    disabled={isLoading}
                    variant="default"
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 whitespace-nowrap self-start sm:self-auto"
                  >
                    {isLoading ? "Getting Location..." : "Get Location automatically"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Property Address *</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="h-10 text-base flex-1"
                      placeholder="Enter your complete address"
                      required
                    />
                    <Button
                      type="button"
                      onClick={geocodeManualAddress}
                      disabled={(function(){
                        const addr = (formData.address || '').trim();
                        const city = (formData.city || '').trim();
                        const state = (formData.state || '').trim();
                        const pin = (formData.pincode || '').trim();
                        const hasAddress = addr.length >= 3;
                        const hasCity = city.length >= 2;
                        const hasPincode = pin.length >= 3;
                        const hasOnlyState = state.length >= 2 && !hasAddress && !hasCity && !hasPincode;
                        const canEnable = (hasAddress || hasCity || hasPincode) && !hasOnlyState;
                        return isGeocodingLoading || !canEnable;
                      })()}
                      variant="outline"
                      size="default"
                      className="whitespace-nowrap"
                    >
                      {isGeocodingLoading ? "Getting..." : "Get Coordinates"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Will be auto-filled with GPS"
                      className="h-10 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Will be auto-filled with GPS"
                      className="h-10 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-medium">PIN Code</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter PIN code"
                      className="h-10 text-base"
                    />
                  </div>
                </div>
                
                {/* GPS Location */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="mb-3">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">GPS Coordinates & Address</h3>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Two ways to get coordinates: Use "Get Location automatically" for GPS, or enter address manually and click "Get Coordinates"
                    </p>
                  </div>
                  
                  {location && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded border border-green-200 dark:border-green-800 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span className="text-green-800 dark:text-green-200 font-medium text-sm">Location Detected</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-green-700 dark:text-green-300">
                        <div>Lat: {location.latitude.toFixed(6)}</div>
                        <div>Lng: {location.longitude.toFixed(6)}</div>
                        <div>Accuracy: {location.accuracy.toFixed(0)}m</div>
                      </div>
                    </div>
                  )}
                  
                  {geocodingStatus && (
                    <div className={`p-3 rounded border mb-3 ${
                      geocodingStatus.includes('✓') ? 'bg-green-50 border-green-200' : 
                      geocodingStatus.includes('✗') ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className={
                          geocodingStatus.includes('✓') ? 'text-green-600' :
                          geocodingStatus.includes('✗') ? 'text-red-600' :
                          'text-blue-600'
                        }>
                          {geocodingStatus.includes('Getting coordinates') ? '↻' : 
                           geocodingStatus.includes('✓') ? '✓' :
                           geocodingStatus.includes('✗') ? '✗' : 'ⓘ'}
                        </span>
                        <span className={`text-sm ${
                          geocodingStatus.includes('✓') ? 'text-green-800' :
                          geocodingStatus.includes('✗') ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {geocodingStatus}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {nearestStation && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-600">🎯</span>
                        <span className="text-blue-800 font-medium">Nearest Groundwater Station</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <div><strong>{nearestStation.name}</strong></div>
                        <div>Distance: ~{nearestStation.distance.toFixed(1)} km away</div>
    
                      </div>
                    </div>
                  )}
                  
                  {locationError && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <span className="text-red-700">✗ {locationError}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-blue-600 mt-2">
                    Your coordinates help us fetch local rainfall data and groundwater information for accurate assessment. We also locate the nearest groundwater monitoring station for reference.
                  </div>

                  {/* Map showing user and stations */}
                  <div className="mt-4">
                    <IndiaMap
                      userLocation={location ? { latitude: location.latitude, longitude: location.longitude } : null}
                      stations={nearestStation ? [{
                        id: nearestStation.id,
                        name: nearestStation.name,
                        latitude: nearestStation.latitude,
                        longitude: nearestStation.longitude
                      }] : []}
                      onLocationChange={async (lat, lng) => {
                        setLocation({ latitude: lat, longitude: lng, accuracy: 0 })
                        setGeocodingStatus("")
                        setNearestStation(null) // Reset station data
                        await fetchNearestStation(lat, lng) // Fetch new nearest station
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
            <div className="flex justify-center pt-16">
              <Button
                type="submit"
                size="lg"
                className="px-12 py-3 text-lg rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                disabled={!isFormValid()}
              >
                {isSubmitting ? (
                  <LoadingSpinner 
                    isLoading={true} 
                    message="Generating Report..." 
                    size="small"
                    colors={["#ffffff", "#e0f2fe", "#bae6fd", "#7dd3fc"]}
                  />
                ) : (
                  "Generate Assessment Report"
                )}
              </Button>
            </div>
            
            {!isFormValid() && !isSubmitting && (
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
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <span className="text-xl font-bold">Jalsanchay</span>
          </div>
          <p className="text-gray-400 dark:text-gray-300">
            A Central Ground Water Board Initiative for Sustainable Water Management
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}