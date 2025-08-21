"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BarChart3 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (role === "admin") router.push("/admin/dashboard")
    else if (role === "evaluator") router.push("/evaluator/dashboard")
    else if (role === "candidate") router.push("/candidate/dashboard")
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Question Bank System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive evaluation platform for technical assessments and candidate management
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <Card className="hover:shadow-lg transition-shadow max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Login Portal</CardTitle>
              <CardDescription>Access your account to manage evaluations or take assessments</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
              <div className="mt-3">
                <Link href="/register/company">
                  <Button variant="outline" size="sm" className="w-full">
                    Register Company
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Question Banks</h3>
            <p className="text-sm text-gray-600">Organize questions by subject and category for targeted assessments</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Candidate Management</h3>
            <p className="text-sm text-gray-600">Create accounts and assign evaluations with secure URL access</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold mb-2">Analytics & Results</h3>
            <p className="text-sm text-gray-600">Track performance with detailed category-wise breakdowns</p>
          </div>
        </div>
      </div>
    </div>
  )
}
