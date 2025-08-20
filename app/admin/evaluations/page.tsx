"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  FileText,
  Users,
  Clock,
  Mail,
  Copy,
  Eye,
  Play,
  Pause,
  Filter,
  User,
} from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  subject: string
  category: string
  question: string
  options: string[]
  correctAnswers: number[]
  multipleCorrect: boolean
  createdAt: Date
}

interface Evaluation {
  id: string
  title: string
  description: string
  subjects: { subject: string; questionCount: number; specificQuestions?: string[] }[]
  duration: number // minutes
  expiryDate: Date
  status: "draft" | "active" | "inactive" | "expired" | "template"
  assignedCandidates: string[]
  createdAt: Date
  accessToken: string
}

interface Candidate {
  id: string
  name: string
  email: string
  status: "pending" | "in-progress" | "completed" | "invited"
  lastActivity?: Date
}

export default function EvaluationsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionBanks] = useState([
    { subject: "React", questionCount: 25 },
    { subject: "Angular", questionCount: 30 },
    { subject: "Spring Boot", questionCount: 20 },
    { subject: "Python", questionCount: 35 },
    { subject: "Node.js", questionCount: 18 },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateEvaluationOpen, setIsCreateEvaluationOpen] = useState(false)
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false)
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [currentSubjectForSelection, setCurrentSubjectForSelection] = useState<string>("")

  // Question selection filters
  const [questionSearchTerm, setQuestionSearchTerm] = useState("")
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  // Form states
  const [newEvaluation, setNewEvaluation] = useState({
    title: "",
    description: "",
    subjects: [] as { subject: string; questionCount: number; specificQuestions?: string[] }[],
    duration: 60,
    expiryDate: "",
    assignedCandidates: [] as string[],
  })

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
  })

  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null)
  const [isEditEvaluationOpen, setIsEditEvaluationOpen] = useState(false)
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null)
  const [isViewEvaluationOpen, setIsViewEvaluationOpen] = useState(false)
  const [prebuiltEvaluations, setPrebuiltEvaluations] = useState<Evaluation[]>([
    {
      id: "template-1",
      title: "Full Stack Developer Assessment",
      description: "Comprehensive evaluation for full-stack developers covering React, Node.js, and databases",
      subjects: [
        { subject: "React", questionCount: 10, specificQuestions: [] },
        { subject: "Node.js", questionCount: 8, specificQuestions: [] },
        { subject: "Database", questionCount: 7, specificQuestions: [] },
      ],
      duration: 90,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "template" as const,
      assignedCandidates: [],
      createdAt: new Date(),
      accessToken: "template-1",
    },
    {
      id: "template-2",
      title: "Frontend Developer Assessment",
      description: "Frontend-focused evaluation covering React, CSS, and JavaScript fundamentals",
      subjects: [
        { subject: "React", questionCount: 15, specificQuestions: [] },
        { subject: "CSS", questionCount: 10, specificQuestions: [] },
        { subject: "JavaScript", questionCount: 10, specificQuestions: [] },
      ],
      duration: 75,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "template" as const,
      assignedCandidates: [],
      createdAt: new Date(),
      accessToken: "template-2",
    },
  ])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isAssignTemplateOpen, setIsAssignTemplateOpen] = useState(false)
  const [templateAssignment, setTemplateAssignment] = useState({
    assignedCandidates: [] as string[],
    expiryDate: "",
    duration: 60,
  })

  const [emailSending, setEmailSending] = useState<string[]>([])
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: "success" | "error" | null }>({})

  const [successMessage, setSuccessMessage] = useState("")
  const [adminEmail, setAdminEmail] = useState<string>("admin@example.com")

  const [isAssignCandidatesOpen, setIsAssignCandidatesOpen] = useState(false)
  const [evaluationForAssignment, setEvaluationForAssignment] = useState<Evaluation | null>(null)
  const [candidateAssignment, setCandidateAssignment] = useState({
    assignedCandidates: [] as string[],
  })

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (!auth) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      loadMockData()
    }
  }, [router])

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedEvaluations = localStorage.getItem("evaluations")
        const savedCandidates = localStorage.getItem("candidates")

        if (savedEvaluations) {
          const parsedEvaluations = JSON.parse(savedEvaluations)
          const evaluationsWithDates = parsedEvaluations.map((evaluation: any) => ({
            ...evaluation,
            expiryDate: new Date(evaluation.expiryDate),
            createdAt: new Date(evaluation.createdAt),
          }))
          setEvaluations(evaluationsWithDates)
        } else {
          loadMockData()
        }

        if (savedCandidates) {
          const parsedCandidates = JSON.parse(savedCandidates)
          const candidatesWithDates = parsedCandidates.map((candidate: any) => ({
            ...candidate,
            lastActivity: candidate.lastActivity ? new Date(candidate.lastActivity) : new Date(),
          }))
          setCandidates(candidatesWithDates)
        } else {
          loadMockCandidates()
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        loadMockData()
        loadMockCandidates()
      }
    }

    loadData()
  }, [])

  const loadMockData = () => {
    const savedEvaluations = localStorage.getItem("evaluations")
    const savedQuestions = localStorage.getItem("questions")
    const savedCandidates = localStorage.getItem("candidates")

    // Mock questions
    const mockQuestions: Question[] = [
      {
        id: "1",
        subject: "React",
        category: "Hooks",
        question: "Which hook is used to manage state in functional components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "2",
        subject: "React",
        category: "Components",
        question: "Which of the following are valid ways to create a React component?",
        options: ["Function Declaration", "Arrow Function", "Class Component", "Object Literal"],
        correctAnswers: [0, 1, 2],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "3",
        subject: "React",
        category: "State Management",
        question: "What is the purpose of useEffect hook?",
        options: ["Managing state", "Side effects", "Context management", "Event handling"],
        correctAnswers: [1],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "4",
        subject: "Angular",
        category: "Services",
        question: "What decorator is used to make a class injectable in Angular?",
        options: ["@Component", "@Injectable", "@Service", "@Inject"],
        correctAnswers: [1],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "5",
        subject: "Angular",
        category: "Components",
        question: "Which lifecycle hook is called after component initialization?",
        options: ["ngOnInit", "ngAfterViewInit", "ngOnDestroy", "ngOnChanges"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "6",
        subject: "Python",
        category: "Data Structures",
        question: "Which data structure is ordered and mutable in Python?",
        options: ["Tuple", "Set", "List", "Dictionary"],
        correctAnswers: [2],
        multipleCorrect: false,
        createdAt: new Date(),
      },
    ]

    // Mock evaluations
    const mockEvaluations: Evaluation[] = [
      {
        id: "1",
        title: "Full Stack Developer Assessment",
        description: "Comprehensive evaluation for full stack development roles",
        subjects: [
          { subject: "React", questionCount: 10, specificQuestions: ["1", "2"] },
          { subject: "Node.js", questionCount: 8 },
          { subject: "Python", questionCount: 7, specificQuestions: ["6"] },
        ],
        duration: 90,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "active",
        assignedCandidates: ["1", "2"],
        createdAt: new Date(),
        accessToken: "eval_123456",
      },
      {
        id: "2",
        title: "Frontend Developer - React Specialist",
        description: "React-focused assessment for frontend developers",
        subjects: [
          { subject: "React", questionCount: 20, specificQuestions: ["1", "2", "3"] },
          { subject: "Angular", questionCount: 5 },
        ],
        duration: 60,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "active",
        assignedCandidates: ["3"],
        createdAt: new Date(),
        accessToken: "eval_789012",
      },
    ]

    const questionsToUse = savedQuestions ? JSON.parse(savedQuestions) : mockQuestions
    const evaluationsToUse = savedEvaluations ? JSON.parse(savedEvaluations) : mockEvaluations

    setQuestions(questionsToUse)
    setEvaluations(evaluationsToUse)

    if (!savedQuestions) localStorage.setItem("questions", JSON.stringify(mockQuestions))
    if (!savedEvaluations) localStorage.setItem("evaluations", JSON.stringify(mockEvaluations))
  }

  const loadMockCandidates = () => {
    const savedCandidates = localStorage.getItem("candidates")

    // Mock candidates
    const mockCandidates: Candidate[] = [
      { id: "1", name: "John Doe", email: "john.doe@example.com", status: "completed", lastActivity: new Date() },
      {
        id: "2",
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        status: "in-progress",
        lastActivity: new Date(),
      },
      { id: "3", name: "Mike Johnson", email: "mike.johnson@example.com", status: "pending" },
      { id: "4", name: "Emily Davis", email: "emily.davis@example.com", status: "completed", lastActivity: new Date() },
      { id: "5", name: "Alex Chen", email: "alex.chen@example.com", status: "pending" },
      { id: "6", name: "Jessica Rodriguez", email: "jessica.rodriguez@example.com", status: "pending" },
      { id: "7", name: "David Kim", email: "david.kim@example.com", status: "invited" },
      { id: "8", name: "Lisa Thompson", email: "lisa.thompson@example.com", status: "pending" },
      {
        id: "9",
        name: "Robert Brown",
        email: "robert.brown@example.com",
        status: "completed",
        lastActivity: new Date(),
      },
      {
        id: "10",
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        status: "in-progress",
        lastActivity: new Date(),
      },
      { id: "11", name: "James Wilson", email: "james.wilson@example.com", status: "pending" },
      { id: "12", name: "Anna Lee", email: "anna.lee@example.com", status: "invited" },
      { id: "13", name: "Chris Taylor", email: "chris.taylor@example.com", status: "pending" },
      {
        id: "14",
        name: "Sophie Martin",
        email: "sophie.martin@example.com",
        status: "completed",
        lastActivity: new Date(),
      },
      { id: "15", name: "Kevin Zhang", email: "kevin.zhang@example.com", status: "pending" },
    ]

    const candidatesToUse = savedCandidates
      ? JSON.parse(savedCandidates).map((candidate: any) => ({
          ...candidate,
          lastActivity: candidate.lastActivity ? new Date(candidate.lastActivity) : undefined,
        }))
      : mockCandidates

    setCandidates(candidatesToUse)

    if (!savedCandidates) localStorage.setItem("candidates", JSON.stringify(mockCandidates))
  }

  const handleCreateEvaluation = () => {
    if (!newEvaluation.title.trim()) {
      alert("Please enter an evaluation title")
      return
    }

    if (newEvaluation.subjects.length === 0) {
      alert("Please add at least one subject")
      return
    }

    if (!newEvaluation.expiryDate) {
      alert("Please select an expiry date")
      return
    }

    const evaluation: Evaluation = {
      id: `eval-${Date.now()}`,
      title: newEvaluation.title,
      description: newEvaluation.description,
      subjects: newEvaluation.subjects,
      duration: newEvaluation.duration,
      expiryDate: new Date(newEvaluation.expiryDate),
      status: "draft",
      assignedCandidates: newEvaluation.assignedCandidates,
      createdAt: new Date(),
      accessToken: Math.random().toString(36).substring(2, 15),
    }

    const updatedEvaluations = [...evaluations, evaluation]
    setEvaluations(updatedEvaluations)
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations))

    // Reset form
    setNewEvaluation({
      title: "",
      description: "",
      subjects: [],
      duration: 60,
      expiryDate: "",
      assignedCandidates: [],
    })
    setIsCreateEvaluationOpen(false)

    setSuccessMessage(`Evaluation "${evaluation.title}" created successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleAddCandidate = () => {
    if (!newCandidate.name.trim() || !newCandidate.email.trim()) return

    const candidate: Candidate = {
      id: Date.now().toString(),
      name: newCandidate.name,
      email: newCandidate.email,
      status: "pending",
    }

    setCandidates([...candidates, candidate])
    setNewCandidate({ name: "", email: "" })
    setIsAddCandidateOpen(false)
  }

  const handleToggleEvaluationStatus = (evaluationId: string) => {
    setEvaluations(
      evaluations.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, status: evaluation.status === "active" ? "inactive" : "active" }
          : evaluation,
      ),
    )
  }

  const handleDeleteEvaluation = (evaluationId: string) => {
    setEvaluations(evaluations.filter((evaluation) => evaluation.id !== evaluationId))
  }

  const handleCopyEvaluationLink = (evaluation: Evaluation) => {
    const link = `${window.location.origin}/evaluation/${evaluation.accessToken}`
    navigator.clipboard.writeText(link)
    // You could add a toast notification here
  }

  const addSubjectToEvaluation = (subject: string) => {
    const maxQuestions = questionBanks.find((bank) => bank.subject === subject)?.questionCount || 10
    const newSubject = { subject, questionCount: Math.min(5, maxQuestions), specificQuestions: [] }

    if (!newEvaluation.subjects.find((s) => s.subject === subject)) {
      setNewEvaluation({
        ...newEvaluation,
        subjects: [...newEvaluation.subjects, newSubject],
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

  const openQuestionSelector = (subject: string) => {
    setCurrentSubjectForSelection(subject)
    const currentSubject = newEvaluation.subjects.find((s) => s.subject === subject)
    setSelectedQuestions(currentSubject?.specificQuestions || [])
    setQuestionSearchTerm("")
    setSelectedQuestionCategory("")
    setIsQuestionSelectorOpen(true)
  }

  const handleQuestionSelection = () => {
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.map((s) =>
        s.subject === currentSubjectForSelection
          ? { ...s, specificQuestions: selectedQuestions, questionCount: selectedQuestions.length }
          : s,
      ),
    })
    setIsQuestionSelectorOpen(false)
    setCurrentSubjectForSelection("")
    setSelectedQuestions([])
  }

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation)
    setNewEvaluation({
      title: evaluation.title,
      description: evaluation.description,
      subjects: evaluation.subjects,
      duration: evaluation.duration,
      expiryDate:
        evaluation.expiryDate instanceof Date
          ? evaluation.expiryDate.toISOString().split("T")[0]
          : new Date(evaluation.expiryDate).toISOString().split("T")[0],
      assignedCandidates: evaluation.assignedCandidates,
    })
    setIsEditEvaluationOpen(true)
  }

  const handleSaveEditedEvaluation = () => {
    if (!editingEvaluation) return

    const updatedEvaluation: Evaluation = {
      ...editingEvaluation,
      title: newEvaluation.title,
      description: newEvaluation.description,
      subjects: newEvaluation.subjects,
      duration: newEvaluation.duration,
      expiryDate: new Date(newEvaluation.expiryDate),
      assignedCandidates: newEvaluation.assignedCandidates,
    }

    const updatedEvaluations = evaluations.map((evaluationItem) =>
      evaluationItem.id === editingEvaluation.id ? updatedEvaluation : evaluationItem,
    )
    setEvaluations(updatedEvaluations)
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations))

    setIsEditEvaluationOpen(false)
    setEditingEvaluation(null)
    setNewEvaluation({
      title: "",
      description: "",
      subjects: [],
      duration: 60,
      expiryDate: "",
      assignedCandidates: [],
    })

    setSuccessMessage("Evaluation updated successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleAssignTemplate = () => {
    if (!selectedTemplate) return

    const template = prebuiltEvaluations.find((t) => t.id === selectedTemplate)
    if (!template) return

    const newEval: Evaluation = {
      ...template,
      id: Date.now().toString(),
      status: "active",
      assignedCandidates: templateAssignment.assignedCandidates,
      expiryDate: new Date(templateAssignment.expiryDate),
      duration: templateAssignment.duration,
      accessToken: `eval_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
    }

    setEvaluations([...evaluations, newEval])
    setSelectedTemplate("")
    setTemplateAssignment({
      assignedCandidates: [],
      expiryDate: "",
      duration: 60,
    })
    setIsAssignTemplateOpen(false)

    setSuccessMessage(`Pre-built evaluation "${newEval.title}" assigned successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleViewEvaluation = (evaluation: Evaluation) => {
    setViewingEvaluation(evaluation)
    setIsViewEvaluationOpen(true)
  }

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredQuestionsForSelection = questions.filter((q) => {
    const matchesSubject = q.subject === currentSubjectForSelection
    const matchesSearch =
      q.question.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(questionSearchTerm.toLowerCase())
    const matchesCategory = !selectedQuestionCategory || q.category === selectedQuestionCategory

    return matchesSubject && matchesSearch && matchesCategory
  })

  const availableCategoriesForSelection = [
    ...new Set(questions.filter((q) => q.subject === currentSubjectForSelection).map((q) => q.category)),
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendEmail = async (candidateId: string, evaluationUrl: string, evaluationTitle: string) => {
    setEmailSending([...emailSending, candidateId])

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const candidate = candidates.find((c) => c.id === candidateId)
      if (!candidate) {
        throw new Error("Candidate not found")
      }

      const emailContent = `
        Subject: Evaluation Invitation - ${evaluationTitle}
        
        Dear ${candidate.name},
        
        You have been invited to take the evaluation: ${evaluationTitle}
        
        Please click the following link to start your evaluation:
        ${evaluationUrl}
        
        Best regards,
        Admin Team
      `

      console.log("Email sent to:", candidate.email)
      console.log("Email content:", emailContent)

      setEmailStatus((prev) => ({ ...prev, [candidateId]: "success" }))

      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, status: "invited" as const } : c)))
    } catch (error) {
      console.error("Failed to send email:", error)
      setEmailStatus((prev) => ({ ...prev, [candidateId]: "error" }))
    } finally {
      setEmailSending((prev) => prev.filter((id) => id !== candidateId))
    }
  }

  const handleSendBulkEmails = async (evaluation: Evaluation) => {
    for (const candidateId of evaluation.assignedCandidates) {
      const evaluationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/evaluation/${evaluation.accessToken}`
      await handleSendEmail(candidateId, evaluationUrl, evaluation.title)
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString()
  }

  const handleAssignCandidatesToExisting = (evaluation: Evaluation) => {
    setEvaluationForAssignment(evaluation)
    setCandidateAssignment({
      assignedCandidates: evaluation.assignedCandidates || [],
    })
    setIsAssignCandidatesOpen(true)
  }

  const handleSaveCandidateAssignment = () => {
    if (!evaluationForAssignment) return

    const updatedEvaluations = evaluations.map((evaluationItem) =>
      evaluationItem.id === evaluationForAssignment.id
        ? { ...evaluationItem, assignedCandidates: candidateAssignment.assignedCandidates }
        : evaluationItem,
    )

    setEvaluations(updatedEvaluations)
    setIsAssignCandidatesOpen(false)
    setEvaluationForAssignment(null)
    setCandidateAssignment({ assignedCandidates: [] })

    setSuccessMessage(`Candidates assigned to "${evaluationForAssignment.title}" successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
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
            <h1 className="text-2xl font-bold text-gray-900">Evaluation Management</h1>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Admin</span>
            <span className="text-xs text-blue-600">({adminEmail})</span>
          </div>
        </div>
      </header>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="evaluations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search evaluations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Evaluations List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Evaluations ({filteredEvaluations.length})</CardTitle>
                  <CardDescription>Create and manage candidate assessments</CardDescription>
                </div>
                <Dialog open={isCreateEvaluationOpen} onOpenChange={setIsCreateEvaluationOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Evaluation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Evaluation</DialogTitle>
                      <DialogDescription>Set up a new assessment for candidates</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="evalTitle">Evaluation Title</Label>
                          <Input
                            id="evalTitle"
                            placeholder="e.g., Full Stack Developer Assessment"
                            value={newEvaluation.title}
                            onChange={(e) => setNewEvaluation({ ...newEvaluation, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="evalDuration">Duration (minutes)</Label>
                          <Input
                            id="evalDuration"
                            type="number"
                            min="15"
                            max="300"
                            value={newEvaluation.duration}
                            onChange={(e) =>
                              setNewEvaluation({ ...newEvaluation, duration: Number.parseInt(e.target.value) || 60 })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="evalDescription">Description</Label>
                        <Textarea
                          id="evalDescription"
                          placeholder="Describe the evaluation purpose and scope..."
                          value={newEvaluation.description}
                          onChange={(e) => setNewEvaluation({ ...newEvaluation, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="evalExpiry">Expiry Date</Label>
                        <Input
                          id="evalExpiry"
                          type="datetime-local"
                          value={newEvaluation.expiryDate}
                          onChange={(e) => setNewEvaluation({ ...newEvaluation, expiryDate: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Question Selection</Label>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Add subjects to your evaluation:</p>
                            <div className="flex flex-wrap gap-2">
                              {questionBanks.map((bank) => (
                                <Button
                                  key={bank.subject}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSubjectToEvaluation(bank.subject)}
                                  disabled={newEvaluation.subjects.some((s) => s.subject === bank.subject)}
                                  className="bg-transparent"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  {bank.subject}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {newEvaluation.subjects.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium">Selected Subjects:</p>
                              {newEvaluation.subjects.map((subject) => {
                                const maxQuestions =
                                  questionBanks.find((bank) => bank.subject === subject.subject)?.questionCount || 10
                                const hasSpecificQuestions =
                                  subject.specificQuestions && subject.specificQuestions.length > 0
                                return (
                                  <div
                                    key={subject.subject}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="font-medium">{subject.subject}</span>
                                      <Badge variant="outline">
                                        {hasSpecificQuestions
                                          ? `${subject.specificQuestions!.length} specific`
                                          : `${subject.questionCount} random`}{" "}
                                        questions
                                      </Badge>
                                      {hasSpecificQuestions && (
                                        <Badge variant="secondary" className="text-xs">
                                          Custom Selection
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {!hasSpecificQuestions && (
                                        <Input
                                          type="number"
                                          min="1"
                                          max={maxQuestions}
                                          value={subject.questionCount}
                                          onChange={(e) =>
                                            updateSubjectQuestionCount(
                                              subject.subject,
                                              Number.parseInt(e.target.value) || 1,
                                            )
                                          }
                                          className="w-20"
                                        />
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openQuestionSelector(subject.subject)}
                                      >
                                        <Filter className="w-4 h-4 mr-1" />
                                        {hasSpecificQuestions ? "Edit" : "Select"} Questions
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSubjectFromEvaluation(subject.subject)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Assign Candidates</Label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {candidates.map((candidate) => (
                            <div key={candidate.id} className="flex items-center space-x-2">
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
                              <span className="text-sm">
                                {candidate.name} ({candidate.email})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignment URLs Display */}
                      {newEvaluation.assignedCandidates.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Assignment URLs</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tempEvaluation = {
                                  ...newEvaluation,
                                  id: "temp",
                                  accessToken: `eval_${Math.random().toString(36).substring(2, 11)}`,
                                  createdAt: new Date(),
                                  status: "draft" as const,
                                  expiryDate: new Date(newEvaluation.expiryDate),
                                }
                                handleSendBulkEmails(tempEvaluation)
                              }}
                              disabled={emailSending.length > 0}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              {emailSending.length > 0 ? "Sending..." : "Send All Emails"}
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <p className="text-xs text-gray-600 mb-2">
                              These URLs will be shared with assigned candidates:
                            </p>
                            {newEvaluation.assignedCandidates.map((candidateId) => {
                              const candidate = candidates.find((c) => c.id === candidateId)
                              const evaluationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/evaluation/eval_${Math.random().toString(36).substring(2, 11)}`
                              const isEmailSending = emailSending.includes(candidateId)
                              const emailStatusForCandidate = emailStatus[candidateId]

                              return (
                                <div
                                  key={candidateId}
                                  className="flex items-center justify-between bg-white p-2 rounded border"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{candidate?.name}</p>
                                    <p className="text-xs text-gray-500">{candidate?.email}</p>
                                    <p className="text-xs text-blue-600 font-mono break-all">{evaluationUrl}</p>
                                    {emailStatusForCandidate === "success" && (
                                      <p className="text-xs text-green-600 mt-1">✓ Email sent successfully</p>
                                    )}
                                    {emailStatusForCandidate === "error" && (
                                      <p className="text-xs text-red-600 mt-1">✗ Failed to send email</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(evaluationUrl)
                                      }}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSendEmail(candidateId, evaluationUrl, newEvaluation.title)}
                                      disabled={isEmailSending}
                                    >
                                      {isEmailSending ? (
                                        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                      ) : (
                                        <Mail className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateEvaluationOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateEvaluation}>Create Evaluation</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvaluations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No evaluations found matching your criteria.</p>
                      <p className="text-sm">Create your first evaluation to get started.</p>
                    </div>
                  ) : (
                    filteredEvaluations.map((evaluation) => (
                      <Card key={evaluation.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">{evaluation.title}</h3>
                                <Badge className={getStatusColor(evaluation.status)}>{evaluation.status}</Badge>
                              </div>
                              <p className="text-gray-600 mb-3">{evaluation.description}</p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{evaluation.duration} minutes</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{evaluation.assignedCandidates.length} candidates</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">
                                    {evaluation.subjects.reduce((total, subject) => total + subject.questionCount, 0)}{" "}
                                    questions
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Subjects:</p>
                                <div className="flex flex-wrap gap-2">
                                  {evaluation.subjects.map((subject) => (
                                    <div key={subject.subject} className="flex items-center space-x-1">
                                      <Badge variant="outline">
                                        {subject.subject} ({subject.questionCount})
                                      </Badge>
                                      {subject.specificQuestions && subject.specificQuestions.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          Custom
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                <p>
                                  Expires:{" "}
                                  {evaluation.expiryDate instanceof Date
                                    ? evaluation.expiryDate.toLocaleDateString()
                                    : new Date(evaluation.expiryDate).toLocaleDateString()}
                                </p>
                                <p>
                                  Created:{" "}
                                  {evaluation.createdAt instanceof Date
                                    ? evaluation.createdAt.toLocaleDateString()
                                    : new Date(evaluation.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              <Button variant="outline" size="sm" onClick={() => handleCopyEvaluationLink(evaluation)}>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Link
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleEvaluationStatus(evaluation.id)}
                                disabled={evaluation.status === "expired"}
                              >
                                {evaluation.status === "active" ? (
                                  <>
                                    <Pause className="w-4 h-4 mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>

                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{evaluation.title}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEvaluation(evaluation.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignCandidatesToExisting(evaluation)}
                                className="mr-2"
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Assign Candidates
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Candidates ({candidates.length})</CardTitle>
                  <CardDescription>Manage candidate accounts and evaluation assignments</CardDescription>
                </div>
                <Dialog open={isAddCandidateOpen} onOpenChange={setIsAddCandidateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Candidate</DialogTitle>
                      <DialogDescription>Create a new candidate account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="candidateName">Full Name</Label>
                        <Input
                          id="candidateName"
                          placeholder="Enter candidate's full name"
                          value={newCandidate.name}
                          onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="candidateEmail">Email Address</Label>
                        <Input
                          id="candidateEmail"
                          type="email"
                          placeholder="candidate@example.com"
                          value={newCandidate.email}
                          onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCandidate}>Add Candidate</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                            {candidate.lastActivity && (
                              <p className="text-xs text-gray-500">
                                Last activity: {formatDate(candidate.lastActivity)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getCandidateStatusColor(candidate.status)}>{candidate.status}</Badge>
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4 mr-1" />
                              <span
                                onClick={() => {
                                  const evaluation = evaluations.find((e) =>
                                    e.assignedCandidates.includes(candidate.id),
                                  )
                                  if (evaluation) {
                                    const evaluationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/evaluation/${evaluation.accessToken}`
                                    handleSendEmail(candidate.id, evaluationUrl, evaluation.title)
                                  }
                                }}
                                className="cursor-pointer"
                              >
                                Send Email
                              </span>
                            </Button>
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

        {/* Question Selection Dialog */}
        <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Questions for {currentSubjectForSelection}</DialogTitle>
              <DialogDescription>
                Choose specific questions or leave empty for random selection from the question bank
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Question Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search questions..."
                      value={questionSearchTerm}
                      onChange={(e) => setQuestionSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedQuestionCategory} onValueChange={setSelectedQuestionCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategoriesForSelection.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Questions Summary */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">{selectedQuestions.length} questions selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestions([])}
                  disabled={selectedQuestions.length === 0}
                >
                  Clear All
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestionsForSelection.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions found for {currentSubjectForSelection}.</p>
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  filteredQuestionsForSelection.map((question) => (
                    <Card key={question.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedQuestions([...selectedQuestions, question.id])
                              } else {
                                setSelectedQuestions(selectedQuestions.filter((id) => id !== question.id))
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary">{question.category}</Badge>
                              {question.multipleCorrect && (
                                <Badge variant="outline" className="text-xs">
                                  Multiple Answers
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium mb-2">{question.question}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`p-1 rounded text-xs ${
                                    question.correctAnswers.includes(index)
                                      ? "bg-green-50 border border-green-200 text-green-800"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {String.fromCharCode(65 + index)}. {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsQuestionSelectorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleQuestionSelection}>Use Selected Questions ({selectedQuestions.length})</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Evaluation Dialog */}
        <Dialog open={isEditEvaluationOpen} onOpenChange={setIsEditEvaluationOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Evaluation</DialogTitle>
              <DialogDescription>Modify the details of an existing evaluation</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEvalTitle">Evaluation Title</Label>
                  <Input
                    id="editEvalTitle"
                    placeholder="e.g., Full Stack Developer Assessment"
                    value={newEvaluation.title}
                    onChange={(e) => setNewEvaluation({ ...newEvaluation, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editEvalDuration">Duration (minutes)</Label>
                  <Input
                    id="editEvalDuration"
                    type="number"
                    min="15"
                    max="300"
                    value={newEvaluation.duration}
                    onChange={(e) =>
                      setNewEvaluation({ ...newEvaluation, duration: Number.parseInt(e.target.value) || 60 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editEvalDescription">Description</Label>
                <Textarea
                  id="editEvalDescription"
                  placeholder="Describe the evaluation purpose and scope..."
                  value={newEvaluation.description}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="editEvalExpiry">Expiry Date</Label>
                <Input
                  id="editEvalExpiry"
                  type="datetime-local"
                  value={newEvaluation.expiryDate}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, expiryDate: e.target.value })}
                />
              </div>

              <div>
                <Label>Question Selection</Label>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Add subjects to your evaluation:</p>
                    <div className="flex flex-wrap gap-2">
                      {questionBanks.map((bank) => (
                        <Button
                          key={bank.subject}
                          variant="outline"
                          size="sm"
                          onClick={() => addSubjectToEvaluation(bank.subject)}
                          disabled={newEvaluation.subjects.some((s) => s.subject === bank.subject)}
                          className="bg-transparent"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {bank.subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {newEvaluation.subjects.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Selected Subjects:</p>
                      {newEvaluation.subjects.map((subject) => {
                        const maxQuestions =
                          questionBanks.find((bank) => bank.subject === subject.subject)?.questionCount || 10
                        const hasSpecificQuestions = subject.specificQuestions && subject.specificQuestions.length > 0
                        return (
                          <div
                            key={subject.subject}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">{subject.subject}</span>
                              <Badge variant="outline">
                                {hasSpecificQuestions
                                  ? `${subject.specificQuestions!.length} specific`
                                  : `${subject.questionCount} random`}{" "}
                                questions
                              </Badge>
                              {hasSpecificQuestions && (
                                <Badge variant="secondary" className="text-xs">
                                  Custom Selection
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!hasSpecificQuestions && (
                                <Input
                                  type="number"
                                  min="1"
                                  max={maxQuestions}
                                  value={subject.questionCount}
                                  onChange={(e) =>
                                    updateSubjectQuestionCount(subject.subject, Number.parseInt(e.target.value) || 1)
                                  }
                                  className="w-20"
                                />
                              )}
                              <Button variant="outline" size="sm" onClick={() => openQuestionSelector(subject.subject)}>
                                <Filter className="w-4 h-4 mr-1" />
                                {hasSpecificQuestions ? "Edit" : "Select"} Questions
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeSubjectFromEvaluation(subject.subject)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Assign Candidates</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center space-x-2">
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
                              assignedCandidates: newEvaluation.assignedCandidates.filter((id) => id !== candidate.id),
                            })
                          }
                        }}
                      />
                      <span className="text-sm">
                        {candidate.name} ({candidate.email})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment URLs Display for Edit */}
              {editingEvaluation && editingEvaluation.assignedCandidates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Current Assignment URLs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendBulkEmails(editingEvaluation)}
                      disabled={emailSending.length > 0}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {emailSending.length > 0 ? "Sending..." : "Send All Emails"}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Active URLs for assigned candidates:</p>
                    {editingEvaluation.assignedCandidates.map((candidateId) => {
                      const candidate = candidates.find((c) => c.id === candidateId)
                      const evaluationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/evaluation/${editingEvaluation.accessToken}`
                      const isEmailSending = emailSending.includes(candidateId)
                      const emailStatusForCandidate = emailStatus[candidateId]

                      return (
                        <div
                          key={candidateId}
                          className="flex items-center justify-between bg-white p-2 rounded border"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{candidate?.name}</p>
                            <p className="text-xs text-gray-500">{candidate?.email}</p>
                            <p className="text-xs text-blue-600 font-mono break-all">{evaluationUrl}</p>
                            {emailStatusForCandidate === "success" && (
                              <p className="text-xs text-green-600 mt-1">✓ Email sent successfully</p>
                            )}
                            {emailStatusForCandidate === "error" && (
                              <p className="text-xs text-red-600 mt-1">✗ Failed to send email</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(evaluationUrl)
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendEmail(candidateId, evaluationUrl, editingEvaluation.title)}
                              disabled={isEmailSending}
                            >
                              {isEmailSending ? (
                                <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditEvaluationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditedEvaluation}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isAssignCandidatesOpen} onOpenChange={setIsAssignCandidatesOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Candidates to Evaluation</DialogTitle>
              <DialogDescription>
                {evaluationForAssignment && `Select candidates for "${evaluationForAssignment.title}"`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`assign-${candidate.id}`}
                      checked={candidateAssignment.assignedCandidates.includes(candidate.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCandidateAssignment({
                            ...candidateAssignment,
                            assignedCandidates: [...candidateAssignment.assignedCandidates, candidate.id],
                          })
                        } else {
                          setCandidateAssignment({
                            ...candidateAssignment,
                            assignedCandidates: candidateAssignment.assignedCandidates.filter(
                              (id) => id !== candidate.id,
                            ),
                          })
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                    <Badge variant={candidate.status === "completed" ? "default" : "secondary"}>
                      {candidate.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignCandidatesOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCandidateAssignment}>Assign Selected Candidates</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
