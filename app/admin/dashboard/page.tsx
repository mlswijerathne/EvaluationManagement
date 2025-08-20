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

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
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
    if (!auth) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      setAdminEmail(email)
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

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

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
        </div>
      </div>
    </div>
  )
}
