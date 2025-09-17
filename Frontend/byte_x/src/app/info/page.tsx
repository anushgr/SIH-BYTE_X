"use client"

import { useEffect, useMemo, useState } from "react"
import SpotlightCard from "@/components/SpotlightCard"
import AnimatedBenefits from "@/components/AnimatedBenefits"

export default function InfoPage() {
  const stateToUrl: Record<string, string> = useMemo(() => ({
    "Andhra Pradesh": "https://irrigation.ap.gov.in/",
    "Arunachal Pradesh": "https://wrdarunachal.nic.in/",
    "Assam": "https://waterresources.assam.gov.in/",
    "Bihar": "https://wrd.bihar.gov.in/",
    "Chhattisgarh": "https://wrid.cg.gov.in/",
    "Delhi": "https://djb.gov.in/",
    "Goa": "https://goawrd.gov.in/schemes-policies/rain-water-harvesting",
    "Gujarat": "https://guj-nwrws.gujarat.gov.in/",
    "Haryana": "https://www.harrws.nic.in/",
    "Himachal Pradesh": "https://hpiph.org/",
    "Jammu & Kashmir": "https://jalshakti.jk.gov.in/",
    "Jharkhand": "https://wrdjharkhand.nic.in/",
    "Karnataka": "https://waterresources.karnataka.gov.in/",
    "Kerala": "https://waterresources.kerala.gov.in/",
    "Madhya Pradesh": "https://www.mpwrd.gov.in/",
    "Maharashtra": "https://wrd.maharashtra.gov.in/",
    "Manipur": "https://manipur.gov.in/",
    "Meghalaya": "https://megdams.gov.in/",
    "Mizoram": "https://irrigation.mizoram.gov.in/",
    "Nagaland": "https://nagaland.gov.in/",
    "Odisha": "https://www.dowrodisha.gov.in/",
    "Punjab": "https://irrigation.punjab.gov.in/",
    "Rajasthan": "https://waterresources.rajasthan.gov.in/",
    "Sikkim": "https://sikkim.gov.in/",
    "Tamil Nadu": "https://www.tn.gov.in/department/22",
    "Telangana": "https://irrigation.telangana.gov.in/",
    "Tripura": "https://wrtripura.nic.in/",
    "Uttar Pradesh": "https://irrigation.up.nic.in/",
    "Uttarakhand": "https://www.uk.gov.in/",
    "West Bengal": "https://wbiwd.gov.in/",
    "Andaman & Nicobar Islands": "https://andaman.gov.in/",
    "Chandigarh": "https://chandigarh.gov.in/",
    "Puducherry": "https://pwd.py.gov.in/",
  }), [])

  const [selectedState, setSelectedState] = useState<string>("")
  const selectedUrl = selectedState ? stateToUrl[selectedState] : ""
  const selectedHost = useMemo(() => {
    if (!selectedUrl) return ""
    try { return new URL(selectedUrl).hostname } catch { return selectedUrl }
  }, [selectedUrl])

  // Re-apply translations for newly mounted elements when a state is selected
  useEffect(() => {
    if (!selectedUrl) return
    try {
      const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en'
      // small delay to ensure the elements are in the DOM
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }))
      }, 0)
    } catch {}
  }, [selectedUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="gradient-text-animated">
                Rainwater Harvesting
              </span>{" "}
              in India
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Rooftop Rainwater Harvesting (RTRWH) and Artificial Recharge (AR) are recommended by the Central Ground Water Board (CGWB) to conserve water and replenish aquifers. This comprehensive guide explains practical methods, benefits, requirements, and FAQs to help you get started.
            </p>
          </header>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Key Benefits</h2>
          <AnimatedBenefits>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💧</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Groundwater Recharge</h3>
                  <p className="text-gray-600 dark:text-gray-300">Improve water security and replenish aquifers naturally</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cost Savings</h3>
                  <p className="text-gray-600 dark:text-gray-300">Reduce dependence on municipal supply and lower bills</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🌊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Flood Mitigation</h3>
                  <p className="text-gray-600 dark:text-gray-300">Reduce urban flooding and stormwater run-off</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Water Quality</h3>
                  <p className="text-gray-600 dark:text-gray-300">Better water quality in wells through dilution and recharge</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Climate Resilience</h3>
                  <p className="text-gray-600 dark:text-gray-300">Support sustainable water management practices</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Energy Efficiency</h3>
                  <p className="text-gray-600 dark:text-gray-300">Reduce energy consumption for pumping and treatment</p>
                </div>
              </SpotlightCard>
            </div>
          </AnimatedBenefits>
        </div>
      </section>

      {/* Common Methods Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Common Methods</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore various RTRWH and Artificial Recharge techniques suitable for different scenarios and spaces
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Rooftop to Storage Tank</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Convey roof run-off via gutters and downpipes to a screened filter and store in an above/underground tank for non-potable uses (flushing, gardening, cleaning). Add disinfection for potable use.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/rooftop_rainwater.jpg"
                    alt="Rooftop rainwater harvesting storage tank"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🕳️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Rooftop to Recharge Pit</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Divert filtered roof water to a recharge pit filled with pebbles/sand/gravel to enhance percolation and recharge shallow aquifers.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/recharge_pit.jpg"
                    alt="Recharge pit for roof water"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📏</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Recharge Trench</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Linear trench backfilled with coarse media to intercept runoff from paved areas or multiple downpipes. Suitable for limited space along plot boundaries.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/recharge_trench.jpg"
                    alt="Recharge trench for rainwater"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Recharge Well / Shaft</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">A deep bored shaft or existing defunct well used to convey filtered water to deeper aquifers through a silt trap and screen assembly.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/borewell_recharge.jpeg"
                    alt="Recharge well used for artificial recharge"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏞️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Percolation Pond/Tank</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Small pond constructed to store stormwater and enhance percolation. Effective in campuses, layouts, and peri-urban areas.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/percolation_lake.jpg"
                    alt="Percolation tank used for groundwater recharge"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Traditional Systems</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Johads, Baolis/Stepwells, Tankas, Kuls/Guls, Khadins, Virdas, Ahar-Pyne etc. remain context-appropriate in many regions and inspire modern designs.</p>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src="/images/rwh/stepwell.jpg"
                    alt="Traditional stepwell (baori) in Rajasthan"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">General Requirements</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Essential components and considerations for successful rainwater harvesting implementation
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Clean Catchment</h3>
                <p className="text-gray-600 dark:text-gray-300">Clean roof catchment and secure gutters/downpipes sized for local peak rainfall</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🌊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">First-Flush Diverter</h3>
                <p className="text-gray-600 dark:text-gray-300">First-flush diverter to discard initial dirty runoff; leaf/debris screens</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-Stage Filtration</h3>
                <p className="text-gray-600 dark:text-gray-300">Multi-stage filtration (coarse → fine media) before storage/recharge</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Safe Overflow</h3>
                <p className="text-gray-600 dark:text-gray-300">Safe overflow routing to drains or recharge features</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🪣</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Storage Tank</h3>
                <p className="text-gray-600 dark:text-gray-300">Storage tank with access hatch, mosquito-proof vent, and isolation valves</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recharge Components</h3>
                <p className="text-gray-600 dark:text-gray-300">For recharge: silt trap, inspection chamber, and graded media in pits/trenches</p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Planning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Planning, Sizing, and Approvals</h2>
              </div>
              <div className="space-y-6 text-lg">
                <p className="text-gray-600 dark:text-gray-300">
                  Sizing depends on roof area, runoff coefficient, and local annual rainfall. Our assessment tool estimates RTRWH and AR dimensions based on your inputs.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Many states/ULBs mandate rainwater harvesting in building bye-laws. Consult local development authority/municipal guidelines and CGWB advisories before construction.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* State Selection Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 backdrop-blur-sm">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  <span data-translate="State-specific Government Links">State-specific Government Links</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  <span data-translate="Select your state to visit the official water resources or related government portal. Look for rainwater harvesting guidelines, mandates, and application procedures on the destination site.">
                    Select your state to visit the official water resources or related government portal. Look for rainwater harvesting guidelines, mandates, and application procedures on the destination site.
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-center">
                <label htmlFor="state" className="text-lg font-semibold text-gray-900 dark:text-white sm:w-48">
                  <span data-translate="Choose State">Choose State</span>
                </label>
                <select
                  id="state"
                  className="w-full sm:max-w-md rounded-xl border-2 bg-white dark:bg-gray-800 p-4 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {Object.keys(stateToUrl).sort().map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {selectedUrl && (
                <div className="mt-8 text-center">
                  <a
                    href={selectedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-4 text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="opacity-90" data-translate="Open:">Open:</span>
                    <span className="font-bold">{selectedHost}</span>
                    <span className="text-xl">→</span>
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    <span data-translate="Note: Pages may be in English or the respective state language. Use site search for 'Rainwater Harvesting' or 'RTRWH'.">
                      Note: Pages may be in English or the respective state language. Use site search for 'Rainwater Harvesting' or 'RTRWH'.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Operation and Maintenance Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Operation and Maintenance</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Essential maintenance practices to ensure optimal performance and longevity
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🧹</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Pre-Monsoon Cleaning</h3>
                <p className="text-gray-600 dark:text-gray-300">Clean roof, gutters, filters, and service first-flush device before the monsoon season</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Quarterly Inspection</h3>
                <p className="text-gray-600 dark:text-gray-300">Regular inspection of tanks, screens, recharge pits, and silt traps</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🚜</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Annual Desilting</h3>
                <p className="text-gray-600 dark:text-gray-300">Desilt recharge pits/trenches annually or as needed to maintain efficiency</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🧪</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Water Quality Testing</h3>
                <p className="text-gray-600 dark:text-gray-300">Disinfect stored water if used for potable purposes; test quality periodically</p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Common questions and answers about rainwater harvesting implementation
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is rainwater safe for drinking?</h3>
                <p className="text-gray-600 dark:text-gray-300">Yes, with appropriate filtration and disinfection. For most homes, prioritize non-potable uses and follow BIS/health guidance for potable use.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How much can my roof harvest?</h3>
                <p className="text-gray-600 dark:text-gray-300">Annual harvest ≈ Roof area × Annual rainfall × Runoff coefficient. The app auto-estimates using local rainfall and your roof details.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is rainwater harvesting mandatory?</h3>
                <p className="text-gray-600 dark:text-gray-300">Many states and cities mandate RWH in building bye-laws for new or large plots. Check your local ULB/authority.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What maintenance is required?</h3>
                <p className="text-gray-600 dark:text-gray-300">Regular cleaning of catchments, filters, and inspection of storage/recharge structures, especially before the monsoon.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can I retrofit RWH to existing buildings?</h3>
                <p className="text-gray-600 dark:text-gray-300">Yes. Downpipes can be connected to a filter and either a storage tank or a recharge structure depending on your goal and space.</p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What are the cost benefits?</h3>
                <p className="text-gray-600 dark:text-gray-300">Typically pays for itself in 3-5 years through reduced water bills and increased property value. Long-term savings can be substantial.</p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* References Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SpotlightCard className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/50 dark:to-green-900/50 backdrop-blur-sm">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">References and Further Reading</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Authoritative sources and additional resources for rainwater harvesting
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Central Ground Water Board (CGWB)</h3>
                  <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors" href="https://cgwb.gov.in" target="_blank" rel="noreferrer">
                    cgwb.gov.in
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💧</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ministry of Jal Shakti</h3>
                  <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors" href="https://jalshakti-dowr.gov.in" target="_blank" rel="noreferrer">
                    jalshakti-dowr.gov.in
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">India Water Portal</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Rainwater Harvesting FAQs and case studies</p>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>
    </div>
  )
}


