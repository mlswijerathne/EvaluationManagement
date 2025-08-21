"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import mockApi from "@/lib/mockApi"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@students.com")
  useEffect(() => {
    try {
      const p = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") : null
      if (p) setEmail(p)
    } catch (e) {
      // ignore
    }
  }, [])
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
