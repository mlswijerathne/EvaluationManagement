"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mockApi from "@/lib/mockApi"
import CandidateManager from "@/components/candidate-manager"
import { updateCandidateEvaluationResults } from "@/lib/evaluationResults"

export default function AdminCandidatesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [companyName, setCompanyName] = useState<string>("TechNova Pvt Ltd")
  const [candidates, setCandidates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadCandidates = () => {
    try { 
      // Update evaluation results first
      updateCandidateEvaluationResults();
      setCandidates(JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('candidates') || '[]') : '[]')) 
    } catch(e) { 
      setCandidates([]) 
    }
  }

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem("adminAuth") : null
    const email = typeof window !== 'undefined' ? (localStorage.getItem("adminEmail") || "admin@example.com") : "admin@example.com"
    const storedCompany = typeof window !== 'undefined' ? localStorage.getItem('companyName') : null
    
    if (!auth) router.push('/login')
    else {
      setIsAuthenticated(true)
      setAdminEmail(email)
      if (storedCompany) setCompanyName(storedCompany)
      loadCandidates()
      
      // Check for candidateId in URL query params
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const candidateId = urlParams.get('candidateId');
        
        if (candidateId) {
          // Wait for candidates to load then find and show the candidate profile
          const checkCandidates = setInterval(() => {
            const candidate = candidates.find((c) => c.id === candidateId);
            if (candidate) {
              clearInterval(checkCandidates);
              // Use setTimeout to ensure the component has fully rendered
              setTimeout(() => {
                const viewingCandidateEvent = new CustomEvent('viewCandidate', { detail: candidate });
                window.dispatchEvent(viewingCandidateEvent);
              }, 500);
            }
          }, 200);
          
          // Clear interval after 5 seconds to avoid infinite checking
          setTimeout(() => clearInterval(checkCandidates), 5000);
        }
      }
    }
  }, [router])

  const handlePromote = async (id: string, email?: string, name?: string) => {
    const confirmed = confirm(`Promote ${name || email || id} to Evaluator?`)
    if (!confirmed) return
    
    setIsLoading(true)
    try {
      await mockApi.promoteCandidate(id)
      loadCandidates()
      alert('Promoted (mock)')
    } catch (error) {
      console.error('Error promoting candidate:', error)
      alert('Failed to promote candidate')
    } finally {
      setIsLoading(false)
    }
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage Candidates</CardTitle>
          <CardDescription>Search, view, and manage all candidates in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateManager
            candidates={candidates}
            onSendEmail={handleSendEmail}
            onPromote={handlePromote}
            isAdmin={true}
            refreshCandidates={loadCandidates}
          />
        </CardContent>
      </Card>
    </div>
  )
}
