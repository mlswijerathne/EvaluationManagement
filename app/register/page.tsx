"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import mockApi from "@/lib/mockApi"

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const emailParam = params?.get("email") || "john.doe@students.com"
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    if (!name || !email || !password) return alert("Fill all fields")
    // Simple hash placeholder (DO NOT use in production)
    const hash = btoa(password)
    await mockApi.registerCandidate(email, name, hash)
    alert("Registered (mock). You can now login with candidate credentials.")
    localStorage.setItem("candidateAuth", "true")
    localStorage.setItem("candidateEmail", email)
    localStorage.setItem("userRole", "candidate")
    router.push("/candidate/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Complete Registration</CardTitle>
            <CardDescription>Join the platform via invite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegister}>Complete Registration</Button>
                <Button variant="outline" onClick={() => router.push("/")}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
