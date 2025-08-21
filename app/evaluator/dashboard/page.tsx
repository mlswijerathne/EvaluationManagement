"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Users, FileText, BarChart3, Plus, LogOut, Home } from "lucide-react"
import Link from "next/link"
import mockApi from "@/lib/mockApi"

export default function EvaluatorDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState<string>("")
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" })

  useEffect(() => {
    const auth = localStorage.getItem("evaluatorAuth")
    const e = localStorage.getItem("evaluatorEmail") || "evaluator1@technova.com"
    if (!auth) {
      router.push("/login")
      return
    }
    setIsAuthenticated(true)
    setEmail(e)
  const storedCompany = typeof window !== 'undefined' ? localStorage.getItem("companyName") : null
  if (storedCompany) setCompanyName(storedCompany)
    // load candidates and evaluations from mock storage or seed
    setCandidates(JSON.parse(localStorage.getItem("candidates") || "[]"))
    const mockEvals = JSON.parse(localStorage.getItem("evaluations") || "[]")
    setEvaluations(mockEvals.length ? mockEvals : [
      { id: "ev-1", title: "Computer Science - Midterm", questions: 20, duration: 60, status: "Active" },
      { id: "ev-2", title: "HR Policies Quiz", questions: 10, duration: 20, status: "Draft" },
    ])
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("evaluatorAuth")
    localStorage.removeItem("evaluatorEmail")
    router.push("/")
  }

  const recordAudit = (entry: string) => {
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`${entry} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
  }

  const handleInviteCandidate = async () => {
    if (!inviteForm.email || !inviteForm.name) return alert("Please provide name and email")
    const record = await mockApi.inviteCandidate({ name: inviteForm.name, email: inviteForm.email }, email)
    setCandidates((s) => [record, ...s])
    recordAudit(`Evaluator invited candidate ${inviteForm.email}`)
    alert(`Invitation sent to ${inviteForm.email} (mock)`)
    setInviteForm({ name: "", email: "" })
    setShowInviteForm(false)
  }

  const handleAssign = async (evaluationId: string) => {
    await mockApi.assignEvaluation(evaluationId, "Assigned Group", email)
    recordAudit(`Evaluator ${email} assigned evaluation ${evaluationId}`)
    alert(`Assigned ${evaluationId} (mock)`)
  }

  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [candidateAttempts, setCandidateAttempts] = useState<any[]>([])

  const loadAttempts = async (candidateEmail: string) => {
    const attempts = await mockApi.getCandidateAttempts(candidateEmail)
    setCandidateAttempts(attempts)
  }

  const handleSelectCandidate = (c: any) => {
    setSelectedCandidate(c)
    loadAttempts(c.email)
    setActiveTab("results")
  }

  const handleExportAttempts = async () => {
    if (!selectedCandidate) return alert("Select a candidate first")
    const rows = candidateAttempts.map((a) => ({ id: a.id, evaluationId: a.evaluationId, score: a.score, passed: a.passed, takenAt: a.takenAt, duration: a.duration }))
    const { filename, csv } = await mockApi.exportCsv(rows, `attempts_${selectedCandidate.email}.csv`)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) return <div>Loading...</div>

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "questions", label: "Questions", icon: BookOpen },
    { id: "evaluations", label: "Evaluations", icon: FileText },
    { id: "candidates", label: "Candidates", icon: Users },
    { id: "results", label: "Results", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Evaluator Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Evaluator</span>
              <span className="text-xs text-blue-600">({email})</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Question Banks</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.max(3, Math.floor(Math.random() * 10))}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                    <p className="text-3xl font-bold text-gray-900">{candidates.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Evaluations</p>
                    <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.floor(Math.random() * 200)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions in your evaluator account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium">You assigned Midterm Exam to Batch 2025</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium">New candidate invited: alice@example.com</p>
                          <p className="text-xs text-gray-500">4 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <Link href="/evaluator/evaluations" className="block">
                    <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4 text-center flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700">Manage Evaluations</h3>
                          <p className="text-sm text-gray-600">Author and assign assessments</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <button onClick={() => setActiveTab("candidates")} className="block w-full">
                    <Card className="border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4 text-center flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-700">Invite Candidate</h3>
                          <p className="text-sm text-gray-600">Send candidate invites and manage assignments</p>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Question Banks</CardTitle>
                  <CardDescription>Manage your question repositories by subject</CardDescription>
                </div>
                <Link href="/evaluator/questions">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Questions
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["React", "Angular", "Spring Boot", "Python", "Node.js"].map((subject) => (
                    <div key={subject} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{subject}</h3>
                        <p className="text-sm text-gray-500">{Math.floor(Math.random() * 50) + 20} questions</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const auth = typeof window !== 'undefined' ? localStorage.getItem('evaluatorAuth') : null
                            if (!auth) {
                              router.push('/login')
                              return
                            }
                            router.push(`/evaluator/questions?bank=${encodeURIComponent(subject)}`)
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "evaluations" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Evaluations</CardTitle>
                  <CardDescription>Create and manage candidate assessments</CardDescription>
                </div>
                <Link href="/evaluator/evaluations">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Evaluation
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Full Stack Developer Assessment</h3>
                      <p className="text-sm text-gray-500">React, Node.js, Python • 90 minutes</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <span className="text-sm text-gray-500">2 candidates</span>
                      <Link href={`/evaluator/evaluations?eval=${encodeURIComponent("eval-1")}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Frontend Developer - React</h3>
                      <p className="text-sm text-gray-500">React, Angular • 60 minutes</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <span className="text-sm text-gray-500">1 candidate</span>
                      <Link href={`/evaluator/evaluations?eval=${encodeURIComponent("eval-2")}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => {
                        const auth = typeof window !== 'undefined' ? localStorage.getItem('evaluatorAuth') : null
                        if (!auth) {
                          router.push('/login')
                          return
                        }
                        router.push('/evaluator/evaluations')
                      }}
                    >
                      View All Evaluations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invite Candidate</CardTitle>
                  <CardDescription>Send invites to candidates to join</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showInviteForm ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Invite a new candidate to join via email</p>
                      <Button onClick={() => setShowInviteForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Invite
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <Input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleInviteCandidate}>Send Invite</Button>
                        <Button variant="outline" onClick={() => setShowInviteForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assigned Candidates</CardTitle>
                  <CardDescription>People you've invited or assigned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidates.map((c: any) => (
                      <div key={c.id || c.email} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{c.name}</h4>
                          <p className="text-sm text-gray-500">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleSelectCandidate(c)}>View Attempts</Button>
                          <div className="text-sm text-gray-500">{c.role || 'candidate'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "results" && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Candidate Performance</CardTitle>
                <CardDescription>Quick drill-downs and pass/fail summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">70%</p>
                    <p className="text-sm text-gray-600">Pass Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">82%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href="/evaluator/results">
                    <Button>
                      View Full Results
                    </Button>
                  </Link>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Select a candidate from the Candidates panel to view attempt history and detailed analytics (mock).</p>
                  {selectedCandidate ? (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{selectedCandidate.name} — {selectedCandidate.email}</h4>
                          <p className="text-sm text-gray-500">Attempt history</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={handleExportAttempts}>Export Attempts</Button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {candidateAttempts.map((a) => (
                          <div key={a.id} className="p-3 border rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-medium">{a.evaluationId}</p>
                              <p className="text-sm text-gray-500">Taken: {new Date(a.takenAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">Score: {a.score}</p>
                              <p className="text-sm text-gray-500">{a.passed ? 'Passed' : 'Failed'} • {a.duration} min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
