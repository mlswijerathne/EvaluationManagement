export const templates = {
  evaluatorInvite: ({ evaluatorEmail, company, invitedBy }: { evaluatorEmail: string; company: string; invitedBy: string }) => ({
    subject: `You're invited to join ${company} as an Evaluator`,
    body: `Hello,

You have been invited to join ${company} as an Evaluator by ${invitedBy}.

Sign in with your invitation link (mock): https://example.com/invite/${encodeURIComponent(evaluatorEmail)}

Best regards,
${company} Team`,
  }),

  assignment: ({ candidateName, evaluationTitle }: { candidateName: string; evaluationTitle: string }) => ({
    subject: `You have been assigned to ${evaluationTitle}`,
    body: `Hello ${candidateName},\n\nYou have been assigned to the evaluation: ${evaluationTitle}.\nPlease visit your dashboard to start the test.\n\nBest regards,\nTraining Team`,
  }),
  candidateInvite: ({ candidateEmail, company, invitedBy }: { candidateEmail: string; company: string; invitedBy: string }) => ({
    subject: `You're invited to join ${company} as a Candidate`,
    body: `Hello,\n\nYou have been invited to join ${company} as a Candidate/Employee by ${invitedBy}.\n\nAccept the invite and set up your account (mock): https://example.com/register?email=${encodeURIComponent(candidateEmail)}\n\nBest regards,\n${company} Team`,
  }),

  promotion: ({ candidateName, candidateEmail, company, promotedBy }: { candidateName: string; candidateEmail: string; company: string; promotedBy: string }) => ({
    subject: `Your role has been upgraded to Evaluator at ${company}`,
    body: `Hello ${candidateName || ''},\n\nYour account (${candidateEmail}) has been upgraded to an Evaluator by ${promotedBy}.\nYou now have access to question authoring and evaluation management features.\n\nIf you did not request or expect this, contact your administrator.\n\nBest regards,\n${company} Team`,
  }),
}

export const sendMockEmail = async (to: string, subject: string, body: string) => {
  console.log('--- Mock Email ---')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('Body:', body)
  console.log('------------------')
  return { ok: true }
}

export default { templates, sendMockEmail }
