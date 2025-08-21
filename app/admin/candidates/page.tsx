"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import mockApi from "@/lib/mockApi"

export default function AdminCandidatesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [companyName, setCompanyName] = useState<string>("TechNova Pvt Ltd")
  const [candidates, setCandidates] = useState<any[]>([])

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem("adminAuth") : null
    const email = typeof window !== 'undefined' ? (localStorage.getItem("adminEmail") || "admin@example.com") : "admin@example.com"
    const storedCompany = typeof window !== 'undefined' ? localStorage.getItem('companyName') : null
    if (!auth) router.push('/login')
    else {
      setIsAuthenticated(true)
      setAdminEmail(email)
      if (storedCompany) setCompanyName(storedCompany)
      try { setCandidates(JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('candidates') || '[]') : '[]')) } catch(e) { setCandidates([]) }
    }
  }, [router])

  const handlePromote = async (id: string, email?: string, name?: string) => {
    const confirmed = confirm(`Promote ${name || email || id} to Evaluator?`)
    if (!confirmed) return
    await mockApi.promoteCandidate(id)
    setCandidates(JSON.parse(localStorage.getItem('candidates') || '[]'))
    alert('Promoted (mock)')
  }

  const handleSendEmail = (to: string, name?: string) => {
    const sent = JSON.parse(localStorage.getItem('sentEmails') || '[]')
    const subject = `Message from ${companyName}`
    const body = `Hello ${name || ''},\n\nYou have been contacted by your admin.\n\nRegards,\n${companyName}`
    sent.push({ to, subject, body, sentAt: new Date().toISOString() })
    localStorage.setItem('sentEmails', JSON.stringify(sent))
    alert('Email sent (mock)')
  }

  if (!isAuthenticated) return <div>Loading...</div>

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-gray-600">Manage candidate accounts and assignments</p>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.email}</p>
                <p className="text-xs text-gray-400">Last activity: {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString() : '--'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={c.role === 'employee' ? 'bg-gray-100 text-gray-800' : c.role === 'candidate' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-100 text-blue-800'}>{c.role}</Badge>
                <Button size="sm" onClick={() => handleSendEmail(c.email, c.name)}>Send Email</Button>
                {c.role !== 'evaluator' && <Button size="sm" onClick={() => handlePromote(c.id, c.email, c.name)}>Promote</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
