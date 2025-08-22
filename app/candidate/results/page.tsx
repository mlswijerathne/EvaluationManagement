"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, FileText, ArrowLeft } from "lucide-react"

interface AreaScore {
  name: string;
  score: number;
}

interface Attempt {
  id: string;
  evaluationId: string;
  score: number;
  passed: boolean;
  takenAt: string;
  duration: number;
  feedback?: string;
  areaScores?: AreaScore[];
}

export default function CandidateResultsPortal() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [candidateEmail, setCandidateEmail] = useState<string>("guest")
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const email = localStorage.getItem("candidateEmail") || "demo@candidate"
        const { mockApi } = await import("@/lib/mockApi")
        const res = await mockApi.getCandidateAttempts(email)
        const feedbacksStore = JSON.parse(localStorage.getItem("candidateFeedbacks") || "{}")
        const feedbacksForEmail = feedbacksStore[email] || []
        // attach feedback per evaluation id if available
        const attemptsWithFeedback = (res || []).map((att: Attempt) => ({
          ...att,
          feedback: (feedbacksForEmail.find((f: { evaluationId: string, feedback: string }) => 
            f.evaluationId === att.evaluationId) || {}).feedback || att.feedback,
        }))
        setAttempts(attemptsWithFeedback)
      } catch (e) {
        setAttempts([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("candidateEmail") || "guest"
      setCandidateEmail(email)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Results Portal</h1>
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <span className="text-sm font-medium text-blue-700">Candidate</span>
              <span className="text-xs text-blue-600">({candidateEmail})</span>
            </div>
            <Link href="/candidate/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <button onClick={() => router.push('/candidate/dashboard')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">Overview</button>
            <button onClick={() => router.push('/candidate/dashboard')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50">My Evaluations</button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700">Results Portal</button>
          </nav>
        </div>

        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-4xl">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading results...</p>
              </div>
            ) : attempts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Published</h3>
                  <p className="text-gray-600">You have no published attempts yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {attempts.map((a) => (
                  <Card key={a.id} className="hover:shadow transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{a.evaluationId}</CardTitle>
                          <CardDescription className="text-sm">Taken: {new Date(a.takenAt).toLocaleString()}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{a.score}%</div>
                          <Badge className={a.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {a.passed ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        <p>Duration: {a.duration} minutes</p>
                        <p className="mt-2">Feedback: {a.feedback || 'No specific feedback provided.'}</p>
                        
                        {a.areaScores && a.areaScores.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 flex items-center mb-3">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Area Performance
                            </h4>
                            <div className="space-y-3">
                              {a.areaScores.map((area, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{area.name}</span>
                                    <span className="font-medium">{area.score}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-2 rounded-full">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        area.score >= 80 ? 'bg-green-500' :
                                        area.score >= 70 ? 'bg-blue-500' :
                                        area.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`} 
                                      style={{ width: `${area.score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-right">
                        <Button variant="outline" onClick={() => router.push(`/evaluation/${a.evaluationId}/completed`)}>
                          View Detailed Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
