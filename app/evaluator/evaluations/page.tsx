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
  Copy,
  Eye,
  Edit,
  Play,
  Pause,
  Filter,
  User,
  X,
  Circle as CircleIcon,
} from "lucide-react"
import Link from "next/link"
import EvaluationCandidates from "@/components/evaluation-candidates"
import { updateCandidateEvaluationResults } from "@/lib/evaluationResults"

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
  version?: number
  previousVersionId?: string
}


export default function EvaluationsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  // candidates are managed on a separate page (/admin/candidates)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionBanks] = useState([
    { subject: "React", questionCount: 25 },
    { subject: "Angular", questionCount: 30 },
    { subject: "Spring Boot", questionCount: 20 },
    { subject: "Python", questionCount: 35 },
    { subject: "Node.js", questionCount: 18 },
  ])
  const [groups, setGroups] = useState<string[]>(["Batch 2025", "Interns Q3"])

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("groups") : null
      if (saved) setGroups(JSON.parse(saved))
    } catch (e) {
      // ignore and keep defaults
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateEvaluationOpen, setIsCreateEvaluationOpen] = useState(false)
  // candidate management moved to /admin/candidates
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [currentSubjectForSelection, setCurrentSubjectForSelection] = useState<string>("")
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

  // Question selection filters
  const [questionSearchTerm, setQuestionSearchTerm] = useState("")
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  
  // New question form
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    category: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswers: [] as number[],
    multipleCorrect: false
  })

  // Form states
  const [newEvaluation, setNewEvaluation] = useState({
    title: "",
    description: "",
    subjects: [] as { subject: string; questionCount: number; specificQuestions?: string[] }[],
    duration: 60,
    expiryDate: "",
    assignedCandidates: [] as string[],
  })

  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null)
  const [isEditEvaluationOpen, setIsEditEvaluationOpen] = useState(false)
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null)
  const [isViewEvaluationOpen, setIsViewEvaluationOpen] = useState(false)
  const [isViewCandidatesOpen, setIsViewCandidatesOpen] = useState(false)
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
    expiryDate: "",
    duration: 60,
  })

  const [successMessage, setSuccessMessage] = useState("")
  const [adminEmail, setAdminEmail] = useState<string>("admin@example.com")
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  const [questionsModified, setQuestionsModified] = useState(false)

  // candidate assignment is done on the Candidates page

  useEffect(() => {
    const auth = localStorage.getItem("evaluatorAuth")
    if (!auth) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      loadMockData()
    }
  }, [router])

  // Simple audit writer used by this page
  const writeAudit = (entry: string) => {
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    const next = [`${entry} on ${new Date().toLocaleString()}`, ...logs]
    localStorage.setItem("auditLogs", JSON.stringify(next))
  }

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedEvaluations = localStorage.getItem("evaluations")

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
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        loadMockData()
      }
    }

    loadData()
  }, [])

  const loadMockData = () => {
    const savedEvaluations = localStorage.getItem("evaluations")
    const savedQuestions = localStorage.getItem("questions")
    
    // Update evaluation results in candidate profiles
    updateCandidateEvaluationResults()

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
      assignedCandidates: newEvaluation.assignedCandidates || [],
      createdAt: new Date(),
      accessToken: Math.random().toString(36).substring(2, 15),
    }

    const updatedEvaluations = [...evaluations, evaluation]
    setEvaluations(updatedEvaluations)
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations))

  writeAudit(`Evaluation created: ${evaluation.title}`)

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

  const cloneEvaluation = (evaluation: Evaluation) => {
    const baseVersionMatch = evaluation.title.match(/\(v(\d+)\)$/)
    const currentVersion = baseVersionMatch ? Number(baseVersionMatch[1]) : 1
    const newVersion = currentVersion + 1
    const cloned: Evaluation = {
      ...evaluation,
      id: Date.now().toString(),
      title: `${evaluation.title.replace(/\s*\(v\d+\)$/, "")} (v${newVersion})`,
      status: "draft",
      accessToken: `eval_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
    }

    const updated = [...evaluations, cloned]
    setEvaluations(updated)
    localStorage.setItem("evaluations", JSON.stringify(updated))
    writeAudit(`Evaluation cloned: ${evaluation.title} → ${cloned.title}`)
    alert(`Cloned evaluation as "${cloned.title}" (mock)`)
  }

  // candidate creation/management moved to /admin/candidates

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
      
      if (editingEvaluation) {
        setQuestionsModified(true);
      }
    }
  }

  const removeSubjectFromEvaluation = (subject: string) => {
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.filter((s) => s.subject !== subject),
    })
    
    if (editingEvaluation) {
      setQuestionsModified(true);
    }
  }

  const updateSubjectQuestionCount = (subject: string, count: number) => {
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.map((s) => (s.subject === subject ? { ...s, questionCount: count } : s)),
    })
    
    if (editingEvaluation) {
      setQuestionsModified(true);
    }
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
    // Get the previous specific questions for comparison
    const currentSubject = newEvaluation.subjects.find((s) => s.subject === currentSubjectForSelection);
    const previousQuestions = currentSubject?.specificQuestions || [];
    
    // Check if questions changed
    const questionsChanged = 
      previousQuestions.length !== selectedQuestions.length || 
      !previousQuestions.every(q => selectedQuestions.includes(q));
    
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.map((s) =>
        s.subject === currentSubjectForSelection
          ? { ...s, specificQuestions: selectedQuestions, questionCount: selectedQuestions.length }
          : s,
      ),
    })
    
    // If editing and questions changed, flag that we've modified questions
    if (editingEvaluation && questionsChanged) {
      setQuestionsModified(true);
    }
    
    setIsQuestionSelectorOpen(false)
    setCurrentSubjectForSelection("")
    setSelectedQuestions([])
  }
  
  // Open the Add Question dialog with preselected subject
  const openAddQuestionDialog = (subject: string) => {
    setNewQuestion({
      ...newQuestion,
      subject: subject,
      category: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [],
      multipleCorrect: false
    });
    setIsAddQuestionOpen(true);
  }
  
  // Handle adding a new question and applying versioning if needed
  const handleAddQuestion = () => {
    // Validate question
    if (!newQuestion.subject || !newQuestion.category || !newQuestion.question || 
        newQuestion.options.some(o => !o.trim()) || newQuestion.correctAnswers.length === 0) {
      alert("Please fill in all question fields and select at least one correct answer");
      return;
    }
    
    // Create new question
    const question: Question = {
      id: `q-${Date.now()}`,
      subject: newQuestion.subject,
      category: newQuestion.category,
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswers: newQuestion.correctAnswers,
      multipleCorrect: newQuestion.multipleCorrect,
      createdAt: new Date()
    };
    
    // Add to questions list
    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));
    
    // Add to current evaluation subject
    const updatedSpecificQuestions = [...(selectedQuestions || []), question.id];
    
    setSelectedQuestions(updatedSpecificQuestions);
    
    setNewEvaluation({
      ...newEvaluation,
      subjects: newEvaluation.subjects.map((s) =>
        s.subject === newQuestion.subject
          ? { 
              ...s, 
              specificQuestions: updatedSpecificQuestions,
              questionCount: updatedSpecificQuestions.length 
            }
          : s
      ),
    });
    
    // Mark as modified for versioning
    if (editingEvaluation) {
      setQuestionsModified(true);
    }
    
    writeAudit(`Added new question to ${newQuestion.subject}: "${newQuestion.question.substring(0, 30)}..."`);
    
    // Reset and close dialog
    setIsAddQuestionOpen(false);
    setNewQuestion({
      subject: "",
      category: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswers: [],
      multipleCorrect: false
    });
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
      assignedCandidates: evaluation.assignedCandidates || [],
    })
    setQuestionsModified(false)
    setIsEditEvaluationOpen(true)
  }
  
  // Check if questions have been modified
  const areQuestionsModified = (originalSubjects: any[], newSubjects: any[]): boolean => {
    // If the number of subjects changed
    if (originalSubjects.length !== newSubjects.length) return true;
    
    // Check each subject for changes in questions
    for (let i = 0; i < originalSubjects.length; i++) {
      const original = originalSubjects[i];
      // Find the matching subject in new subjects
      const matchingSubject = newSubjects.find(s => s.subject === original.subject);
      
      if (!matchingSubject) return true; // Subject was removed
      
      // If question count changed
      if (original.questionCount !== matchingSubject.questionCount) return true;
      
      // Check if specific questions changed
      const originalQuestions = original.specificQuestions || [];
      const newQuestions = matchingSubject.specificQuestions || [];
      
      if (originalQuestions.length !== newQuestions.length) return true;
      
      // Check if any question IDs are different
      for (const qId of originalQuestions) {
        if (!newQuestions.includes(qId)) return true;
      }
    }
    
    return false;
  }

  const handleSaveEditedEvaluation = () => {
    if (!editingEvaluation) return

    // Check if questions were modified and the evaluation is active with assigned candidates
    const hasAssignedCandidates = editingEvaluation.assignedCandidates && editingEvaluation.assignedCandidates.length > 0;
    const isActiveEvaluation = editingEvaluation.status === 'active';
    const shouldCreateNewVersion = questionsModified && hasAssignedCandidates && isActiveEvaluation;
    
    if (shouldCreateNewVersion) {
      // Open version dialog to confirm
      setIsVersionDialogOpen(true);
      return;
    } else {
      // Just update the existing evaluation
      saveEvaluationChanges(false);
    }
  }
  
  // Create a new version of the evaluation
  const createNewVersion = () => {
    if (!editingEvaluation) return;
    
    // Get the current version or default to 1
    const currentVersion = editingEvaluation.version || 1;
    const newVersion = currentVersion + 1;
    
    // Create a new evaluation with incremented version
    const newVersionEvaluation: Evaluation = {
      ...editingEvaluation,
      id: `eval-${Date.now()}`,
      title: newEvaluation.title,
      description: newEvaluation.description,
      subjects: newEvaluation.subjects,
      duration: newEvaluation.duration,
      expiryDate: new Date(newEvaluation.expiryDate),
      assignedCandidates: [], // Start with no assigned candidates
      status: 'draft', // New version starts as draft
      createdAt: new Date(),
      accessToken: Math.random().toString(36).substring(2, 15),
      version: newVersion,
      previousVersionId: editingEvaluation.id
    };
    
    // Add the new version to evaluations
    const updatedEvaluations = [...evaluations, newVersionEvaluation];
    setEvaluations(updatedEvaluations);
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations));
    
    writeAudit(`Created new version of evaluation: ${newEvaluation.title} (v${newVersion})`);
    
    setIsVersionDialogOpen(false);
    setIsEditEvaluationOpen(false);
    setEditingEvaluation(null);
    setQuestionsModified(false);
    setNewEvaluation({
      title: "",
      description: "",
      subjects: [],
      duration: 60,
      expiryDate: "",
      assignedCandidates: [],
    });
    
    setSuccessMessage(`Created new version of evaluation (v${newVersion})!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  }
  
  // Save changes to the existing evaluation
  const saveEvaluationChanges = (closeVersionDialog = true) => {
    if (!editingEvaluation) return;
    
    const updatedEvaluation: Evaluation = {
      ...editingEvaluation,
      title: newEvaluation.title,
      description: newEvaluation.description,
      subjects: newEvaluation.subjects,
      duration: newEvaluation.duration,
      expiryDate: new Date(newEvaluation.expiryDate),
      assignedCandidates: editingEvaluation.assignedCandidates,
      version: editingEvaluation.version || 1, // Keep the same version number
    };

    const updatedEvaluations = evaluations.map((evaluationItem) =>
      evaluationItem.id === editingEvaluation.id ? updatedEvaluation : evaluationItem,
    );
    
    setEvaluations(updatedEvaluations);
    localStorage.setItem("evaluations", JSON.stringify(updatedEvaluations));
    
    if (closeVersionDialog) {
      setIsVersionDialogOpen(false);
    }
    
    setIsEditEvaluationOpen(false);
    setEditingEvaluation(null);
    setQuestionsModified(false);
    setNewEvaluation({
      title: "",
      description: "",
      subjects: [],
      duration: 60,
      expiryDate: "",
      assignedCandidates: [],
    });

    setSuccessMessage("Evaluation updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  const handleAssignTemplate = () => {
    if (!selectedTemplate) return

    const template = prebuiltEvaluations.find((t) => t.id === selectedTemplate)
    if (!template) return

    const newEval: Evaluation = {
      ...template,
      id: Date.now().toString(),
      status: "active",
  assignedCandidates: [],
      expiryDate: new Date(templateAssignment.expiryDate),
      duration: templateAssignment.duration,
      accessToken: `eval_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
    }

    setEvaluations([...evaluations, newEval])
    setSelectedTemplate("")
    setTemplateAssignment({
      expiryDate: "",
      duration: 60,
    })
    setIsAssignTemplateOpen(false)

    setSuccessMessage(`Pre-built evaluation "${newEval.title}" assigned successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handlePromoteCandidate = (candidateId: string) => {
  // candidate promotions are handled on the Candidates page
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
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString()
  }

  // Candidate assignment and related actions have been moved to /admin/candidates

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <Link href="/evaluator/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Evaluation Management</h1>
              </div>
              
            </div>
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


          <TabsContent value="evaluations" className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search by title, description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-6 border-gray-200 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Status:</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center">
                            <CircleIcon className="h-3 w-3 mr-2 text-gray-500" />
                            All Status
                          </div>
                        </SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center">
                            <CircleIcon className="h-3 w-3 mr-2 text-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center">
                            <CircleIcon className="h-3 w-3 mr-2 text-gray-500" />
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <CircleIcon className="h-3 w-3 mr-2 text-blue-500" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="expired">
                          <div className="flex items-center">
                            <CircleIcon className="h-3 w-3 mr-2 text-red-500" />
                            Expired
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

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
                                        onClick={() => openAddQuestionDialog(subject.subject)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Question
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
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Candidate assignment is managed on a separate page.</p>
                          <Link href="/evaluator/candidates">
                            <Button variant="outline" size="sm" className="mt-2">
                              <Users className="w-4 h-4 mr-2" />
                              Manage Candidates
                            </Button>
                          </Link>
                        </div>
                      </div>

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
                                <h3 className="font-semibold text-lg">
                                  {evaluation.title}
                                  {evaluation.version && (
                                    <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      v{evaluation.version}
                                    </span>
                                  )}
                                </h3>
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
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto text-sm font-normal text-gray-900 hover:text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvaluation(evaluation);
                                      setIsViewCandidatesOpen(true);
                                    }}
                                  >
                                    {evaluation.assignedCandidates.length} candidates
                                  </Button>
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

                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditEvaluation(evaluation)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>

                              <Button variant="outline" size="sm" onClick={() => cloneEvaluation(evaluation)}>
                                <Copy className="w-4 h-4 mr-1" />
                                Clone
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
                              <Link href="/evaluator/candidates">
                                <Button variant="outline" size="sm" className="mr-2">
                                  <Users className="w-4 h-4 mr-1" />
                                  Assign Candidates
                                </Button>
                              </Link>
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
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Manage candidate assignments on the Candidates page.</p>
                  <Link href="/evaluator/candidates">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Candidates
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditEvaluationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditedEvaluation}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
  {/* Candidate assignment moved to /admin/candidates */}
      </div>
      
      {/* Add Question Dialog */}
      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question and add it directly to the evaluation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionSubject">Subject</Label>
                <Select 
                  value={newQuestion.subject}
                  onValueChange={(value) => setNewQuestion({...newQuestion, subject: value})}
                  disabled={!!currentSubjectForSelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionBanks.map((bank) => (
                      <SelectItem key={bank.subject} value={bank.subject}>
                        {bank.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="questionCategory">Category</Label>
                <Input
                  id="questionCategory"
                  placeholder="e.g., Hooks, Components, etc."
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="questionText">Question</Label>
              <Textarea
                id="questionText"
                placeholder="Enter the question text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="multipleCorrect" 
                    checked={newQuestion.multipleCorrect}
                    onCheckedChange={(checked) => 
                      setNewQuestion({...newQuestion, multipleCorrect: checked as boolean})
                    }
                  />
                  <Label htmlFor="multipleCorrect" className="text-sm font-normal cursor-pointer">
                    Multiple correct answers
                  </Label>
                </div>
              </div>
              
              <div className="space-y-3 mt-2">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Checkbox
                        id={`option-${index}`}
                        checked={newQuestion.correctAnswers.includes(index)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const newCorrectAnswers = newQuestion.multipleCorrect 
                              ? [...newQuestion.correctAnswers, index]
                              : [index];
                            setNewQuestion({...newQuestion, correctAnswers: newCorrectAnswers});
                          } else {
                            setNewQuestion({
                              ...newQuestion, 
                              correctAnswers: newQuestion.correctAnswers.filter(i => i !== index)
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({...newQuestion, options: newOptions});
                        }}
                      />
                    </div>
                    {index > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const newOptions = newQuestion.options.filter((_, i) => i !== index);
                          const newCorrectAnswers = newQuestion.correctAnswers
                            .filter(i => i !== index)
                            .map(i => i > index ? i - 1 : i);
                          
                          setNewQuestion({
                            ...newQuestion, 
                            options: newOptions,
                            correctAnswers: newCorrectAnswers
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {newQuestion.options.length < 8 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewQuestion({
                        ...newQuestion,
                        options: [...newQuestion.options, ""]
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion}>
                Add Question
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Version Dialog for question changes */}
      <AlertDialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Evaluation Version?</AlertDialogTitle>
            <AlertDialogDescription>
              You've modified questions in an active evaluation that has assigned candidates.
            </AlertDialogDescription>
            <div className="my-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800">
                <div className="font-medium">Creating a new version will:</div>
                <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                  <li>Keep the original evaluation unchanged for current candidates</li>
                  <li>Create a new version with your question changes</li>
                  <li>The new version will start with no assigned candidates</li>
                  <li>You can assign candidates to the new version separately</li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">How would you like to proceed?</div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsVersionDialogOpen(false)}>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => saveEvaluationChanges()}>
              Update Existing Version
            </Button>
            <AlertDialogAction onClick={createNewVersion} className="bg-primary">
              Create New Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Candidates Dialog */}
      {selectedEvaluation && (
        <EvaluationCandidates 
          evaluationId={selectedEvaluation.id}
          evaluationTitle={selectedEvaluation.title}
          isOpen={isViewCandidatesOpen}
          onClose={() => {
            setIsViewCandidatesOpen(false);
            // Update evaluation results when closing the candidates view
            updateCandidateEvaluationResults();
          }}
          isAdmin={false}
        />
      )}
    </div>
  )
}
