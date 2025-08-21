"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import mockApi from "@/lib/mockApi"

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!companyName.trim() || !adminEmail.trim() || !password) return alert("Please fill all fields")
    setLoading(true)
    const hash = btoa(password)
    try {
      const res = await mockApi.registerCompanyAdmin(companyName.trim(), adminEmail.trim(), hash)
      if (!res.ok) {
        if (res.reason === "company_exists") return alert("A company with that name already exists.")
        if (res.reason === "admin_exists") return alert("An admin with that email already exists.")
        return alert("Registration failed (mock).")
      }
      alert("Company registered. A verification email was sent to the admin (mock).\nYou can view the verification link in Settings > Sent Emails (dev).")
      // store a lightweight flag so the onboarding can continue
      localStorage.setItem("companyOnboarded", "true")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Register Company</CardTitle>
            <CardDescription>Create your company and initial admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input value={companyName} onChange={(e: any) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input value={adminEmail} onChange={(e: any) => setAdminEmail(e.target.value)} placeholder="admin@acme.com" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Registering..." : "Register Company"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
