"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BarChart3, ArrowLeft } from "lucide-react"

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
  const [attemptDetails, setAttemptDetails] = useState<any | null>(null)
  const [areaScores, setAreaScores] = useState<Array<{ name: string; score: number }>>([])

  useEffect(() => {
    ;(async () => {
      // show a quick loading state then query mockApi for latest attempt for this token
      try {
        const email = localStorage.getItem("candidateEmail") || "demo@candidate"
        const { mockApi } = await import("@/lib/mockApi")
        const attempts = await mockApi.getCandidateAttempts(email)
        const latest = (attempts || []).find((a: any) => a.evaluationId === params.token) || attempts?.[0]

        const mockData: CompletionData = {
          evaluationTitle: "Full Stack Developer Assessment",
          candidateName: "John Doe",
          completedAt: latest ? new Date(latest.takenAt) : new Date(),
          duration: latest ? latest.duration : 75,
          totalQuestions: latest?.answers ? Object.keys(latest.answers).length : 5,
          answeredQuestions: latest?.answers ? Object.values(latest.answers).filter((ans: any) => ans.selectedAnswers.length > 0).length : 5,
          score: latest?.score,
          showResults: true,
        }

        setAttemptDetails(latest || null)
        setCompletionData(mockData)
        
        // Set area scores if available
        if (latest && latest.areaScores) {
          setAreaScores(latest.areaScores);
        }
      } catch (e) {
        // fallback
        setCompletionData({
          evaluationTitle: "Full Stack Developer Assessment",
          candidateName: "John Doe",
          completedAt: new Date(),
          duration: 75,
          totalQuestions: 5,
          answeredQuestions: 5,
          score: 82,
          showResults: true,
        })
        
        // Set fallback area scores
        setAreaScores([
          { name: "Technical Skills", score: 85 },
          { name: "Communication", score: 75 },
          { name: "Problem Solving", score: 80 }
        ])
      } finally {
        setIsLoading(false)
      }
    })()
  }, [params.token])

  const handleBackToHome = () => {
    router.back()
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
                    <Badge className={` ${completionData.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {completionData.score >= 50 ? 'Pass' : 'Fail'}
                    </Badge>
                    <p className="mt-2 text-sm text-gray-600">Feedback: {attemptDetails?.feedback || 'Strong understanding of core concepts. Review database section for minor gaps.'}</p>
                    {attemptDetails && (
                      <div className="mt-3 text-xs text-gray-500">Submitted at: {new Date(attemptDetails.takenAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                
                {areaScores.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="font-medium mb-3 text-sm">Area Performance Breakdown</h4>
                    <div className="space-y-4">
                      {areaScores.map((area, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{area.name}</span>
                            <span className="font-semibold">{area.score}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                area.score >= 80 ? 'bg-green-600' : 
                                area.score >= 70 ? 'bg-blue-600' : 
                                area.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${area.score}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {area.score >= 80 && 'Excellent performance'}
                            {area.score >= 70 && area.score < 80 && 'Good performance'}
                            {area.score >= 60 && area.score < 70 && 'Satisfactory performance'}
                            {area.score < 60 && 'Needs improvement'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-4">Evaluation ID: {params.token}</p>
              <Link href="/candidate/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
