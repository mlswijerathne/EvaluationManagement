// Lightweight mock API backed by localStorage for prototyping
import { templates, sendMockEmail } from "./notifications"

// Safe storage wrapper to allow importing this module during SSR without blowing up
const safeStorage = {
  getItem: (k: string) => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(k)
    } catch (e) {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(k, v)
    } catch (e) {
      // noop
    }
  },
  removeItem: (k: string) => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(k)
    } catch (e) {
      // noop
    }
  },
}

export const mockApi = {
  registerCompany: async (companyName: string, adminEmail: string) => {
    safeStorage.setItem("companyName", companyName)
    const logs = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Company registered: ${companyName} by ${adminEmail} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs))
    return { ok: true }
  },

  // Register company and create initial admin account with email verification flow (mock)
  registerCompanyAdmin: async (companyName: string, adminEmail: string, passwordHash?: string) => {
    const existing = safeStorage.getItem("companyName")
    if (existing && existing.toLowerCase() === companyName.toLowerCase()) {
      return { ok: false, reason: "company_exists" }
    }

    // save company
    safeStorage.setItem("companyName", companyName)

    // ensure admins list
    const admins = JSON.parse(safeStorage.getItem("admins") || "[]")
    if (admins.find((a: any) => a.email === adminEmail)) {
      return { ok: false, reason: "admin_exists" }
    }

    const adminRecord = { email: adminEmail, passwordHash: passwordHash || null, verified: false, createdAt: new Date().toISOString() }
    admins.push(adminRecord)
    safeStorage.setItem("admins", JSON.stringify(admins))

    // create verification token and 'send' email (store sentEmails for dev)
    const token = Math.random().toString(36).slice(2, 10)
    const pending = JSON.parse(safeStorage.getItem("pendingVerifications") || "{}")
    pending[token] = { email: adminEmail, company: companyName, createdAt: new Date().toISOString() }
    safeStorage.setItem("pendingVerifications", JSON.stringify(pending))

    const sent = JSON.parse(safeStorage.getItem("sentEmails") || "[]")
    sent.push({ to: adminEmail, subject: "Verify your admin account", body: `Click to verify: /admin/verify?token=${token}`, token, sentAt: new Date().toISOString() })
    safeStorage.setItem("sentEmails", JSON.stringify(sent))

    const logs = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Admin registered: ${adminEmail} for ${companyName} (verification sent) on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true, token }
  },

  verifyAdmin: async (token: string) => {
    const pending = JSON.parse(safeStorage.getItem("pendingVerifications") || "{}")
    if (!pending[token]) return { ok: false, reason: "invalid_token" }
    const { email } = pending[token]
    delete pending[token]
    safeStorage.setItem("pendingVerifications", JSON.stringify(pending))

    const admins = JSON.parse(safeStorage.getItem("admins") || "[]")
    const found = admins.find((a: any) => a.email === email)
    if (found) {
      found.verified = true
      found.verifiedAt = new Date().toISOString()
      safeStorage.setItem("admins", JSON.stringify(admins))
    }

    const logs = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Admin verified: ${email} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true }
  },

  inviteEvaluator: async (email: string, invitedBy: string) => {
    // create an invite token and send an invite link (mock)
    const token = Math.random().toString(36).slice(2, 10)
    const invites = JSON.parse(safeStorage.getItem("evaluatorInvites") || "[]")
    if (invites.find((i: any) => i.email === email && !i.accepted)) {
      return { ok: false, reason: "already_invited" }
    }
    invites.push({ email, token, invitedBy, invitedAt: new Date().toISOString(), accepted: false })
    safeStorage.setItem("evaluatorInvites", JSON.stringify(invites))

    const sent = JSON.parse(safeStorage.getItem("sentEmails") || "[]")
    const body = `Accept invite: /evaluator/accept?token=${token}`
    sent.push({ to: email, subject: "You are invited to join as Evaluator", body, token, sentAt: new Date().toISOString() })
    safeStorage.setItem("sentEmails", JSON.stringify(sent))

    // send mock email using templates if available
    try {
      const company = safeStorage.getItem("companyName") || "Your Company"
      const tpl = templates?.evaluatorInvite?.({ evaluatorEmail: email, company, invitedBy })
      if (tpl) await sendMockEmail(email, tpl.subject, tpl.body)
    } catch (e) {
      // ignore in mock
    }

    const logs2 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs2.unshift(`Evaluator invited: ${email} by ${invitedBy} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs2))

    return { ok: true, inviteLink: `/evaluator/accept?token=${token}` }
  },

  acceptEvaluatorInvite: async (token: string, name: string, passwordHash?: string) => {
    const invites = JSON.parse(safeStorage.getItem("evaluatorInvites") || "[]")
    const idx = invites.findIndex((i: any) => i.token === token)
    if (idx < 0) return { ok: false, reason: "invalid_token" }
    if (invites[idx].accepted) return { ok: false, reason: "already_accepted" }
    invites[idx].accepted = true
    invites[idx].acceptedAt = new Date().toISOString()
    safeStorage.setItem("evaluatorInvites", JSON.stringify(invites))

    // create evaluator account
    const evaluators = JSON.parse(safeStorage.getItem("evaluators") || "[]")
    evaluators.push({ email: invites[idx].email, name, passwordHash: passwordHash || null, role: "evaluator", registeredAt: new Date().toISOString() })
    safeStorage.setItem("evaluators", JSON.stringify(evaluators))

    const logs3 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs3.unshift(`Evaluator accepted invite: ${invites[idx].email} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs3))

    return { ok: true }
  },

  getAuditLogs: async () => {
    return JSON.parse(safeStorage.getItem("auditLogs") || "[]")
  },

  // Search audit logs with simple substring/time filters (mock)
  searchAuditLogs: async (opts: { q?: string; since?: string; until?: string } = {}) => {
    const logs: string[] = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    let results = logs
    if (opts.q) {
      const q = opts.q.toLowerCase()
      results = results.filter((l) => l.toLowerCase().includes(q))
    }
    // since/until are ISO-ish strings; we attempt to parse timestamps inside logs if present
    if (opts.since || opts.until) {
      results = results.filter((l) => {
        const match = l.match(/on (.*)$/)
        if (!match) return true
        const t = new Date(match[1])
        if (opts.since && new Date(opts.since) > t) return false
        if (opts.until && new Date(opts.until) < t) return false
        return true
      })
    }
    return results
  },

  exportData: async () => {
    return {
      evaluations: JSON.parse(safeStorage.getItem("evaluations") || "[]"),
      questions: JSON.parse(safeStorage.getItem("questions") || "[]"),
      candidates: JSON.parse(safeStorage.getItem("candidates") || "[]"),
      evaluators: JSON.parse(safeStorage.getItem("evaluators") || "[]"),
      auditLogs: JSON.parse(safeStorage.getItem("auditLogs") || "[]"),
    }
  },

  exportAllAsJsonBlob: async () => {
    const data = await mockApi.exportData()
    return { filename: `export_${new Date().toISOString().split("T")[0]}.json`, json: JSON.stringify(data, null, 2) }
  },

  // Delete company and all related data (mock) with audit
  deleteCompany: async (deletedBy: string) => {
    const keys = ["evaluations", "questions", "candidates", "evaluators", "companyName", "auditLogs", "admins", "evaluatorInvites", "pendingVerifications", "sentEmails", "assignments"]
    const snapshot: any = {}
    keys.forEach((k) => (snapshot[k] = safeStorage.getItem(k)))
    // record deletion snapshot (for audit trail) into a special key
    const deletions = JSON.parse(safeStorage.getItem("deletionSnapshots") || "[]")
    deletions.unshift({ by: deletedBy, when: new Date().toISOString(), snapshot })
    safeStorage.setItem("deletionSnapshots", JSON.stringify(deletions))

    keys.forEach((k) => safeStorage.removeItem(k))

    const logs4 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs4.unshift(`Company deleted by ${deletedBy} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs4))

    return { ok: true }
  },

  promoteCandidate: async (candidateId: string) => {
    // promote by id; optionally convert to evaluator role and notify
    const candidates = JSON.parse(safeStorage.getItem("candidates") || "[]")
    let promotedCandidate: any = null
    const updated = candidates.map((c: any) => {
      if (c.id === candidateId) {
        promotedCandidate = { ...c, role: "evaluator", promotedAt: new Date().toISOString() }
        return promotedCandidate
      }
      return c
    })
    safeStorage.setItem("candidates", JSON.stringify(updated))

    // also add to evaluators list for visibility
    if (promotedCandidate) {
      const evaluators = JSON.parse(safeStorage.getItem("evaluators") || "[]")
      if (!evaluators.find((e: any) => (e.email || e) === promotedCandidate.email)) {
        evaluators.push(promotedCandidate.email)
        safeStorage.setItem("evaluators", JSON.stringify(evaluators))
      }

      const logs5 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
      logs5.unshift(`Candidate promoted to Evaluator: ${promotedCandidate.email || candidateId} on ${new Date().toLocaleString()}`)
      safeStorage.setItem("auditLogs", JSON.stringify(logs5))

      // send promotion notification if possible
      try {
        const company = safeStorage.getItem("companyName") || "Your Company"
        const tpl = templates?.promotion?.({ candidateName: promotedCandidate.name, candidateEmail: promotedCandidate.email, company, promotedBy: "Admin" })
        if (tpl && promotedCandidate.email) await sendMockEmail(promotedCandidate.email, tpl.subject, tpl.body)
      } catch (e) {
        // ignore
      }
    }

    return { ok: true }
  },

  cloneEvaluation: async (evaluation: any) => {
    const evaluations = JSON.parse(safeStorage.getItem("evaluations") || "[]")
    const cloned = { ...evaluation, id: Date.now().toString(), title: evaluation.title + " (cloned)", createdAt: new Date() }
    evaluations.push(cloned)
    safeStorage.setItem("evaluations", JSON.stringify(evaluations))
    const logs6 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs6.unshift(`Evaluation cloned: ${evaluation.title} → ${cloned.title} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs6))
    return cloned
  },
  // Invite candidate (evaluators can invite candidates/employees)
  inviteCandidate: async (candidate: { name: string; email: string }, invitedBy: string) => {
    const candidates = JSON.parse(safeStorage.getItem("candidates") || "[]")
    const id = Date.now().toString()
    // evaluationStatus: not_assigned | assigned | in_progress | completed | flagged
    const record = { id, name: candidate.name, email: candidate.email, role: "candidate", evaluationStatus: "not_assigned", invitedBy, invitedAt: new Date().toISOString() }
    candidates.push(record)
    safeStorage.setItem("candidates", JSON.stringify(candidates))
    const logs7 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs7.unshift(`Candidate invited: ${candidate.email} by ${invitedBy} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs7))
    return record
  },

  // Update a candidate's evaluation status (admin/evaluator action)
  updateCandidateEvaluationStatus: async (candidateId: string, status: string, changedBy: string) => {
    const allowed = ["not_assigned", "assigned", "in_progress", "completed", "flagged"]
    if (!allowed.includes(status)) return { ok: false, reason: "invalid_status" }
    const candidates = JSON.parse(safeStorage.getItem("candidates") || "[]")
    const idx = candidates.findIndex((c: any) => c.id === candidateId)
    if (idx < 0) return { ok: false, reason: "not_found" }
    candidates[idx].evaluationStatus = status
    candidates[idx].evaluationStatusChangedAt = new Date().toISOString()
    safeStorage.setItem("candidates", JSON.stringify(candidates))
    const logs8 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs8.unshift(`Candidate ${candidates[idx].email || candidateId} evaluation status updated to ${status} by ${changedBy} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs8))
    return { ok: true }
  },

  // Register candidate (simulates accepting invite)
  registerCandidate: async (email: string, name: string, passwordHash: string) => {
    const candidates = JSON.parse(safeStorage.getItem("candidates") || "[]")
    const found = candidates.find((c: any) => c.email === email)
    if (found) {
      found.registered = true
      found.name = name
      found.passwordHash = passwordHash
      found.registeredAt = new Date().toISOString()
    } else {
      const id = Date.now().toString()
      candidates.push({ id, name, email, role: "candidate", registered: true, passwordHash, registeredAt: new Date().toISOString() })
    }
    safeStorage.setItem("candidates", JSON.stringify(candidates))
    const logs9 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs9.unshift(`Candidate registered: ${email} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs9))
    return { ok: true }
  },

  assignEvaluation: async (evaluationId: string, targetGroup: string, assignedBy: string) => {
    const assignments = JSON.parse(safeStorage.getItem("assignments") || "[]")
    const record = { id: Date.now().toString(), evaluationId, targetGroup, assignedBy, assignedAt: new Date().toISOString() }
    assignments.push(record)
    safeStorage.setItem("assignments", JSON.stringify(assignments))
    const logs10 = JSON.parse(safeStorage.getItem("auditLogs") || "[]")
    logs10.unshift(`Evaluation ${evaluationId} assigned to ${targetGroup} by ${assignedBy} on ${new Date().toLocaleString()}`)
    safeStorage.setItem("auditLogs", JSON.stringify(logs10))
    return record
  },

  getAnalytics: async () => {
    // Simple sample analytics
    return {
      passRate: 0.7,
      averageScore: 82,
      distribution: { pass: 70, fail: 30 },
    }
  },

  exportCsv: async (rows: any[], filename = "export.csv") => {
    const headerKeys = Object.keys(rows[0] || {})
    const csv = [headerKeys.join(",")].concat(rows.map((r) => headerKeys.map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""') }"`).join(","))).join("\n")
    return { filename, csv }
  },
  // Return attempt history for a candidate (mock). Attempts are stored under `candidateAttempts` key.
  getCandidateAttempts: async (email: string) => {
    const store = JSON.parse(safeStorage.getItem("candidateAttempts") || "{}")
    if (store[email]) return store[email]

    // generate sample attempts if none exist
    const sample = [
      { id: `a-${Date.now()}-1`, evaluationId: "ev-1", score: 78, passed: true, takenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), duration: 55 },
      { id: `a-${Date.now()}-2`, evaluationId: "ev-2", score: 65, passed: false, takenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), duration: 22 },
    ]
    store[email] = sample
    safeStorage.setItem("candidateAttempts", JSON.stringify(store))
    return sample
  },
  // Questions management helpers
  getQuestions: async () => {
    return JSON.parse(safeStorage.getItem("questions") || "[]")
  },

  upsertQuestion: async (question: any) => {
    const questions = JSON.parse(safeStorage.getItem("questions") || "[]")
    if (question.id) {
      const idx = questions.findIndex((q: any) => q.id === question.id)
      if (idx >= 0) {
        questions[idx] = { ...questions[idx], ...question }
      } else {
        questions.push({ ...question, id: question.id })
      }
    } else {
      question.id = Date.now().toString()
      questions.push(question)
    }
    safeStorage.setItem("questions", JSON.stringify(questions))
    return question
  },
}

export default mockApi
