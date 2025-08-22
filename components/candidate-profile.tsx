"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type CandidateProfileProps = {
  candidate: any
  isOpen: boolean
  onClose: () => void
  onSendEmail?: (email: string, name?: string) => void
  onPromote?: (id: string, email?: string, name?: string) => void
  isAdmin?: boolean
}

export default function CandidateProfile({
  candidate,
  isOpen,
  onClose,
  onSendEmail,
  onPromote,
  isAdmin = false
}: CandidateProfileProps) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
          <DialogDescription>
            View detailed information about this candidate
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-user.jpg" alt={candidate.name} />
              <AvatarFallback>{candidate.name?.charAt(0) || candidate.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{candidate.name || "Unnamed Candidate"}</h2>
              <p className="text-sm text-gray-500">{candidate.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={
                  candidate.role === 'employee' ? 'bg-gray-100 text-gray-800' : 
                  candidate.role === 'candidate' ? 'bg-yellow-50 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'
                }>{candidate.role}</Badge>
                
                {candidate.evaluationStatus && (
                  <Badge variant="outline" className={
                    candidate.evaluationStatus === 'completed' ? 'border-green-500 text-green-700' :
                    candidate.evaluationStatus === 'in_progress' ? 'border-blue-500 text-blue-700' :
                    candidate.evaluationStatus === 'assigned' ? 'border-yellow-500 text-yellow-700' :
                    candidate.evaluationStatus === 'flagged' ? 'border-red-500 text-red-700' :
                    'border-gray-300'
                  }>
                    {candidate.evaluationStatus.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Registration Date</span>
                <p>{candidate.registeredAt ? new Date(candidate.registeredAt).toLocaleDateString() : "Not registered"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Activity</span>
                <p>{candidate.lastActivity ? new Date(candidate.lastActivity).toLocaleDateString() : "No activity"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Invited By</span>
                <p>{candidate.invitedBy || "N/A"}</p>
              </div>
              {candidate.attempts !== undefined && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Attempts</span>
                  <p>{candidate.attempts || 0}</p>
                </div>
              )}
              {candidate.averageScore !== undefined && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Average Score</span>
                  <p>{candidate.averageScore || 0}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {candidate.evaluationResults && candidate.evaluationResults.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Evaluation Results</h3>
                <div className="space-y-3">
                  {candidate.evaluationResults.map((result: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{result.evaluationTitle || "Unnamed Evaluation"}</span>
                        <Badge className={
                          result.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          result.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          result.status === 'not_started' ? 'bg-gray-100 text-gray-800' : ''
                        }>
                          {result.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {result.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-500">Score:</div>
                          <div className="font-medium">{result.score}%</div>
                        </div>
                      )}
                      {result.completedAt && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-sm text-gray-500">Completed:</div>
                          <div className="text-sm">{new Date(result.completedAt).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {onSendEmail && (
              <Button 
                variant="outline" 
                onClick={() => onSendEmail(candidate.email, candidate.name)}
              >
                Send Email
              </Button>
            )}
            {isAdmin && onPromote && candidate.role !== 'evaluator' && (
              <Button 
                onClick={() => {
                  onPromote(candidate.id, candidate.email, candidate.name)
                  onClose()
                }}
              >
                Promote to Evaluator
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
