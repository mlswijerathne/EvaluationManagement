"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BarChart3 } from "lucide-react"

interface CompletionData {
  evaluationTitle: string
  candidateName: string
  completedAt: Date
  duration: number // minutes taken
  totalQuestions: number
  answeredQuestions: number
  score?: number
  showResults: boolean
}

export default function EvaluationCompleted() {
  const params = useParams()
  const router = useRouter()
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock completion data - replace with real API call
    const mockData: CompletionData = {
      evaluationTitle: "Full Stack Developer Assessment",
      candidateName: "John Doe",
      completedAt: new Date(),
      duration: 75, // minutes taken out of 90 allowed
      totalQuestions: 5,
      answeredQuestions: 5,
      score: 85, // Optional - only if results are immediately available
      showResults: false, // Set to true if admin allows immediate result viewing
    }

    setTimeout(() => {
      setCompletionData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [params.token])

  const handleBackToHome = () => {
    router.push("/candidate/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your submission...</p>
        </div>
      </div>
    )
  }

  if (!completionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Unable to load completion data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Evaluation Completed!</CardTitle>
            <CardDescription>Thank you for completing the {completionData.evaluationTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Submission Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Candidate</p>
                  <p className="font-medium">{completionData.candidateName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completed At</p>
                  <p className="font-medium">{completionData.completedAt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time Taken</p>
                  <p className="font-medium">{completionData.duration} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600">Questions Answered</p>
                  <p className="font-medium">
                    {completionData.answeredQuestions}/{completionData.totalQuestions}
                  </p>
                </div>
              </div>
            </div>

            {completionData.showResults && completionData.score && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Your Results
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-green-600">{completionData.score}%</div>
                  <div className="text-sm text-gray-600">
                    <p>Overall Score</p>
                    <Badge className="bg-green-100 text-green-800">
                      {completionData.score >= 80
                        ? "Excellent"
                        : completionData.score >= 60
                          ? "Good"
                          : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-4">Evaluation ID: {params.token}</p>
              <Button onClick={handleBackToHome} className="bg-green-600 hover:bg-green-700">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
