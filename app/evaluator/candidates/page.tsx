"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import mockApi from "@/lib/mockApi"
import CandidateManager from "@/components/candidate-manager"
import { updateCandidateEvaluationResults } from "@/lib/evaluationResults"

export default function EvaluatorCandidatesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [evaluatorEmail, setEvaluatorEmail] = useState("")
  const [companyName, setCompanyName] = useState<string>("TechNova Pvt Ltd")
  const [candidates, setCandidates] = useState<any[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [bulkEmails, setBulkEmails] = useState("")

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem("evaluatorAuth") : null
    const email = typeof window !== 'undefined' ? (localStorage.getItem("evaluatorEmail") || "evaluator@example.com") : "evaluator@example.com"
    const storedCompany = typeof window !== 'undefined' ? localStorage.getItem('companyName') : null
    if (!auth) router.push('/login')
    else {
      setIsAuthenticated(true)
      setEvaluatorEmail(email)
      if (storedCompany) setCompanyName(storedCompany)
      try { 
        // Update evaluation results first
        updateCandidateEvaluationResults();
        setCandidates(JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('candidates') || '[]') : '[]')) 
        
        // Check for candidateId in URL query params
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const candidateId = urlParams.get('candidateId');
          
          if (candidateId) {
            // Find the candidate and simulate clicking on their profile
            const candidate = candidates.find((c) => c.id === candidateId);
            if (candidate) {
              // Use setTimeout to ensure the component has fully rendered
              setTimeout(() => {
                const viewingCandidateEvent = new CustomEvent('viewCandidate', { detail: candidate });
                window.dispatchEvent(viewingCandidateEvent);
              }, 500);
            }
          }
        }
      } catch(e) { 
        setCandidates([]) 
      }
    }
  }, [router])

  const handleSendEmail = (to: string, name?: string) => {
    const sent = JSON.parse(localStorage.getItem('sentEmails') || '[]')
    const subject = `Message from ${companyName}`
    const body = `Hello ${name || ''},\n\nYou have been contacted by your evaluator.\n\nRegards,\n${companyName}`
    sent.push({ to, subject, body, sentAt: new Date().toISOString() })
    localStorage.setItem('sentEmails', JSON.stringify(sent))
    alert('Email sent (mock)')
  }
  
  const handleInviteCandidate = async () => {
    if (!inviteEmail) {
      alert("Please enter an email address")
      return
    }
    
    const record = await mockApi.inviteCandidate({ name: "", email: inviteEmail }, evaluatorEmail)
    setCandidates(prev => [record, ...prev])
    alert(`Invitation sent to ${inviteEmail} (mock)`)
    setInviteEmail("")
  }
  
  const handleBulkInvite = async () => {
    if (!bulkEmails.trim()) {
      alert("Please enter email addresses")
      return
    }
    
    const emails = bulkEmails
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email)
      
    if (emails.length === 0) {
      alert("No valid emails found")
      return
    }
    
    let invitedCount = 0
    
    for (const email of emails) {
      try {
        const record = await mockApi.inviteCandidate({ name: "", email }, evaluatorEmail)
        setCandidates(prev => [record, ...prev])
        invitedCount++
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error)
      }
    }
    
    alert(`${invitedCount} candidates invited successfully (mock)`)
    setBulkEmails("")
  }

  if (!isAuthenticated) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/evaluator/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <h1 className="text-2xl font-bold">Candidates</h1>
              <p className="text-gray-600">Manage candidates and assign them to evaluations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite Candidates</CardTitle>
            <CardDescription>Send invitations to candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="inviteEmail">Invite candidate</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="inviteEmail"
                    type="email"
                    placeholder="candidate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={handleInviteCandidate}>Send Invite</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="bulkEmails">Bulk Invite</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="flex items-center"
                  >
                    {showInviteForm ? "Hide" : "Show"} 
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showInviteForm ? "rotate-180" : ""}`} />
                  </Button>
                </div>
                
                {showInviteForm && (
                  <div className="space-y-2">
                    <Textarea
                      id="bulkEmails"
                      placeholder="Enter multiple emails separated by commas, semicolons or new lines"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleBulkInvite}>Send Bulk Invite</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
            <CardDescription>View all registered candidates and manage their evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No candidates found</p>
                <p className="text-sm text-gray-400 mt-2">Invite candidates to join your evaluations</p>
              </div>
            ) : (
              <CandidateManager
                candidates={candidates}
                onSendEmail={handleSendEmail}
                isAdmin={false}
                onCandidateClick={(candidate: any) => {
                  // Optional: Add any additional actions when clicking on a candidate
                }}
                refreshCandidates={() => {
                  try { 
                    setCandidates(JSON.parse(localStorage.getItem('candidates') || '[]')) 
                  } catch(e) { 
                    setCandidates([]) 
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
