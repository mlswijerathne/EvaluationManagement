"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { ArrowLeft, Plus, Search, Edit, Trash2, BookOpen, X } from "lucide-react"
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

interface QuestionBank {
  id: string
  subject: string
  questionCount: number
  categories: string[]
}

export default function QuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedBank, setSelectedBank] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateBankOpen, setIsCreateBankOpen] = useState(false)
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [activeTab, setActiveTab] = useState("banks")
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState("")

  const [newBankSubject, setNewBankSubject] = useState("")
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    category: "",
    question: "",
    options: ["", ""],
    correctAnswers: [] as number[],
    multipleCorrect: false,
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const bankParam = searchParams.get("bank")

    if (bankParam && questionBanks.length > 0) {
      // Check if the bank exists in our question banks
      const bankExists = questionBanks.some((bank) => bank.subject === bankParam)
      if (bankExists) {
        switchToQuestionsTab(bankParam)
      }
    }
  }, [questionBanks])

  const loadMockData = () => {
    const mockBanks: QuestionBank[] = [
      {
        id: "1",
        subject: "React",
        questionCount: 25,
        categories: ["Components", "Hooks", "State Management", "Performance", "JSX", "Props", "Context API"],
      },
      {
        id: "2",
        subject: "Angular",
        questionCount: 30,
        categories: ["Components", "Services", "RxJS", "Routing", "Directives", "Pipes", "Forms"],
      },
      {
        id: "3",
        subject: "Spring Boot",
        questionCount: 20,
        categories: ["Configuration", "REST APIs", "Security", "Data Access", "Annotations", "Testing"],
      },
      {
        id: "4",
        subject: "Python",
        questionCount: 35,
        categories: ["Syntax", "Data Structures", "OOP", "Libraries", "Functions", "Modules"],
      },
      {
        id: "5",
        subject: "Node.js",
        questionCount: 18,
        categories: ["Express", "Async Programming", "NPM", "File System", "Middleware", "Authentication"],
      },
    ]

    const mockQuestions: Question[] = [
      // React Questions
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
        question: "Which of the following are valid ways to create a React component? (Select all that apply)",
        options: ["Function Declaration", "Arrow Function", "Class Component", "Object Literal"],
        correctAnswers: [0, 1, 2],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "3",
        subject: "React",
        category: "JSX",
        question: "What does JSX stand for?",
        options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java XML"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "4",
        subject: "React",
        category: "Props",
        question: "How do you pass data from parent to child component in React?",
        options: ["Through props", "Through state", "Through context", "Through refs"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "5",
        subject: "React",
        category: "State Management",
        question: "Which of the following are state management solutions for React?",
        options: ["Redux", "Context API", "Zustand", "MobX"],
        correctAnswers: [0, 1, 2, 3],
        multipleCorrect: true,
        createdAt: new Date(),
      },

      // Angular Questions
      {
        id: "6",
        subject: "Angular",
        category: "Services",
        question: "What decorator is used to make a class injectable in Angular?",
        options: ["@Component", "@Injectable", "@Service", "@Inject"],
        correctAnswers: [1],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "7",
        subject: "Angular",
        category: "Components",
        question: "Which lifecycle hook is called after Angular initializes the component's views?",
        options: ["ngOnInit", "ngAfterViewInit", "ngOnDestroy", "ngOnChanges"],
        correctAnswers: [1],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "8",
        subject: "Angular",
        category: "Directives",
        question: "Which of the following are types of directives in Angular?",
        options: ["Structural", "Attribute", "Component", "Service"],
        correctAnswers: [0, 1, 2],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "9",
        subject: "Angular",
        category: "RxJS",
        question: "What is the purpose of the pipe operator in RxJS?",
        options: ["To create observables", "To chain operators", "To subscribe to observables", "To emit values"],
        correctAnswers: [1],
        multipleCorrect: false,
        createdAt: new Date(),
      },

      // Spring Boot Questions
      {
        id: "10",
        subject: "Spring Boot",
        category: "Annotations",
        question: "Which annotation is used to mark a class as a Spring Boot main class?",
        options: ["@SpringBootApplication", "@EnableAutoConfiguration", "@ComponentScan", "@Configuration"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "11",
        subject: "Spring Boot",
        category: "REST APIs",
        question: "Which annotations are used to create REST endpoints in Spring Boot?",
        options: ["@RestController", "@RequestMapping", "@GetMapping", "@PostMapping"],
        correctAnswers: [0, 1, 2, 3],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "12",
        subject: "Spring Boot",
        category: "Configuration",
        question: "What file is used for application configuration in Spring Boot?",
        options: ["application.properties", "config.xml", "settings.json", "app.config"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },

      // Python Questions
      {
        id: "13",
        subject: "Python",
        category: "Data Structures",
        question: "Which of the following are mutable data types in Python?",
        options: ["List", "Tuple", "Dictionary", "Set"],
        correctAnswers: [0, 2, 3],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "14",
        subject: "Python",
        category: "OOP",
        question: "What keyword is used to create a class in Python?",
        options: ["class", "def", "function", "object"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "15",
        subject: "Python",
        category: "Functions",
        question: "How do you define a function in Python?",
        options: [
          "def function_name():",
          "function function_name():",
          "func function_name():",
          "define function_name():",
        ],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },

      // Node.js Questions
      {
        id: "16",
        subject: "Node.js",
        category: "Express",
        question: "What is Express.js?",
        options: ["A web framework for Node.js", "A database", "A testing library", "A package manager"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
      {
        id: "17",
        subject: "Node.js",
        category: "Async Programming",
        question: "Which of the following are ways to handle asynchronous operations in Node.js?",
        options: ["Callbacks", "Promises", "Async/Await", "Synchronous calls"],
        correctAnswers: [0, 1, 2],
        multipleCorrect: true,
        createdAt: new Date(),
      },
      {
        id: "18",
        subject: "Node.js",
        category: "NPM",
        question: "What does NPM stand for?",
        options: ["Node Package Manager", "New Project Manager", "Node Program Manager", "Network Package Manager"],
        correctAnswers: [0],
        multipleCorrect: false,
        createdAt: new Date(),
      },
    ]

    setQuestionBanks(mockBanks)
    setQuestions(mockQuestions)
  }

  const handleCreateBank = () => {
    const errors: string[] = []

    if (!newBankSubject.trim()) {
      errors.push("Subject name is required")
    }

    if (questionBanks.some((bank) => bank.subject.toLowerCase() === newBankSubject.trim().toLowerCase())) {
      errors.push("A question bank with this subject already exists")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    const newBank: QuestionBank = {
      id: Date.now().toString(),
      subject: newBankSubject.trim(),
      questionCount: 0,
      categories: [],
    }

    setQuestionBanks([...questionBanks, newBank])
    setNewBankSubject("")
    setFormErrors([])
    setIsCreateBankOpen(false)

    setSuccessMessage(`Question bank "${newBank.subject}" created successfully!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleCreateQuestion = () => {
    const errors: string[] = []

    if (!newQuestion.question.trim()) {
      errors.push("Question text is required")
    }

    const questionSubject = selectedBank !== "all" ? selectedBank : newQuestion.subject
    if (!questionSubject) {
      errors.push("Please select a subject")
    }

    if (!newQuestion.category.trim()) {
      errors.push("Category is required")
    }

    const validOptions = newQuestion.options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      errors.push("Please provide at least 2 answer options")
    }

    if (newQuestion.correctAnswers.length === 0) {
      errors.push("Please select at least one correct answer")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    const question: Question = {
      id: Date.now().toString(),
      subject: questionSubject,
      category: newQuestion.category.trim(),
      question: newQuestion.question.trim(),
      options: validOptions,
      correctAnswers: newQuestion.correctAnswers.filter((i) => i < validOptions.length),
      multipleCorrect: newQuestion.multipleCorrect,
      createdAt: new Date(),
    }

    setQuestions([...questions, question])

    setQuestionBanks((banks) =>
      banks.map((bank) =>
        bank.subject === questionSubject
          ? {
              ...bank,
              questionCount: bank.questionCount + 1,
              categories: [...new Set([...bank.categories, newQuestion.category.trim()])],
            }
          : bank,
      ),
    )

    setNewQuestion({
      subject: "",
      category: "",
      question: "",
      options: ["", ""],
      correctAnswers: [],
      multipleCorrect: false,
    })
    setFormErrors([])
    setIsCreateQuestionOpen(false)

    setSuccessMessage(`Question added successfully to ${questionSubject}!`)
    setTimeout(() => setSuccessMessage(""), 3000)

    setActiveTab("questions")
    setSelectedBank(questionSubject)
  }

  const handleEditQuestion = () => {
    if (!editingQuestion) return

    const errors: string[] = []

    if (!editingQuestion.question.trim()) {
      errors.push("Question text is required")
    }

    if (!editingQuestion.subject) {
      errors.push("Please select a subject")
    }

    if (!editingQuestion.category.trim()) {
      errors.push("Category is required")
    }

    const validOptions = editingQuestion.options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      errors.push("Please provide at least 2 answer options")
    }

    if (editingQuestion.correctAnswers.length === 0) {
      errors.push("Please select at least one correct answer")
    }

    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    const updatedQuestion = {
      ...editingQuestion,
      category: editingQuestion.category.trim(),
      question: editingQuestion.question.trim(),
      options: validOptions,
      correctAnswers: editingQuestion.correctAnswers.filter((i) => i < validOptions.length),
    }

    setQuestions(questions.map((q) => (q.id === editingQuestion.id ? updatedQuestion : q)))
    setFormErrors([])
    setEditingQuestion(null)

    setSuccessMessage("Question updated successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const startEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question })
    setFormErrors([])
  }

  const handleDeleteQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    setQuestions(questions.filter((q) => q.id !== questionId))

    setQuestionBanks((banks) =>
      banks.map((bank) =>
        bank.subject === question.subject ? { ...bank, questionCount: Math.max(0, bank.questionCount - 1) } : bank,
      ),
    )
  }

  const addAnswerOption = (isEditing = false) => {
    if (isEditing && editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        options: [...editingQuestion.options, ""],
      })
    } else {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, ""],
      })
    }
  }

  const removeAnswerOption = (index: number, isEditing = false) => {
    if (isEditing && editingQuestion) {
      if (editingQuestion.options.length <= 2) return // Minimum 2 options required

      const newOptions = editingQuestion.options.filter((_, i) => i !== index)
      const newCorrectAnswers = editingQuestion.correctAnswers
        .filter((i) => i !== index) // Remove if this was a correct answer
        .map((i) => (i > index ? i - 1 : i)) // Adjust indices for remaining answers

      setEditingQuestion({
        ...editingQuestion,
        options: newOptions,
        correctAnswers: newCorrectAnswers,
      })
    } else {
      if (newQuestion.options.length <= 2) return // Minimum 2 options required

      const newOptions = newQuestion.options.filter((_, i) => i !== index)
      const newCorrectAnswers = newQuestion.correctAnswers
        .filter((i) => i !== index) // Remove if this was a correct answer
        .map((i) => (i > index ? i - 1 : i)) // Adjust indices for remaining answers

      setNewQuestion({
        ...newQuestion,
        options: newOptions,
        correctAnswers: newCorrectAnswers,
      })
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBank = selectedBank === "all" || q.subject === selectedBank
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory

    return matchesSearch && matchesBank && matchesCategory
  })

  const availableCategories =
    selectedBank && selectedBank !== "all"
      ? questionBanks.find((bank) => bank.subject === selectedBank)?.categories || []
      : [...new Set(questions.map((q) => q.category))]

  const switchToQuestionsTab = (bankSubject: string) => {
    setSelectedBank(bankSubject)
    setActiveTab("questions")
    setSelectedCategory("all")
    setSearchTerm("")
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {activeTab === "questions" && selectedBank !== "all" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveTab("banks")
                  setSelectedBank("all")
                  setSelectedCategory("all")
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Question Banks
              </Button>
            ) : (
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "questions" && selectedBank !== "all"
                ? `${selectedBank} Questions`
                : "Question Bank Management"}
            </h1>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="banks">Question Banks</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="banks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subject Question Banks</CardTitle>
                  <CardDescription>Manage question repositories by subject area</CardDescription>
                </div>
                <Dialog
                  open={isCreateBankOpen}
                  onOpenChange={(open) => {
                    setIsCreateBankOpen(open)
                    if (!open) {
                      setFormErrors([])
                      setNewBankSubject("")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Question Bank
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Question Bank</DialogTitle>
                      <DialogDescription>Add a new subject area for organizing questions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {formErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <ul className="text-sm text-red-600 space-y-1">
                            {formErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="subject">Subject Name</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., React, Angular, Python"
                          value={newBankSubject}
                          onChange={(e) => setNewBankSubject(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateBankOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateBank}>Create Bank</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questionBanks.map((bank) => (
                    <Card key={bank.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <Badge variant="secondary">{bank.questionCount} questions</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{bank.subject}</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {bank.categories.length > 0 ? (
                              bank.categories.map((category) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">No categories yet</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 bg-transparent"
                          onClick={() => switchToQuestionsTab(bank.subject)}
                        >
                          Manage Questions
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search questions or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {questionBanks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.subject}>
                          {bank.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                  <CardDescription>Manage individual questions and their properties</CardDescription>
                </div>
                <Dialog
                  open={isCreateQuestionOpen}
                  onOpenChange={(open) => {
                    setIsCreateQuestionOpen(open)
                    if (!open) {
                      setFormErrors([])
                      setNewQuestion({
                        subject: "",
                        category: "",
                        question: "",
                        options: ["", ""],
                        correctAnswers: [],
                        multipleCorrect: false,
                      })
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        {selectedBank !== "all"
                          ? `Create a new question for ${selectedBank}`
                          : "Create a new question for your question bank"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {formErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <ul className="text-sm text-red-600 space-y-1">
                            {formErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedBank === "all" ? (
                          <div>
                            <Label htmlFor="questionSubject">Subject</Label>
                            <Select
                              value={newQuestion.subject}
                              onValueChange={(value) => setNewQuestion({ ...newQuestion, subject: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {questionBanks.map((bank) => (
                                  <SelectItem key={bank.id} value={bank.subject}>
                                    {bank.subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div>
                            <Label>Subject</Label>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-800">
                              {selectedBank} (Auto-selected)
                            </div>
                            <input type="hidden" value={selectedBank} />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="questionCategory">Category</Label>
                          <Input
                            id="questionCategory"
                            placeholder="e.g., Hooks, Components"
                            value={newQuestion.category}
                            onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="questionText">Question</Label>
                        <Textarea
                          id="questionText"
                          placeholder="Enter your question here..."
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Answer Options</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addAnswerOption(false)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                checked={newQuestion.correctAnswers.includes(index)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    if (newQuestion.multipleCorrect) {
                                      setNewQuestion({
                                        ...newQuestion,
                                        correctAnswers: [...newQuestion.correctAnswers, index],
                                      })
                                    } else {
                                      setNewQuestion({
                                        ...newQuestion,
                                        correctAnswers: [index],
                                      })
                                    }
                                  } else {
                                    setNewQuestion({
                                      ...newQuestion,
                                      correctAnswers: newQuestion.correctAnswers.filter((i) => i !== index),
                                    })
                                  }
                                }}
                              />
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options]
                                  newOptions[index] = e.target.value
                                  setNewQuestion({ ...newQuestion, options: newOptions })
                                }}
                                className="flex-1"
                              />
                              {newQuestion.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAnswerOption(index, false)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Check the boxes next to correct answers. Minimum 2 options required.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multipleCorrect"
                          checked={newQuestion.multipleCorrect}
                          onCheckedChange={(checked) => {
                            setNewQuestion({
                              ...newQuestion,
                              multipleCorrect: !!checked,
                              correctAnswers: checked
                                ? newQuestion.correctAnswers
                                : newQuestion.correctAnswers.slice(0, 1),
                            })
                          }}
                        />
                        <Label htmlFor="multipleCorrect">Allow multiple correct answers</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateQuestionOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateQuestion}>Add Question</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No questions found matching your criteria.</p>
                      <p className="text-sm">Try adjusting your filters or add a new question.</p>
                    </div>
                  ) : (
                    filteredQuestions.map((question) => (
                      <Card key={question.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{question.subject}</Badge>
                                <Badge variant="secondary">{question.category}</Badge>
                                {question.multipleCorrect && (
                                  <Badge variant="outline" className="text-xs">
                                    Multiple Answers
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-medium text-lg mb-3">{question.question}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {question.options.map((option, index) => (
                                  <div
                                    key={index}
                                    className={`p-2 rounded text-sm ${
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
                            <div className="flex items-center space-x-2 ml-4">
                              <Button variant="outline" size="sm" onClick={() => startEditQuestion(question)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

        <Dialog
          open={!!editingQuestion}
          onOpenChange={(open) => {
            if (!open) {
              setEditingQuestion(null)
              setFormErrors([])
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update the question details</DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4">
                {formErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <ul className="text-sm text-red-600 space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editQuestionSubject">Subject</Label>
                    <Select
                      value={editingQuestion.subject}
                      onValueChange={(value) => setEditingQuestion({ ...editingQuestion, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.subject}>
                            {bank.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editQuestionCategory">Category</Label>
                    <Input
                      id="editQuestionCategory"
                      placeholder="e.g., Hooks, Components"
                      value={editingQuestion.category}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="editQuestionText">Question</Label>
                  <Textarea
                    id="editQuestionText"
                    placeholder="Enter your question here..."
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Answer Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addAnswerOption(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editingQuestion.correctAnswers.includes(index)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (editingQuestion.multipleCorrect) {
                                setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswers: [...editingQuestion.correctAnswers, index],
                                })
                              } else {
                                setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswers: [index],
                                })
                              }
                            } else {
                              setEditingQuestion({
                                ...editingQuestion,
                                correctAnswers: editingQuestion.correctAnswers.filter((i) => i !== index),
                              })
                            }
                          }}
                        />
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options]
                            newOptions[index] = e.target.value
                            setEditingQuestion({ ...editingQuestion, options: newOptions })
                          }}
                          className="flex-1"
                        />
                        {editingQuestion.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAnswerOption(index, true)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Check the boxes next to correct answers. Minimum 2 options required.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editMultipleCorrect"
                    checked={editingQuestion.multipleCorrect}
                    onCheckedChange={(checked) => {
                      setEditingQuestion({
                        ...editingQuestion,
                        multipleCorrect: !!checked,
                        correctAnswers: checked
                          ? editingQuestion.correctAnswers
                          : editingQuestion.correctAnswers.slice(0, 1),
                      })
                    }}
                  />
                  <Label htmlFor="editMultipleCorrect">Allow multiple correct answers</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditQuestion}>Update Question</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
