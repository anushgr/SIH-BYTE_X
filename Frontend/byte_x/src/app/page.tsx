import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Next.js + shadcn/ui + Tailwind CSS v4
          </h1>
          <p className="text-lg text-gray-600">
            Testing our perfectly working setup with the latest versions!
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✅ Tailwind CSS v4.0 • No config file needed!
          </div>
        </div>

        {/* Test Components Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 - Button Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>
                Testing different button variants with shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Form Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Testing input and label components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Enter your password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit</Button>
            </CardFooter>
          </Card>

          {/* Card 3 - Tailwind CSS v4 Features */}
          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS v4 Features</CardTitle>
              <CardDescription>
                Testing modern CSS features and utilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-red-500 rounded-lg shadow-lg"></div>
                <div className="h-16 bg-green-500 rounded-lg shadow-lg"></div>
                <div className="h-16 bg-blue-500 rounded-lg shadow-lg"></div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                <p className="font-semibold">CSS-first Configuration</p>
                <p className="text-sm opacity-90">No tailwind.config.js needed!</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-yellow-300 rounded-lg shadow-sm"></div>
                <div className="h-12 bg-indigo-300 rounded-lg shadow-md"></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 - Responsive Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Design</CardTitle>
              <CardDescription>
                Testing responsive utilities and modern layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div className="h-8 bg-cyan-300 rounded"></div>
                <div className="h-8 bg-cyan-400 rounded"></div>
                <div className="h-8 bg-cyan-500 rounded"></div>
              </div>
              <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-600">
                  Resize window to see responsive behavior
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New v4 Features Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Tailwind CSS v4 New Features</CardTitle>
            <CardDescription>
              Showcasing what's new in v4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-2">⚡ Faster Builds</h3>
                <p className="text-sm text-gray-600">Up to 5x faster full builds, 100x faster incremental builds</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-2">🎨 CSS-first Config</h3>
                <p className="text-sm text-gray-600">Configuration directly in CSS, no more JS config files</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold mb-2">🔧 Zero Config</h3>
                <p className="text-sm text-gray-600">Automatic content detection, no paths configuration needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl mb-2">🎉</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Setup Complete!
          </h2>
          <p className="text-green-700">
            Your Next.js application with Tailwind CSS v4 and shadcn/ui is working perfectly!
          </p>
        </div>
      </div>
    </main>
  )
}