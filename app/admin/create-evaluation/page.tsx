"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, User, LogOut } from "lucide-react"
import Link from "next/link"

interface QuestionBank {
  subject: string
  questionCount: number
  categories: string[]
}

interface Question {
  id: string
  subject: string
  category: string
  question: string
  options: string[]
  correctAnswers: number[]
  multipleCorrect: boolean
}

interface EvaluationSubject {
  subject: string
  questionCount: number
  specificQuestions?: string[]
}

interface Candidate {
  id: string
  name: string
  email: string
  status: string
  lastActivity: Date
}

interface Evaluation {
  id: string
  title: string
  description: string
  subjects: EvaluationSubject[]
  duration: number
  expiryDate: Date
  status: "draft" | "active" | "expired" | "template"
  assignedCandidates: string[]
  createdAt: Date
  accessToken: string
}

export default function CreateEvaluationPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [newEvaluation, setNewEvaluation] = useState({
    title: "",
    description: "",
    subjects: [] as EvaluationSubject[],
    duration: 60,
    expiryDate: "",
    assignedCandidates: [] as string[],
  })

  const [questionBanks] = useState<QuestionBank[]>([
    { subject: "React", questionCount: 25, categories: ["Components", "Hooks", "State Management", "Performance"] },
    { subject: "Angular", questionCount: 22, categories: ["Components", "Services", "RxJS", "Routing"] },
    { subject: "Spring Boot", questionCount: 20, categories: ["REST APIs", "Security", "Data JPA", "Testing"] },
    { subject: "Python", questionCount: 18, categories: ["Syntax", "OOP", "Libraries", "Web Frameworks"] },
    { subject: "Node.js", questionCount: 15, categories: ["Express", "Async/Await", "NPM", "File System"] },
  ])

  const [candidates] = useState<Candidate[]>([
    { id: "1", name: "John Doe", email: "john.doe@example.com", status: "active", lastActivity: new Date() },
    { id: "2", name: "Sarah Wilson", email: "sarah.wilson@example.com", status: "active", lastActivity: new Date() },
    { id: "3", name: "Mike Johnson", email: "mike.johnson@example.com", status: "active", lastActivity: new Date() },
  ])

  const [questions] = useState<Question[]>([
    // React Questions
    {
      id: "1",
      subject: "React",
      category: "Components",
      question: "What is the correct way to create a functional component in React?",
      options: [
        "function MyComponent() { return <div>Hello</div>; }",
        "const MyComponent = () => <div>Hello</div>;",
        "class MyComponent extends Component { render() { return <div>Hello</div>; } }",
        "Both A and B",
      ],
      correctAnswers: [3],
      multipleCorrect: false,
    },
    {
      id: "2",
      subject: "React",
      category: "Hooks",
      question: "Which hook is used for managing state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswers: [1],
      multipleCorrect: false,
    },
    {
      id: "3",
      subject: "React",
      category: "State Management",
      question: "What is the purpose of useEffect hook?",
      options: ["Managing state", "Handling side effects", "Creating components", "Routing"],
      correctAnswers: [1],
      multipleCorrect: false,
    },

    // Angular Questions
    {
      id: "4",
      subject: "Angular",
      category: "Components",
      question: "What decorator is used to define an Angular component?",
      options: ["@Injectable", "@Component", "@Directive", "@Pipe"],
      correctAnswers: [1],
      multipleCorrect: false,
    },
    {
      id: "5",
      subject: "Angular",
      category: "Services",
      question: "How do you inject a service in Angular?",
      options: [
        "Using @Inject decorator",
        "Using constructor injection",
        "Using provide() function",
        "All of the above",
      ],
      correctAnswers: [3],
      multipleCorrect: false,
    },

    // Spring Boot Questions
    {
      id: "6",
      subject: "Spring Boot",
      category: "REST APIs",
      question: "Which annotation is used to create a REST controller?",
      options: ["@Controller", "@RestController", "@Service", "@Repository"],
      correctAnswers: [1],
      multipleCorrect: false,
    },
    {
      id: "7",
      subject: "Spring Boot",
      category: "Security",
      question: "What is Spring Security used for?",
      options: ["Database operations", "Authentication and authorization", "REST API creation", "Testing"],
      correctAnswers: [1],
      multipleCorrect: false,
    },
  ])

  const [showQuestionBrowser, setShowQuestionBrowser] = useState(false)
  const [selectedSubjectForBrowsing, setSelectedSubjectForBrowsing] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, string[]>>({})

  const [emailSending, setEmailSending] = useState<string[]>([])
  const [emailStatus, setEmailStatus] = useState<Record<string, "success" | "error">>({})

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

  const browseQuestionsForSubject = (subject: string) => {
    setSelectedSubjectForBrowsing(subject)
    setShowQuestionBrowser(true)
  }

  const toggleQuestionSelection = (questionId: string, subject: string) => {
    const currentSelected = selectedQuestions[subject] || []
    const isSelected = currentSelected.includes(questionId)

    if (isSelected) {
      setSelectedQuestions({
        ...selectedQuestions,
        [subject]: currentSelected.filter((id) => id !== questionId),
      })
    } else {
      setSelectedQuestions({
        ...selectedQuestions,
        [subject]: [...currentSelected, questionId],
      })
    }
  }

  const addSubjectToEvaluation = (subject: string) => {
    if (!newEvaluation.subjects.some((s) => s.subject === subject)) {
      setNewEvaluation({
        ...newEvaluation,
        subjects: [
          ...newEvaluation.subjects,
          { subject, questionCount: 5, specificQuestions: selectedQuestions[subject] || [] },
        ],
      })
    }
  }

  const removeSubjectFromEvaluation = (subject: string) => {
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.filter((s) => s.subject !== subject),
    })
  }

  const updateSubjectQuestionCount = (subject: string, count: number) => {
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.map((s) => (s.subject === subject ? { ...s, questionCount: count } : s)),
    })
  }

  const handleSendEmail = async (candidateId: string, evaluationUrl: string, evaluationTitle: string) => {
    setEmailSending([...emailSending, candidateId])

    // Simulate email sending
    setTimeout(() => {
      setEmailSending(emailSending.filter((id) => id !== candidateId))
      setEmailStatus({ ...emailStatus, [candidateId]: Math.random() > 0.1 ? "success" : "error" })
    }, 2000)
  }

  const handleCreateEvaluation = () => {
    if (!newEvaluation.title.trim() || newEvaluation.subjects.length === 0) return

    const evaluation: Evaluation = {
      id: Date.now().toString(),
      title: newEvaluation.title,
      description: newEvaluation.description,
      subjects: newEvaluation.subjects,
      duration: newEvaluation.duration,
      expiryDate: new Date(newEvaluation.expiryDate),
      status: "draft",
      assignedCandidates: newEvaluation.assignedCandidates,
      createdAt: new Date(),
      accessToken: `eval_${Math.random().toString(36).substring(2, 11)}`,
    }

    // Save to localStorage
    const existingEvaluations = JSON.parse(localStorage.getItem("evaluations") || "[]")
    const updatedEvaluations = [...existingEvaluations, evaluation]
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations))

    setSuccessMessage(`Evaluation "${evaluation.title}" created successfully!`)
    setTimeout(() => {
      router.push("/admin/dashboard")
    }, 1500)
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
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Evaluation</h1>
          </div>
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

      <div className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Evaluation</CardTitle>
            <CardDescription>Set up a new assessment for candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="evalTitle" className="text-sm font-medium">
                    Evaluation Title
                  </Label>
                  <Input
                    id="evalTitle"
                    placeholder="e.g., Full Stack Developer Assessment"
                    value={newEvaluation.title}
                    onChange={(e) => setNewEvaluation({ ...newEvaluation, title: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evalDuration" className="text-sm font-medium">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="evalDuration"
                    type="number"
                    min="15"
                    max="300"
                    value={newEvaluation.duration}
                    onChange={(e) =>
                      setNewEvaluation({ ...newEvaluation, duration: Number.parseInt(e.target.value) || 60 })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evalDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="evalDescription"
                  placeholder="Describe the evaluation purpose and scope..."
                  value={newEvaluation.description}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evalExpiry" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="evalExpiry"
                  type="datetime-local"
                  value={newEvaluation.expiryDate}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, expiryDate: e.target.value })}
                  className="h-10 max-w-md"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Question Selection</h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Available Subjects</Label>
                  <p className="text-sm text-gray-600">Select subjects to include in your evaluation:</p>
                  <div className="flex flex-wrap gap-3">
                    {questionBanks.map((bank) => (
                      <Button
                        key={bank.subject}
                        variant="outline"
                        size="sm"
                        onClick={() => addSubjectToEvaluation(bank.subject)}
                        disabled={newEvaluation.subjects.some((s) => s.subject === bank.subject)}
                        className="h-9 px-4 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        {bank.subject}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {bank.questionCount}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {newEvaluation.subjects.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Selected Subjects</Label>
                    <div className="space-y-3">
                      {newEvaluation.subjects.map((subject) => {
                        const maxQuestions =
                          questionBanks.find((bank) => bank.subject === subject.subject)?.questionCount || 10
                        const selectedCount = selectedQuestions[subject.subject]?.length || 0
                        return (
                          <div key={subject.subject} className="p-4 bg-gray-50 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-900">{subject.subject}</span>
                                <Badge variant="outline" className="text-xs">
                                  {selectedCount > 0
                                    ? `${selectedCount} specific questions selected`
                                    : `${subject.questionCount} random questions`}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeSubjectFromEvaluation(subject.subject)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Label htmlFor={`count-${subject.subject}`} className="text-sm text-gray-600">
                                    Questions:
                                  </Label>
                                  <Input
                                    id={`count-${subject.subject}`}
                                    type="number"
                                    min="1"
                                    max={maxQuestions}
                                    value={subject.questionCount}
                                    onChange={(e) =>
                                      updateSubjectQuestionCount(subject.subject, Number.parseInt(e.target.value) || 1)
                                    }
                                    className="w-20 h-8 text-center"
                                    disabled={selectedCount > 0}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">or</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => browseQuestionsForSubject(subject.subject)}
                                  className="h-8 text-xs"
                                >
                                  Browse & Select Questions
                                </Button>
                              </div>
                            </div>

                            {selectedCount > 0 && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm font-medium text-blue-800 mb-2">Selected Questions:</p>
                                <div className="space-y-1">
                                  {selectedQuestions[subject.subject]?.slice(0, 3).map((questionId) => {
                                    const question = questions.find((q) => q.id === questionId)
                                    return (
                                      <p key={questionId} className="text-xs text-blue-700 truncate">
                                        • {question?.question}
                                      </p>
                                    )
                                  })}
                                  {selectedCount > 3 && (
                                    <p className="text-xs text-blue-600">... and {selectedCount - 3} more questions</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Candidate Assignment</h3>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Select Candidates</Label>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                        <Checkbox
                          checked={newEvaluation.assignedCandidates.includes(candidate.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewEvaluation({
                                ...newEvaluation,
                                assignedCandidates: [...newEvaluation.assignedCandidates, candidate.id],
                              })
                            } else {
                              setNewEvaluation({
                                ...newEvaluation,
                                assignedCandidates: newEvaluation.assignedCandidates.filter(
                                  (id) => id !== candidate.id,
                                ),
                              })
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-xs text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {newEvaluation.assignedCandidates.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Assignment URLs Preview</Label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3 font-medium">
                      Evaluation URLs will be generated for {newEvaluation.assignedCandidates.length} candidate(s):
                    </p>
                    <div className="space-y-2">
                      {newEvaluation.assignedCandidates.map((candidateId) => {
                        const candidate = candidates.find((c) => c.id === candidateId)
                        return (
                          <div
                            key={candidateId}
                            className="flex items-center justify-between bg-white p-3 rounded border"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{candidate?.name}</p>
                              <p className="text-xs text-gray-500 mb-1">{candidate?.email}</p>
                              <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                /evaluation/[generated-token]
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="px-6 bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleCreateEvaluation}
                disabled={!newEvaluation.title.trim() || newEvaluation.subjects.length === 0}
                className="px-6"
              >
                Create Evaluation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showQuestionBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Questions - {selectedSubjectForBrowsing}</h3>
                <Button variant="outline" size="sm" onClick={() => setShowQuestionBrowser(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {questions
                  .filter((q) => q.subject === selectedSubjectForBrowsing)
                  .map((question) => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedQuestions[selectedSubjectForBrowsing]?.includes(question.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleQuestionSelection(question.id, selectedSubjectForBrowsing)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedQuestions[selectedSubjectForBrowsing]?.includes(question.id) || false}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {question.category}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                          <div className="space-y-1">
                            {question.options.map((option, index) => (
                              <p
                                key={index}
                                className={`text-sm ${
                                  question.correctAnswers.includes(index)
                                    ? "text-green-700 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}. {option}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedQuestions[selectedSubjectForBrowsing]?.length || 0} questions selected
                </p>
                <Button onClick={() => setShowQuestionBrowser(false)} className="px-6">
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
