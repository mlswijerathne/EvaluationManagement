"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, CheckCircle, AlertCircle } from "lucide-react"

export default function CandidateDashboard() {
  const [candidateEmail, setCandidateEmail] = useState("")
  const [evaluations, setEvaluations] = useState<any[]>([])
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Evaluations</h1>
            <p className="text-gray-600">Welcome back, {candidateEmail}</p>
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

        {evaluations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Evaluations Assigned</h3>
              <p className="text-gray-600">You don't have any evaluations assigned at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
