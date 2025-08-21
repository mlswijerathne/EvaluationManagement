// Lightweight mock API backed by localStorage for prototyping
export const mockApi = {
  registerCompany: async (companyName: string, adminEmail: string) => {
    localStorage.setItem("companyName", companyName)
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Company registered: ${companyName} by ${adminEmail} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
    return { ok: true }
  },

  // Register company and create initial admin account with email verification flow (mock)
  registerCompanyAdmin: async (companyName: string, adminEmail: string, passwordHash?: string) => {
    const existing = localStorage.getItem("companyName")
    if (existing && existing.toLowerCase() === companyName.toLowerCase()) {
      return { ok: false, reason: "company_exists" }
    }

    // save company
    localStorage.setItem("companyName", companyName)

    // ensure admins list
    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    if (admins.find((a: any) => a.email === adminEmail)) {
      return { ok: false, reason: "admin_exists" }
    }

    const adminRecord = { email: adminEmail, passwordHash: passwordHash || null, verified: false, createdAt: new Date().toISOString() }
    admins.push(adminRecord)
    localStorage.setItem("admins", JSON.stringify(admins))

    // create verification token and 'send' email (store sentEmails for dev)
    const token = Math.random().toString(36).slice(2, 10)
    const pending = JSON.parse(localStorage.getItem("pendingVerifications") || "{}")
    pending[token] = { email: adminEmail, company: companyName, createdAt: new Date().toISOString() }
    localStorage.setItem("pendingVerifications", JSON.stringify(pending))

    const sent = JSON.parse(localStorage.getItem("sentEmails") || "[]")
    sent.push({ to: adminEmail, subject: "Verify your admin account", body: `Click to verify: /admin/verify?token=${token}`, token, sentAt: new Date().toISOString() })
    localStorage.setItem("sentEmails", JSON.stringify(sent))

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Admin registered: ${adminEmail} for ${companyName} (verification sent) on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true, token }
  },

  verifyAdmin: async (token: string) => {
    const pending = JSON.parse(localStorage.getItem("pendingVerifications") || "{}")
    if (!pending[token]) return { ok: false, reason: "invalid_token" }
    const { email } = pending[token]
    delete pending[token]
    localStorage.setItem("pendingVerifications", JSON.stringify(pending))

    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    const found = admins.find((a: any) => a.email === email)
    if (found) {
      found.verified = true
      found.verifiedAt = new Date().toISOString()
      localStorage.setItem("admins", JSON.stringify(admins))
    }

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Admin verified: ${email} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true }
  },

  inviteEvaluator: async (email: string, invitedBy: string) => {
    // create an invite token and send an invite link (mock)
    const token = Math.random().toString(36).slice(2, 10)
    const invites = JSON.parse(localStorage.getItem("evaluatorInvites") || "[]")
    if (invites.find((i: any) => i.email === email && !i.accepted)) {
      return { ok: false, reason: "already_invited" }
    }
    invites.push({ email, token, invitedBy, invitedAt: new Date().toISOString(), accepted: false })
    localStorage.setItem("evaluatorInvites", JSON.stringify(invites))

    const sent = JSON.parse(localStorage.getItem("sentEmails") || "[]")
    sent.push({ to: email, subject: "You are invited to join as Evaluator", body: `Accept invite: /evaluator/accept?token=${token}`, token, sentAt: new Date().toISOString() })
    localStorage.setItem("sentEmails", JSON.stringify(sent))

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Evaluator invited: ${email} by ${invitedBy} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true, inviteLink: `/evaluator/accept?token=${token}` }
  },

  acceptEvaluatorInvite: async (token: string, name: string, passwordHash?: string) => {
    const invites = JSON.parse(localStorage.getItem("evaluatorInvites") || "[]")
    const idx = invites.findIndex((i: any) => i.token === token)
    if (idx < 0) return { ok: false, reason: "invalid_token" }
    if (invites[idx].accepted) return { ok: false, reason: "already_accepted" }
    invites[idx].accepted = true
    invites[idx].acceptedAt = new Date().toISOString()
    localStorage.setItem("evaluatorInvites", JSON.stringify(invites))

    // create evaluator account
    const evaluators = JSON.parse(localStorage.getItem("evaluators") || "[]")
    evaluators.push({ email: invites[idx].email, name, passwordHash: passwordHash || null, role: "evaluator", registeredAt: new Date().toISOString() })
    localStorage.setItem("evaluators", JSON.stringify(evaluators))

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Evaluator accepted invite: ${invites[idx].email} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true }
  },

  getAuditLogs: async () => {
    return JSON.parse(localStorage.getItem("auditLogs") || "[]")
  },

  // Search audit logs with simple substring/time filters (mock)
  searchAuditLogs: async (opts: { q?: string; since?: string; until?: string } = {}) => {
    const logs: string[] = JSON.parse(localStorage.getItem("auditLogs") || "[]")
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
      evaluations: JSON.parse(localStorage.getItem("evaluations") || "[]"),
      questions: JSON.parse(localStorage.getItem("questions") || "[]"),
      candidates: JSON.parse(localStorage.getItem("candidates") || "[]"),
      evaluators: JSON.parse(localStorage.getItem("evaluators") || "[]"),
      auditLogs: JSON.parse(localStorage.getItem("auditLogs") || "[]"),
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
    keys.forEach((k) => (snapshot[k] = localStorage.getItem(k)))
    // record deletion snapshot (for audit trail) into a special key
    const deletions = JSON.parse(localStorage.getItem("deletionSnapshots") || "[]")
    deletions.unshift({ by: deletedBy, when: new Date().toISOString(), snapshot })
    localStorage.setItem("deletionSnapshots", JSON.stringify(deletions))

    keys.forEach((k) => localStorage.removeItem(k))

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Company deleted by ${deletedBy} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))

    return { ok: true }
  },

  promoteCandidate: async (candidateId: string) => {
    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
    const updated = candidates.map((c: any) => (c.id === candidateId ? { ...c, role: "employee" } : c))
    localStorage.setItem("candidates", JSON.stringify(updated))
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Candidate promoted: ${candidateId} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
    return { ok: true }
  },

  cloneEvaluation: async (evaluation: any) => {
    const evaluations = JSON.parse(localStorage.getItem("evaluations") || "[]")
    const cloned = { ...evaluation, id: Date.now().toString(), title: evaluation.title + " (cloned)", createdAt: new Date() }
    evaluations.push(cloned)
    localStorage.setItem("evaluations", JSON.stringify(evaluations))
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Evaluation cloned: ${evaluation.title} → ${cloned.title} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
    return cloned
  },
  // Invite candidate (evaluators can invite candidates/employees)
  inviteCandidate: async (candidate: { name: string; email: string }, invitedBy: string) => {
    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
    const id = Date.now().toString()
    const record = { id, name: candidate.name, email: candidate.email, role: "candidate", invitedBy, invitedAt: new Date().toISOString() }
    candidates.push(record)
    localStorage.setItem("candidates", JSON.stringify(candidates))
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Candidate invited: ${candidate.email} by ${invitedBy} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
    return record
  },

  // Register candidate (simulates accepting invite)
  registerCandidate: async (email: string, name: string, passwordHash: string) => {
    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]")
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
    localStorage.setItem("candidates", JSON.stringify(candidates))
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Candidate registered: ${email} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
    return { ok: true }
  },

  assignEvaluation: async (evaluationId: string, targetGroup: string, assignedBy: string) => {
    const assignments = JSON.parse(localStorage.getItem("assignments") || "[]")
    const record = { id: Date.now().toString(), evaluationId, targetGroup, assignedBy, assignedAt: new Date().toISOString() }
    assignments.push(record)
    localStorage.setItem("assignments", JSON.stringify(assignments))
    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    logs.unshift(`Evaluation ${evaluationId} assigned to ${targetGroup} by ${assignedBy} on ${new Date().toLocaleString()}`)
    localStorage.setItem("auditLogs", JSON.stringify(logs))
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
    const csv = [headerKeys.join(",")].concat(rows.map((r) => headerKeys.map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`).join(","))).join("\n")
    return { filename, csv }
  },
  // Return attempt history for a candidate (mock). Attempts are stored under `candidateAttempts` key.
  getCandidateAttempts: async (email: string) => {
    const store = JSON.parse(localStorage.getItem("candidateAttempts") || "{}")
    if (store[email]) return store[email]

    // generate sample attempts if none exist
    const sample = [
      { id: `a-${Date.now()}-1`, evaluationId: "ev-1", score: 78, passed: true, takenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), duration: 55 },
      { id: `a-${Date.now()}-2`, evaluationId: "ev-2", score: 65, passed: false, takenAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), duration: 22 },
    ]
    store[email] = sample
    localStorage.setItem("candidateAttempts", JSON.stringify(store))
    return sample
  },
  // Questions management helpers
  getQuestions: async () => {
    return JSON.parse(localStorage.getItem("questions") || "[]")
  },

  upsertQuestion: async (question: any) => {
    const questions = JSON.parse(localStorage.getItem("questions") || "[]")
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
    localStorage.setItem("questions", JSON.stringify(questions))
    return question
  },
}

export default mockApi
