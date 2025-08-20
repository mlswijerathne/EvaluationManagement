"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, FileText, AlertCircle } from "lucide-react"

export default function CandidateEvaluationPage() {
  const params = useParams()
  const [evaluation, setEvaluation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Simulate fetching evaluation data based on token
    const fetchEvaluation = async () => {
      try {
        // Mock evaluation data - replace with real API call
        const mockEvaluation = {
          id: params.token,
          title: "Full Stack Developer Assessment",
          description: "Technical evaluation covering React, Node.js, and database concepts",
          duration: 90, // minutes
          totalQuestions: 25,
          subjects: ["React", "Node.js", "Database"],
          candidateName: "John Doe",
          candidateEmail: "john.doe@example.com",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: "pending", // pending, in-progress, completed, expired
        }

        setEvaluation(mockEvaluation)
      } catch (err) {
        setError("Failed to load evaluation. Please check your link.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluation()
  }, [params.token])

  const handleStartEvaluation = () => {
    // Navigate to evaluation interface
    window.location.href = `/evaluation/${params.token}/start`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading evaluation...</p>
        </div>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Evaluation Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The evaluation link is invalid or has expired."}</p>
            <p className="text-sm text-gray-500">Please contact your administrator for a new link.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{evaluation.title}</CardTitle>
            <CardDescription>{evaluation.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Candidate Information</h3>
              <p className="text-sm text-gray-600">Name: {evaluation.candidateName}</p>
              <p className="text-sm text-gray-600">Email: {evaluation.candidateEmail}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Duration</p>
                <p className="text-lg font-bold">{evaluation.duration} min</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Questions</p>
                <p className="text-lg font-bold">{evaluation.totalQuestions}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Subjects Covered</h3>
              <div className="flex flex-wrap gap-2">
                {evaluation.subjects.map((subject: string) => (
                  <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Once you start the evaluation, the timer will begin and cannot be paused.
                Make sure you have a stable internet connection and enough time to complete the assessment.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button size="lg" onClick={handleStartEvaluation} className="w-full">
                Start Evaluation
              </Button>
              <p className="text-xs text-gray-500 mt-2">Expires: {evaluation.expiresAt.toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
