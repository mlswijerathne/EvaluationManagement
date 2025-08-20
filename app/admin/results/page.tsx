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
  const [adminEmail, setAdminEmail] = useState("")
  const [results, setResults] = useState<CandidateResult[]>([])
  const [evaluationAnalytics, setEvaluationAnalytics] = useState<EvaluationAnalytics[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [evaluationFilter, setEvaluationFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedResult, setSelectedResult] = useState<CandidateResult | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    const email = localStorage.getItem("adminEmail") || "admin@example.com"
    if (!auth) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      setAdminEmail(email)
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
            <Link href="/admin/dashboard">
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
              <span className="text-sm font-medium text-blue-700">Admin</span>
              <span className="text-xs text-blue-600">({adminEmail})</span>
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
                          <div className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {result.duration}min
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
                <CardDescription>Average scores across different subject areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(
                    new Set(
                      results
                        .filter((r) => r.status === "completed")
                        .flatMap((r) => r.categoryScores.map((c) => c.category)),
                    ),
                  ).map((category) => {
                    const categoryResults = results
                      .filter((r) => r.status === "completed")
                      .flatMap((r) => r.categoryScores.filter((c) => c.category === category))

                    const averageScore = Math.round(
                      categoryResults.reduce((sum, c) => sum + (c.score / c.total) * 100, 0) / categoryResults.length ||
                        0,
                    )

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category}</span>
                          <span className={`font-semibold ${getScoreColor(averageScore)}`}>{averageScore}%</span>
                        </div>
                        <Progress value={averageScore} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search candidates or evaluations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={evaluationFilter} onValueChange={setEvaluationFilter}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Filter by evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Evaluations</SelectItem>
                      {evaluationAnalytics.map((analytics) => (
                        <SelectItem key={analytics.evaluationId} value={analytics.evaluationId}>
                          {analytics.evaluationTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Results ({filteredResults.length})</CardTitle>
                <CardDescription>Detailed candidate performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">{result.candidateName}</h3>
                              <Badge
                                className={
                                  result.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : result.status === "in-progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }
                              >
                                {result.status}
                              </Badge>
                              {result.attemptNumber > 1 && (
                                <Badge variant="outline">Attempt {result.attemptNumber}</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-1">{result.candidateEmail}</p>
                            <p className="text-sm text-gray-500">{result.evaluationTitle}</p>
                          </div>

                          {result.status === "completed" && (
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                                {result.overallScore}%
                              </div>
                              <p className="text-sm text-gray-500">
                                {result.correctAnswers}/{result.totalQuestions} correct
                              </p>
                            </div>
                          )}
                        </div>

                        {result.status === "completed" && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                                <p className="text-sm font-medium">{result.duration} minutes</p>
                                <p className="text-xs text-gray-500">Duration</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <Award className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                                <p className="text-sm font-medium">
                                  {result.overallScore >= 80
                                    ? "Excellent"
                                    : result.overallScore >= 60
                                      ? "Good"
                                      : "Poor"}
                                </p>
                                <p className="text-xs text-gray-500">Performance</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                                <p className="text-sm font-medium">{result.categoryScores.length} categories</p>
                                <p className="text-xs text-gray-500">Subjects</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Category Breakdown:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.categoryScores.map((category) => {
                                  const percentage = Math.round((category.score / category.total) * 100)
                                  return (
                                    <div key={category.category} className="p-3 border rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{category.category}</span>
                                        <span className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                                          {percentage}%
                                        </span>
                                      </div>
                                      <Progress value={percentage} className="h-2 mb-1" />
                                      <p className="text-xs text-gray-500">
                                        {category.score}/{category.total} correct
                                      </p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-sm text-gray-500">
                            {result.status === "completed"
                              ? `Completed on ${result.completedAt.toLocaleDateString()}`
                              : result.status === "in-progress"
                                ? "Currently taking evaluation"
                                : "Not started"}
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedResult(result)}
                                className="bg-transparent"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detailed Results - {result.candidateName}</DialogTitle>
                                <DialogDescription>{result.evaluationTitle}</DialogDescription>
                              </DialogHeader>
                              {selectedResult && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="text-sm text-gray-600">Overall Score</p>
                                      <p className="text-2xl font-bold">{selectedResult.overallScore}%</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-600">Time Taken</p>
                                      <p className="text-2xl font-bold">{selectedResult.duration}min</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-3">Category Performance</h4>
                                    <div className="space-y-3">
                                      {selectedResult.categoryScores.map((category) => {
                                        const percentage = Math.round((category.score / category.total) * 100)
                                        return (
                                          <div key={category.category}>
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-medium">{category.category}</span>
                                              <span className={getScoreColor(percentage)}>{percentage}%</span>
                                            </div>
                                            <Progress value={percentage} className="h-3" />
                                            <p className="text-sm text-gray-500 mt-1">
                                              {category.score} out of {category.total} questions correct
                                            </p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Analytics</CardTitle>
                <CardDescription>Performance insights by evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {evaluationAnalytics.map((analytics) => (
                    <Card key={analytics.evaluationId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{analytics.evaluationTitle}</h3>
                            <p className="text-sm text-gray-600">
                              {analytics.completedCandidates} of {analytics.totalCandidates} candidates completed
                            </p>
                          </div>
                          <Badge className={getScoreBadgeColor(analytics.averageScore)}>
                            Avg: {analytics.averageScore}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{analytics.averageScore}%</p>
                            <p className="text-sm text-gray-600">Average Score</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{analytics.passRate}%</p>
                            <p className="text-sm text-gray-600">Pass Rate</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{analytics.averageDuration}min</p>
                            <p className="text-sm text-gray-600">Avg Duration</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                              {Math.round((analytics.completedCandidates / analytics.totalCandidates) * 100)}%
                            </p>
                            <p className="text-sm text-gray-600">Completion Rate</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Category Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analytics.categoryAnalytics.map((category) => (
                              <div key={category.category} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{category.category}</span>
                                  <Badge className={getDifficultyColor(category.difficulty)}>
                                    {category.difficulty}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Average Score</span>
                                  <span className={`font-semibold ${getScoreColor(category.averageScore)}`}>
                                    {category.averageScore}%
                                  </span>
                                </div>
                                <Progress value={category.averageScore} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
