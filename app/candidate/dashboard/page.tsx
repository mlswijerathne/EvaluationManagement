"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, CheckCircle, AlertCircle, Home, BarChart3 } from "lucide-react"

export default function CandidateDashboard() {
  const [candidateEmail, setCandidateEmail] = useState("")
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("evaluations")
  const router = useRouter()

  useEffect(() => {
    const candidateAuth = localStorage.getItem("candidateAuth")
    const email = localStorage.getItem("candidateEmail")

    if (!candidateAuth) {
      router.push("/login")
      return
    }

    setCandidateEmail(email || "")

    const mockEvaluations = [
      {
        id: 1,
        title: "React Developer Assessment",
        description: "Comprehensive React.js evaluation covering hooks, components, and state management",
        duration: 60,
        status: "pending",
        dueDate: "2024-01-20",
        accessToken: "react-eval-001",
      },
      {
        id: 2,
        title: "Full Stack Developer Test",
        description: "Complete evaluation covering frontend and backend technologies",
        duration: 90,
        status: "completed",
        score: 85,
        completedDate: "2024-01-15",
        accessToken: "fullstack-eval-002",
      },
    ]

    setEvaluations(mockEvaluations)
    // load recent attempts for results portal preview
    ;(async () => {
      try {
        const { mockApi } = await import("@/lib/mockApi")
        const email = localStorage.getItem("candidateEmail") || "demo@candidate"
        const recent = await mockApi.getCandidateAttempts(email)
        setAttempts(recent)
      } catch (e) {
        // ignore in mock
      }
    })()
  }, [router])

  const handleStartEvaluation = (accessToken: string) => {
    router.push(`/evaluation/${accessToken}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Candidate Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Candidate</span>
              <span className="text-xs text-blue-600">({candidateEmail})</span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("candidateAuth")
                localStorage.removeItem("candidateEmail")
                localStorage.removeItem("userRole")
                router.push("/")
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "overview" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === "overview" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("evaluations")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "evaluations" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileText className={`w-5 h-5 ${activeTab === "evaluations" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="font-medium">My Evaluations</span>
            </button>

            <button
              onClick={() => router.push("/candidate/results")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "results" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart3 className={`w-5 h-5 ${activeTab === "results" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="font-medium">Results Portal</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Welcome back, {candidateEmail}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Assigned Evaluations</p>
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
                        <p className="text-sm font-medium text-gray-600">Recent Results</p>
                        <p className="text-3xl font-bold text-gray-900">{attempts.length}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time Remaining</p>
                        <p className="text-3xl font-bold text-gray-900">—</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {attempts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Recent Attempts</h3>
                  <div className="grid gap-3">
                    {attempts.slice(0, 3).map((a) => (
                      <Card key={a.id} className="hover:shadow">
                        <CardContent className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{a.evaluationId}</div>
                            <div className="text-sm text-gray-600">{new Date(a.takenAt).toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">{a.score}%</div>
                            <div className="text-sm text-gray-600">{a.passed ? "Pass" : "Fail"}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "evaluations" && (
            <div className="grid gap-6">
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{evaluation.title}</CardTitle>
                        <CardDescription className="mt-2">{evaluation.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(evaluation.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(evaluation.status)}
                          {evaluation.status}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          Duration: {evaluation.duration} minutes
                        </div>
                        {evaluation.status === "pending" && evaluation.dueDate && (
                          <p className="text-sm text-gray-600">Due: {evaluation.dueDate}</p>
                        )}
                        {evaluation.status === "completed" && evaluation.score && (
                          <p className="text-sm text-green-600 font-medium">Score: {evaluation.score}%</p>
                        )}
                      </div>

                      {evaluation.status === "pending" && (
                        <Button onClick={() => handleStartEvaluation(evaluation.accessToken)}>Start Evaluation</Button>
                      )}
                      {evaluation.status === "completed" && (
                        <Button variant="outline" onClick={() => handleStartEvaluation(evaluation.accessToken)}>
                          View Results
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
