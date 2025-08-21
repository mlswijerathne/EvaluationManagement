"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, LogIn, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Check if admin credentials
    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminEmail", email)
      localStorage.setItem("userRole", "admin")
      router.push("/admin/dashboard")
    }
    // Check if candidate credentials (demo candidates)
    else if (email.includes("candidate") && password === "candidate123") {
      localStorage.setItem("candidateAuth", "true")
      localStorage.setItem("candidateEmail", email)
      localStorage.setItem("userRole", "candidate")
      // Redirect to candidate dashboard or evaluation list
      router.push("/candidate/dashboard")
    }
    // Evaluator demo
    else if (email.includes("evaluator") && password === "evaluator123") {
      localStorage.setItem("evaluatorAuth", "true")
      localStorage.setItem("evaluatorEmail", email)
      localStorage.setItem("userRole", "evaluator")
      // Evaluators have their own portal
      router.push("/evaluator/dashboard")
    } else {
      setError("Invalid email or password")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem("userRole")
              } catch (e) {
                // ignore
              }
              router.push("/")
            }}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Access your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  <strong>Admin:</strong> admin@example.com / admin123
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Candidate:</strong> candidate@example.com / candidate123
                </p>
                <p className="text-xs text-gray-500">
                  <strong>Evaluator:</strong> evaluator1@technova.com / evaluator123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
