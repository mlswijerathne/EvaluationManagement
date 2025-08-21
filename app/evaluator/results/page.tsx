"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Download, Eye, TrendingUp, Users, Award, Clock, BarChart3, User } from "lucide-react"
import Link from "next/link"

interface CandidateResult {
  id: string
  candidateName: string
  candidateEmail: string
  evaluationTitle: string
  evaluationId: string
  completedAt: Date
  duration: number // minutes taken
  totalQuestions: number
  correctAnswers: number
  overallScore: number
  categoryScores: { category: string; score: number; total: number }[]
  attemptNumber: number
  status: "completed" | "in-progress" | "not-started"
}

interface EvaluationAnalytics {
  evaluationId: string
  evaluationTitle: string
  totalCandidates: number
  completedCandidates: number
  averageScore: number
  averageDuration: number
  passRate: number // percentage with score >= 60
  categoryAnalytics: { category: string; averageScore: number; difficulty: "Easy" | "Medium" | "Hard" }[]
}

export default function ResultsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [evaluatorEmail, setEvaluatorEmail] = useState("")
  const [results, setResults] = useState<CandidateResult[]>([])
  const [evaluationAnalytics, setEvaluationAnalytics] = useState<EvaluationAnalytics[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [evaluationFilter, setEvaluationFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedResult, setSelectedResult] = useState<CandidateResult | null>(null)

  useEffect(() => {
    // Accept evaluator auth or fall back to admin auth (useful in dev)
    const auth = localStorage.getItem("evaluatorAuth") || localStorage.getItem("adminAuth")
    const email =
      localStorage.getItem("evaluatorEmail") || localStorage.getItem("adminEmail") || "evaluator@example.com"

    if (!auth) {
      router.push("/evaluator/login")
    } else {
      setIsAuthenticated(true)
      setEvaluatorEmail(email)
      loadMockData()
    }
  }, [router])

  const loadMockData = () => {
    // Mock candidate results
    const mockResults: CandidateResult[] = [
      {
        id: "1",
        candidateName: "John Doe",
        candidateEmail: "john.doe@example.com",
        evaluationTitle: "Full Stack Developer Assessment",
        evaluationId: "eval_1",
        completedAt: new Date("2024-01-15T10:30:00Z"),
        duration: 75,
        totalQuestions: 25,
        correctAnswers: 21,
        overallScore: 84,
        categoryScores: [
          { category: "React", score: 8, total: 10 },
          { category: "Node.js", score: 7, total: 8 },
          { category: "Python", score: 6, total: 7 },
        ],
        attemptNumber: 1,
        status: "completed",
      },
      {
        id: "2",
        candidateName: "Sarah Wilson",
        candidateEmail: "sarah.wilson@example.com",
        evaluationTitle: "Full Stack Developer Assessment",
        evaluationId: "eval_1",
        completedAt: new Date("2024-01-14T14:20:00Z"),
        duration: 82,
        totalQuestions: 25,
        correctAnswers: 19,
        overallScore: 76,
        categoryScores: [
          { category: "React", score: 9, total: 10 },
          { category: "Node.js", score: 6, total: 8 },
          { category: "Python", score: 4, total: 7 },
        ],
        attemptNumber: 1,
        status: "completed",
      },
      {
        id: "3",
        candidateName: "Mike Johnson",
        candidateEmail: "mike.johnson@example.com",
        evaluationTitle: "Frontend Developer - React",
        evaluationId: "eval_2",
        completedAt: new Date("2024-01-13T16:45:00Z"),
        duration: 55,
        totalQuestions: 20,
        correctAnswers: 17,
        overallScore: 85,
        categoryScores: [
          { category: "React", score: 15, total: 18 },
          { category: "JavaScript", score: 2, total: 2 },
        ],
        attemptNumber: 1,
        status: "completed",
      },
      {
        id: "4",
        candidateName: "Emily Davis",
        candidateEmail: "emily.davis@example.com",
        evaluationTitle: "Backend Developer Assessment",
        evaluationId: "eval_3",
        completedAt: new Date("2024-01-12T11:15:00Z"),
        duration: 68,
        totalQuestions: 22,
        correctAnswers: 16,
        overallScore: 73,
        categoryScores: [
          { category: "Spring Boot", score: 11, total: 15 },
          { category: "Database", score: 5, total: 7 },
        ],
        attemptNumber: 2,
        status: "completed",
      },
      {
        id: "5",
        candidateName: "Alex Chen",
        candidateEmail: "alex.chen@example.com",
        evaluationTitle: "Full Stack Developer Assessment",
        evaluationId: "eval_1",
        completedAt: new Date(),
        duration: 0,
        totalQuestions: 25,
        correctAnswers: 0,
        overallScore: 0,
        categoryScores: [],
        attemptNumber: 1,
        status: "in-progress",
      },
    ]

    // Mock evaluation analytics
    const mockAnalytics: EvaluationAnalytics[] = [
      {
        evaluationId: "eval_1",
        evaluationTitle: "Full Stack Developer Assessment",
        totalCandidates: 3,
        completedCandidates: 2,
        averageScore: 80,
        averageDuration: 78.5,
        passRate: 100,
        categoryAnalytics: [
          { category: "React", averageScore: 85, difficulty: "Medium" },
          { category: "Node.js", averageScore: 81, difficulty: "Medium" },
          { category: "Python", averageScore: 71, difficulty: "Hard" },
        ],
      },
      {
        evaluationId: "eval_2",
        evaluationTitle: "Frontend Developer - React",
        totalCandidates: 1,
        completedCandidates: 1,
        averageScore: 85,
        averageDuration: 55,
        passRate: 100,
        categoryAnalytics: [
          { category: "React", averageScore: 83, difficulty: "Easy" },
          { category: "JavaScript", averageScore: 100, difficulty: "Easy" },
        ],
      },
      {
        evaluationId: "eval_3",
        evaluationTitle: "Backend Developer Assessment",
        totalCandidates: 1,
        completedCandidates: 1,
        averageScore: 73,
        averageDuration: 68,
        passRate: 100,
        categoryAnalytics: [
          { category: "Spring Boot", averageScore: 73, difficulty: "Medium" },
          { category: "Database", averageScore: 71, difficulty: "Hard" },
        ],
      },
    ]

    setResults(mockResults)
    setEvaluationAnalytics(mockAnalytics)
  }

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.evaluationTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEvaluation =
      !evaluationFilter || evaluationFilter === "all" || result.evaluationId === evaluationFilter
    const matchesStatus = !statusFilter || statusFilter === "all" || result.status === statusFilter

    return matchesSearch && matchesEvaluation && matchesStatus
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportResults = () => {
    const csvContent = [
      "Candidate Name,Email,Evaluation,Score,Duration,Status,Completed At",
      ...filteredResults.map(
        (result) =>
          `"${result.candidateName}","${result.candidateEmail}","${result.evaluationTitle}",${result.overallScore}%,${result.duration}min,${result.status},"${result.completedAt.toISOString()}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `evaluation_results_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/evaluator/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Results & Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Evaluator</span>
              <span className="text-xs text-blue-600">({evaluatorEmail})</span>
            </div>
            <Button onClick={exportResults} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Individual Results</TabsTrigger>
            <TabsTrigger value="analytics">Evaluation Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                      <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {results.filter((r) => r.status === "completed").length}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {Math.round(
                          results.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.overallScore, 0) /
                            results.filter((r) => r.status === "completed").length || 0,
                        )}
                        %
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {Math.round(
                          (results.filter((r) => r.status === "completed" && r.overallScore >= 60).length /
                            results.filter((r) => r.status === "completed").length) *
                            100 || 0,
                        )}
                        %
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Completions</CardTitle>
                <CardDescription>Latest candidate results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results
                    .filter((r) => r.status === "completed")
                    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
                    .slice(0, 5)
                    .map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{result.candidateName}</h3>
                          <p className="text-sm text-gray-600">{result.evaluationTitle}</p>
                          <p className="text-xs text-gray-500">
                            Completed {result.completedAt.toLocaleDateString()} at{" "}
                            {result.completedAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getScoreBadgeColor(result.overallScore)}>{result.overallScore}%</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search by candidate, email or evaluation"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select onValueChange={(val) => setEvaluationFilter(val)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by evaluation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Evaluations</SelectItem>
                    {evaluationAnalytics.map((ev) => (
                      <SelectItem key={ev.evaluationId} value={ev.evaluationId}>
                        {ev.evaluationTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={exportResults} variant="ghost">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{result.candidateName}</h3>
                      <p className="text-sm text-gray-600">{result.candidateEmail}</p>
                      <p className="text-sm text-gray-600">{result.evaluationTitle}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">Score</p>
                        <p className={`text-lg font-bold ${getScoreColor(result.overallScore)}`}>{result.overallScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-sm text-gray-700">{result.duration} min</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Candidate Result</DialogTitle>
                              <DialogDescription>{result.candidateName} - {result.evaluationTitle}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <p>Overall Score: {result.overallScore}%</p>
                              <p>Correct Answers: {result.correctAnswers} / {result.totalQuestions}</p>
                              <p>Attempt: {result.attemptNumber}</p>
                              <div>
                                <p className="font-medium">Category breakdown</p>
                                <div className="space-y-1">
                                  {result.categoryScores.map((c) => (
                                    <div key={c.category} className="flex items-center justify-between">
                                      <p className="text-sm">{c.category}</p>
                                      <p className="text-sm">{c.score} / {c.total}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evaluationAnalytics.map((ev) => (
                <Card key={ev.evaluationId}>
                  <CardHeader>
                    <CardTitle>{ev.evaluationTitle}</CardTitle>
                    <CardDescription>
                      {ev.completedCandidates} / {ev.totalCandidates} completed • Average Score {ev.averageScore}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Average Duration</p>
                        <p className="font-medium">{ev.averageDuration} min</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Category performance</p>
                        <div className="space-y-2">
                          {ev.categoryAnalytics.map((c) => (
                            <div key={c.category} className="flex items-center justify-between">
                              <p className="text-sm">{c.category}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded ${getDifficultyColor(c.difficulty)}`}>{c.difficulty}</span>
                                <p className="text-sm font-medium">{c.averageScore}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
