"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Users, FileText, BarChart3, Plus, LogOut, Clock, CheckCircle, User, Home, X } from "lucide-react"
import Link from "next/link"
import mockApi from "@/lib/mockApi"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [companyName, setCompanyName] = useState<string>(
    localStorage.getItem("companyName") || "TechNova Pvt Ltd",
  )
  const [evaluators, setEvaluators] = useState<string[]>(
    JSON.parse(localStorage.getItem("evaluators") || "[\"evaluator1@technova.com\", \"evaluator2@technova.com\"]"),
  )
  const [auditLogs, setAuditLogs] = useState<string[]>(
    JSON.parse(localStorage.getItem("auditLogs") || "[\"System initialized: sample data loaded (2025-08-18)\"]"),
  )
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false)
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    const email = localStorage.getItem("adminEmail") || "admin@example.com"
    const storedCompany = localStorage.getItem("companyName")
    if (!auth) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      setAdminEmail(email)
      if (storedCompany) setCompanyName(storedCompany)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminEmail")
    router.push("/")
  }

  const handleAddCandidate = () => {
    if (!candidateForm.name || !candidateForm.email || !candidateForm.password) {
      alert("Please fill in all fields")
      return
    }

    console.log("Adding candidate:", candidateForm)
    alert("Candidate added successfully!")

    setCandidateForm({ name: "", email: "", password: "" })
    setShowAddCandidateForm(false)
  }

  const recordAudit = (entry: string) => {
    const timestamped = `${entry} on ${new Date().toLocaleString()}`
    const next = [timestamped, ...auditLogs]
    setAuditLogs(next)
    localStorage.setItem("auditLogs", JSON.stringify(next))
  }

  const handleInviteEvaluator = (email?: string) => {
    // keep backward compatibility when called programmatically
    const inviteEmail = email
    if (!inviteEmail) return
    if (evaluators.includes(inviteEmail)) {
      alert("Evaluator already invited")
      return
    }
    const next = [...evaluators, inviteEmail]
    setEvaluators(next)
    localStorage.setItem("evaluators", JSON.stringify(next))
    recordAudit(`Admin invited evaluator ${inviteEmail}`)
    alert(`Invitation sent to ${inviteEmail} (mock)`)
  }

  const handleInviteEvaluatorApi = async () => {
    const email = prompt("Evaluator email to invite")
    if (!email) return
    const res = await mockApi.inviteEvaluator(email, adminEmail)
    if (!res.ok) {
      alert(`Invite failed: ${res.reason || "unknown"}`)
      return
    }
    // refresh local evaluators list from mock storage
    setEvaluators(JSON.parse(localStorage.getItem("evaluators") || "[]"))
    recordAudit(`Admin invited evaluator ${email} (via API)`) 
    alert(`Invitation sent to ${email} (mock) - link: ${res.inviteLink}`)
  }

  const handleRegisterCompany = () => {
  const name = prompt("Company name", companyName) || companyName
  const email = prompt("Your admin email", adminEmail || "admin@example.com") || adminEmail
  setCompanyName(name)
  localStorage.setItem("companyName", name)
  // call mock api register
  mockApi.registerCompanyAdmin(name, email).then((r) => {
    if (r.ok) {
      // store admin email locally, but require verification flow
      localStorage.setItem("adminEmail", email)
      localStorage.setItem("adminAuth", "pending_verification")
      recordAudit(`Company registered: ${name} (admin ${email} created, verification sent)`)
      alert(`Company registered. A verification email was sent to ${email} (mock). Check 'sent emails' for token.`)
    } else {
      alert(`Register failed: ${r.reason}`)
    }
  })
  }

  const handleDeleteCompany = () => {
    const confirmed = window.confirm(
      "Delete company and ALL data? This will remove evaluations, questions, candidates, evaluators and logs.",
    )
    if (!confirmed) return
    // call mock API to record deletion snapshot and clear storage
    mockApi.deleteCompany(adminEmail).then(() => {
      setEvaluators([])
      setCompanyName("")
      setAuditLogs([`Company data deleted by ${adminEmail}`])
      localStorage.removeItem("adminAuth")
      localStorage.removeItem("adminEmail")
      alert("Company and all data removed (mock)")
    })
  }

  const handleExportAll = () => {
    // Export evaluations and questions as CSV files (mock)
    try {
      mockApi.exportAllAsJsonBlob().then(({ filename, json }) => {
        const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
        recordAudit("Admin exported all data (json)")
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleShowSentEmails = () => {
    const sent = JSON.parse(localStorage.getItem("sentEmails") || "[]")
    if (!sent.length) return alert("No sent emails (mock)")
    const text = sent.map((s: any) => `${s.to} — ${s.subject}\n${s.body}\n---`).join("\n")
    alert(text)
  }

  const handleSearchAudit = async () => {
    const q = prompt("Search audit logs (substring)")
    const results = await mockApi.searchAuditLogs({ q: q || undefined })
    setAuditLogs(results)
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "questions", label: "Questions", icon: BookOpen },
    { id: "evaluations", label: "Evaluations", icon: FileText },
    { id: "candidates", label: "Candidates", icon: Users },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "company", label: "Company", icon: Home },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Admin</span>
              <span className="text-xs text-blue-600">({adminEmail})</span>
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
                    <p className="text-3xl font-bold text-gray-900">5</p>
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
                    <p className="text-3xl font-bold text-gray-900">23</p>
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
                    <p className="text-3xl font-bold text-gray-900">8</p>
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
                    <p className="text-3xl font-bold text-gray-900">156</p>
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
                    <CardDescription>Latest actions in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">John Doe completed React Assessment</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">New candidate Sarah Wilson added</p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Angular Assessment expires in 2 days</p>
                          <p className="text-xs text-gray-500">6 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <Link href="/admin/create-evaluation" className="block">
                    <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4 text-center flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700">
                            Create New Evaluation
                          </h3>
                          <p className="text-sm text-gray-600">Build assessments from question banks</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/evaluations" className="block">
                    <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4 text-center flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700">
                            Assign Evaluations
                          </h3>
                          <p className="text-sm text-gray-600">Manage existing evaluations and assignments</p>
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
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-green-700">
                            Add Candidate
                          </h3>
                          <p className="text-sm text-gray-600">Create accounts and assign evaluations</p>
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
                <Link href="/admin/questions">
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
                        <Link href={`/admin/questions?bank=${encodeURIComponent(subject)}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
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
                <Link href="/admin/evaluations">
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
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <Link href="/admin/evaluations">
                      <Button variant="outline" className="bg-transparent">
                        View All Evaluations
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "candidates" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>Manage candidate accounts and assignments</CardDescription>
                </div>
                <Button onClick={() => setShowAddCandidateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </CardHeader>
              <CardContent>
                {showAddCandidateForm && (
                  <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Add New Candidate</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddCandidateForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="candidateName">Full Name</Label>
                        <Input
                          id="candidateName"
                          type="text"
                          placeholder="Enter candidate's full name"
                          value={candidateForm.name}
                          onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="candidateEmail">Email Address</Label>
                        <Input
                          id="candidateEmail"
                          type="email"
                          placeholder="Enter candidate's email"
                          value={candidateForm.email}
                          onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="candidatePassword">Temporary Password</Label>
                      <Input
                        id="candidatePassword"
                        type="password"
                        placeholder="Create a temporary password"
                        value={candidateForm.password}
                        onChange={(e) => setCandidateForm({ ...candidateForm, password: e.target.value })}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleAddCandidate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Candidate
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddCandidateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">John Doe</h3>
                      <p className="text-sm text-gray-500">john.doe@example.com</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Sarah Wilson</h3>
                      <p className="text-sm text-gray-500">sarah.wilson@example.com</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                  </div>
                  <div className="text-center py-4">
                    <Link href="/admin/evaluations">
                      <Button variant="outline" className="bg-transparent">
                        Manage All Candidates
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "results" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Results & Analytics</CardTitle>
                  <CardDescription>View candidate performance and detailed analytics</CardDescription>
                </div>
                <Link href="/admin/results">
                  <Button>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Results
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">84%</p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">92%</p>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">67min</p>
                      <p className="text-sm text-gray-600">Avg Duration</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">John Doe</h3>
                        <p className="text-sm text-gray-600">Full Stack Developer Assessment</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">84%</Badge>
                        <span className="text-sm text-gray-500">75min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Sarah Wilson</h3>
                        <p className="text-sm text-gray-600">Frontend Developer - React</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">76%</Badge>
                        <span className="text-sm text-gray-500">82min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Mike Johnson</h3>
                        <p className="text-sm text-gray-600">Backend Developer Assessment</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">85%</Badge>
                        <span className="text-sm text-gray-500">55min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "company" && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Settings</CardTitle>
                  <CardDescription>Manage company, evaluators and audit logs</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => handleRegisterCompany()}>
                    Register / Edit Company
                  </Button>
                  <Button variant="outline" onClick={() => handleInviteEvaluator()}>
                    Invite Evaluator
                  </Button>
                  <Button variant="outline" onClick={handleExportAll}>
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">Company</h3>
                    <p className="text-sm text-gray-600">{companyName || "(Not registered)"}</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" onClick={() => {
                        const name = prompt('Company name', companyName) || companyName
                        setCompanyName(name)
                        localStorage.setItem('companyName', name)
                        recordAudit(`Company registered: ${name}`)
                      }}>Register / Edit Company</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Evaluators</h4>
                      <span className="text-sm text-gray-500">{evaluators.length} invited</span>
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium">Invite evaluator</label>
                      <div className="mt-2 flex gap-2">
                        <Input id="inviteEmail" placeholder="evaluator@example.com" />
                        <Button onClick={() => {
                          const el = (document.getElementById('inviteEmail') as HTMLInputElement)
                          if (!el || !el.value) return alert('Enter email')
                          handleInviteEvaluator(el.value.trim())
                          el.value = ''
                        }}>Send Invite</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {evaluators.map((e) => (
                        <div key={e} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{e.split("@")[0]}</p>
                            <p className="text-xs text-gray-500">{e}</p>
                          </div>
                          <div className="text-sm text-gray-500">Invited</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Audit Logs</h4>
                      <Button variant="ghost" size="sm" onClick={() => { setAuditLogs([]); localStorage.removeItem('auditLogs') }}>
                        Clear
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 text-xs text-gray-600">
                      {auditLogs.length === 0 ? (
                        <p className="text-gray-400">No audit logs yet.</p>
                      ) : (
                        auditLogs.map((log, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="destructive" onClick={handleDeleteCompany}>
                      Delete Company (all data)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
