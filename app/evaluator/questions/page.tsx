"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import mockApi from "@/lib/mockApi"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function EvaluatorQuestions() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ subject: "Computer Science", category: "General", question: "", options: ["", ""], correctAnswers: [] as number[], multipleCorrect: false })

  useEffect(() => {
    const auth = localStorage.getItem("evaluatorAuth")
    if (!auth) {
      router.push("/login")
      return
    }
    setIsAuth(true)
    loadQuestions()
  }, [router])

  const loadQuestions = async () => {
    const q = await mockApi.getQuestions()
    if (q && q.length) setQuestions(q)
    else setQuestions([
      { id: '1', subject: 'Computer Science', category: 'Basics', question: 'What is 2 + 2?', options: ['3','4','5','6'], correctAnswers: [1], multipleCorrect: false, createdAt: new Date() }
    ])
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ subject: 'Computer Science', category: 'General', question: '', options: ['', ''], correctAnswers: [], multipleCorrect: false })
    setFormOpen(true)
  }

  const startEdit = (q: any) => {
    setEditing(q)
    setForm({ subject: q.subject, category: q.category, question: q.question, options: [...q.options], correctAnswers: q.correctAnswers || [], multipleCorrect: q.multipleCorrect || false })
    setFormOpen(true)
  }

  const saveQuestion = async () => {
    if (!form.question.trim()) return alert('Question text required')
    if (form.options.filter(o => o.trim()).length < 2) return alert('Provide at least 2 options')
    if (form.correctAnswers.length === 0) return alert('Select at least one correct answer')

    const payload = { ...form, id: editing?.id }
    const saved = await mockApi.upsertQuestion(payload)
    await loadQuestions()
    setFormOpen(false)
    setEditing(null)
    alert('Question saved (mock)')
  }

  const deleteQuestion = (id: string) => {
    const next = questions.filter((q) => q.id !== id)
    setQuestions(next)
    localStorage.setItem('questions', JSON.stringify(next))
    alert('Question removed (mock)')
  }

  if (!isAuth) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/evaluator/dashboard')}>Back</Button>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2"/> New Question</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <Card key={q.id} className="hover:shadow-md">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{q.question}</h3>
                    <p className="text-sm text-gray-500">{q.subject} • {q.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-gray-500">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(q)}><Edit className="w-4 h-4"/></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  {q.options?.map((o: string, idx: number) => (
                    <div key={idx} className={`p-2 rounded border ${q.correctAnswers?.includes(idx) ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                      <strong>{String.fromCharCode(65 + idx)}.</strong> {o}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {formOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium mb-4">{editing ? 'Edit Question' : 'New Question'}</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} />
                </div>
                <div>
                  <Label>Question</Label>
                  <Textarea value={form.question} onChange={(e) => setForm({...form, question: e.target.value})} />
                </div>
                <div>
                  <Label>Options</Label>
                  <div className="grid gap-2">
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input value={opt} onChange={(e) => setForm({...form, options: form.options.map((o,i)=> i===idx? e.target.value : o)})} />
                        <div className="flex items-center gap-2">
                          <Checkbox checked={form.correctAnswers.includes(idx)} onCheckedChange={(c) => {
                            const checked = !!c
                            if (checked) setForm({...form, correctAnswers: [...form.correctAnswers, idx]})
                            else setForm({...form, correctAnswers: form.correctAnswers.filter(i => i !== idx)})
                          }} />
                          <button className="text-sm text-red-600" onClick={() => setForm({...form, options: form.options.filter((_,i)=> i!==idx), correctAnswers: form.correctAnswers.filter(i=> i!==idx) })}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setForm({...form, options: [...form.options, '']})}>Add Option</Button>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }}>Cancel</Button>
                  <Button onClick={saveQuestion}>Save Question</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
