"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Save } from "lucide-react"

interface Question {
  id: string
  subject: string
  category: string
  question: string
  options: string[]
  correctAnswers: number[]
  multipleCorrect: boolean
}

interface Answer {
  questionId: string
  selectedAnswers: number[]
  flagged: boolean
  timeSpent: number
}

interface EvaluationSession {
  id: string
  title: string
  description: string
  duration: number // minutes
  questions: Question[]
  candidateName: string
  candidateEmail: string
  startTime: Date
  endTime: Date
}

export default function AssessmentInterface() {
  const params = useParams()
  const router = useRouter()

  const [session, setSession] = useState<EvaluationSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!session) return

    try {
      // Simulate API call to save progress
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLastSaved(new Date())
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [session, answers])

  // Load evaluation session
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Mock evaluation session - replace with real API call
        const mockSession: EvaluationSession = {
          id: params.token as string,
          title: "Full Stack Developer Assessment",
          description: "Technical evaluation covering React, Node.js, and database concepts",
          duration: 90,
          candidateName: "John Doe",
          candidateEmail: "john.doe@example.com",
          startTime: new Date(),
          endTime: new Date(Date.now() + 90 * 60 * 1000),
          questions: [
            {
              id: "1",
              subject: "React",
              category: "Hooks",
              question: "Which hook is used to manage state in functional components?",
              options: ["useState", "useEffect", "useContext", "useReducer"],
              correctAnswers: [0],
              multipleCorrect: false,
            },
            {
              id: "2",
              subject: "React",
              category: "Components",
              question: "Which of the following are valid ways to create a React component? (Select all that apply)",
              options: ["Function Declaration", "Arrow Function", "Class Component", "Object Literal"],
              correctAnswers: [0, 1, 2],
              multipleCorrect: true,
            },
            {
              id: "3",
              subject: "Node.js",
              category: "Express",
              question: "What is the purpose of middleware in Express.js?",
              options: [
                "To handle database connections",
                "To process requests before they reach route handlers",
                "To manage user authentication only",
                "To compile TypeScript code",
              ],
              correctAnswers: [1],
              multipleCorrect: false,
            },
            {
              id: "4",
              subject: "Python",
              category: "Data Structures",
              question: "Which Python data structures are mutable? (Select all that apply)",
              options: ["List", "Tuple", "Dictionary", "Set", "String"],
              correctAnswers: [0, 2, 3],
              multipleCorrect: true,
            },
            {
              id: "5",
              subject: "React",
              category: "Performance",
              question: "What is the primary purpose of React.memo()?",
              options: [
                "To manage component state",
                "To prevent unnecessary re-renders",
                "To handle side effects",
                "To create context providers",
              ],
              correctAnswers: [1],
              multipleCorrect: false,
            },
          ],
        }

        // Shuffle questions and answers
        const shuffledQuestions = mockSession.questions.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]),
        }))

        setSession({ ...mockSession, questions: shuffledQuestions })
        setTimeRemaining(mockSession.duration * 60) // Convert to seconds

        // Initialize answers
        const initialAnswers: Record<string, Answer> = {}
        shuffledQuestions.forEach((q) => {
          initialAnswers[q.id] = {
            questionId: q.id,
            selectedAnswers: [],
            flagged: false,
            timeSpent: 0,
          }
        })
        setAnswers(initialAnswers)
      } catch (err) {
        setError("Failed to load evaluation. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [params.token])

  // Timer countdown
  useEffect(() => {
    if (!session || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session, timeRemaining])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!session) return

    const autoSaveInterval = setInterval(autoSave, 30000)
    return () => clearInterval(autoSaveInterval)
  }, [autoSave, session])

  // Track time spent on current question
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  // Update time spent when leaving question
  useEffect(() => {
    return () => {
      if (session && currentQuestionIndex < session.questions.length) {
        const currentQuestion = session.questions[currentQuestionIndex]
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            ...prev[currentQuestion.id],
            timeSpent: prev[currentQuestion.id].timeSpent + timeSpent,
          },
        }))
      }
    }
  }, [currentQuestionIndex, session, questionStartTime])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleAnswerChange = (questionId: string, selectedAnswers: number[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswers,
      },
    }))
  }

  const handleSingleChoice = (questionId: string, answerIndex: number) => {
    handleAnswerChange(questionId, [answerIndex])
  }

  const handleMultipleChoice = (questionId: string, answerIndex: number, checked: boolean) => {
    const currentAnswers = answers[questionId]?.selectedAnswers || []

    if (checked) {
      handleAnswerChange(questionId, [...currentAnswers, answerIndex])
    } else {
      handleAnswerChange(
        questionId,
        currentAnswers.filter((i) => i !== answerIndex),
      )
    }
  }

  const handleFlagQuestion = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        flagged: !prev[questionId].flagged,
      },
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (session?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Simulate API call to submit evaluation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to results or thank you page
      router.push(`/evaluation/${params.token}/completed`)
    } catch (error) {
      setError("Failed to submit evaluation. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    handleSubmit()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getAnsweredCount = () => {
    return Object.values(answers).filter((answer) => answer.selectedAnswers.length > 0).length
  }

  const getFlaggedCount = () => {
    return Object.values(answers).filter((answer) => answer.flagged).length
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

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Evaluation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">{session.title}</h1>
              <p className="text-sm text-gray-600">{session.candidateName}</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <div className="flex items-center text-sm text-gray-500">
                  <Save className="w-4 h-4 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  timeRemaining < 300 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </span>
              <Badge variant="outline">{currentQuestion.subject}</Badge>
              <Badge variant="secondary">{currentQuestion.category}</Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Answered: {getAnsweredCount()}/{session.questions.length}
              </span>
              {getFlaggedCount() > 0 && <span className="text-orange-600">Flagged: {getFlaggedCount()}</span>}
            </div>
          </div>

          <Progress value={progress} className="mt-3" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>Click to navigate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {session.questions.map((_, index) => {
                    const answer = answers[session.questions[index].id]
                    const isAnswered = answer?.selectedAnswers.length > 0
                    const isFlagged = answer?.flagged
                    const isCurrent = index === currentQuestionIndex

                    let buttonClasses = "relative w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors"

                    if (isCurrent) {
                      buttonClasses += " border-blue-500 bg-blue-500 text-white"
                    } else if (isAnswered) {
                      buttonClasses += " border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                    } else {
                      buttonClasses += " border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }

                    return (
                      <button key={index} onClick={() => handleQuestionNavigation(index)} className={buttonClasses}>
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500 fill-current" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flag className="w-3 h-3 text-orange-500 fill-current" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{currentQuestion.question}</CardTitle>
                    {currentQuestion.multipleCorrect && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>Multiple answers allowed:</strong> Select all correct options.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                    className={currentAnswer?.flagged ? "bg-orange-50 border-orange-200" : "bg-transparent"}
                  >
                    <Flag className={`w-4 h-4 ${currentAnswer?.flagged ? "text-orange-500 fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.multipleCorrect ? (
                    // Multiple choice checkboxes
                    currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`option-${index}`}
                          checked={currentAnswer?.selectedAnswers.includes(index) || false}
                          onCheckedChange={(checked) => handleMultipleChoice(currentQuestion.id, index, !!checked)}
                        />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </Label>
                      </div>
                    ))
                  ) : (
                    // Single choice radio buttons
                    <RadioGroup
                      value={currentAnswer?.selectedAnswers[0]?.toString() || ""}
                      onValueChange={(value) => handleSingleChoice(currentQuestion.id, Number.parseInt(value))}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-3">
                    {currentQuestionIndex === session.questions.length - 1 ? (
                      <Button onClick={() => setShowSubmitDialog(true)} size="lg">
                        Submit Evaluation
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} size="lg">
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your evaluation? You have answered {getAnsweredCount()} out of{" "}
              {session.questions.length} questions.
              {getFlaggedCount() > 0 && ` You have ${getFlaggedCount()} flagged questions.`}
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Evaluation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
