"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import CountUp from "@/components/CountUp"
import AnimatedBenefits from "@/components/AnimatedBenefits"
import SpotlightCard from "@/components/SpotlightCard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-green-900">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Your{" "}
              <span className="gradient-text-animated">
                Rainwater Harvesting
              </span>{" "}
              Potential
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Assess the feasibility of rooftop rainwater harvesting at your location. 
              Get personalized recommendations for sustainable water management and groundwater conservation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <Link href="/assessment">Check Your Potential</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 transition-all duration-300">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <CountUp 
                end={68} 
                suffix="%" 
                className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                duration={2500}
              />
              <div className="text-gray-600 dark:text-gray-300">Water Stress Reduction Potential</div>
            </div>
            <div className="text-center">
              <CountUp 
                end={15} 
                prefix="₹" 
                suffix="K" 
                className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2"
                duration={2500}
              />
              <div className="text-gray-600 dark:text-gray-300">Average Annual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                <CountUp 
                  end={3} 
                  className="inline"
                  duration={2000}
                />
                -
                <CountUp 
                  end={5} 
                  suffix=" Years" 
                  className="inline"
                  duration={2000}
                />
              </div>
              <div className="text-gray-600 dark:text-gray-300">Typical ROI Period</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Assessment Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides detailed analysis and actionable insights for your rainwater harvesting project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <CardTitle className="dark:text-white">Feasibility Analysis</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Detailed assessment of rooftop rainwater harvesting potential based on your property specifications
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🌧️</span>
                  </div>
                  <CardTitle className="dark:text-white">Rainfall Data</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Local rainfall patterns and runoff generation capacity analysis for your specific location
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💧</span>
                  </div>
                  <CardTitle className="dark:text-white">Groundwater Info</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Information about principal aquifer and depth to groundwater level in your area
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <CardTitle className="dark:text-white">Structure Design</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Recommended dimensions for recharge pits, trenches, and shafts based on your requirements
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <CardTitle className="dark:text-white">Cost Analysis</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Detailed cost estimation and comprehensive cost-benefit analysis for your project
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>

            <SpotlightCard className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📍</span>
                  </div>
                  <CardTitle className="dark:text-white">GIS Integration</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Advanced GIS-based modeling and algorithmic analysis for precise recommendations
                  </CardDescription>
                </CardHeader>
              </Card>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Why Rainwater Harvesting Matters
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedBenefits>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Groundwater Conservation</h3>
                      <p className="text-gray-600 dark:text-gray-300">Replenish depleting groundwater levels and contribute to sustainable water management</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Savings</h3>
                      <p className="text-gray-600 dark:text-gray-300">Reduce water bills and dependency on municipal water supply systems</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Environmental Impact</h3>
                      <p className="text-gray-600 dark:text-gray-300">Reduce urban flooding and soil erosion while improving local water quality</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Energy Efficiency</h3>
                      <p className="text-gray-600 dark:text-gray-300">Reduce energy consumption for water pumping and treatment processes</p>
                    </div>
                  </div>
                </div>
              </AnimatedBenefits>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join the Movement</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be part of India's largest groundwater conservation initiative supported by CGWB
                </p>
                <Button size="lg" asChild className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                  <Link href="/assessment">Start Your Assessment</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Take the first step towards sustainable water management. 
            Get your personalized rainwater harvesting assessment in just a few minutes.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
            <Link href="/assessment">Get Your Assessment</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RH</span>
                </div>
                <span className="text-xl font-bold">RainHarvest</span>
              </div>
              <p className="text-gray-400 dark:text-gray-300">
                Empowering communities through sustainable water management and groundwater conservation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                <li>CGWB Initiative</li>
                <li>Scientific Approach</li>
                <li>GIS-based Analysis</li>
                <li>Community Impact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Regional Languages</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-300">
            <p>&copy; 2025 RainHarvest Platform. A Central Ground Water Board Initiative.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}