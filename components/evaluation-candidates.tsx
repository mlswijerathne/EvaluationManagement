"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import CandidateProfile from "./candidate-profile"

type EvaluationCandidatesProps = {
  evaluationId: string
  evaluationTitle: string
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function EvaluationCandidates({
  evaluationId,
  evaluationTitle,
  isOpen,
  onClose,
  isAdmin = false
}: EvaluationCandidatesProps) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  // We removed the state for candidate profile dialog to avoid UI overlap issues

  // Load all candidates assigned to this evaluation
  useEffect(() => {
    if (isOpen) {
      loadCandidates()
    }
  }, [isOpen, evaluationId])

  // Apply search filtering
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredCandidates(
        candidates.filter(
          c => (c.name && c.name.toLowerCase().includes(term)) || 
              (c.email && c.email.toLowerCase().includes(term))
        )
      )
    } else {
      setFilteredCandidates([...candidates])
    }
  }, [candidates, searchTerm])

  const loadCandidates = () => {
    // In a real app, fetch candidates by evaluationId
    // For the prototype, we'll filter the candidates from localStorage
    try {
      const allCandidates = JSON.parse(localStorage.getItem("candidates") || "[]")
      const evaluations = JSON.parse(localStorage.getItem("evaluations") || "[]")
      
      // Find the current evaluation
      const currentEvaluation = evaluations.find((e: any) => e.id === evaluationId)
      
      if (currentEvaluation && currentEvaluation.assignedCandidates) {
        // Filter candidates by those assigned to this evaluation
        const assignedCandidates = allCandidates.filter((c: any) => 
          currentEvaluation.assignedCandidates.includes(c.id)
        )
        
        setCandidates(assignedCandidates)
        setFilteredCandidates(assignedCandidates)
      } else {
        setCandidates([])
        setFilteredCandidates([])
      }
    } catch (e) {
      console.error("Error loading assigned candidates:", e)
      setCandidates([])
      setFilteredCandidates([])
    }
  }

  const handleViewProfile = (candidate: any) => {
    // Store the candidate data in localStorage for retrieval on the candidate page
    if (typeof window !== "undefined") {
      localStorage.setItem("viewingCandidate", JSON.stringify(candidate));
      
      // Close the dialog before navigating
      onClose();
      
      // Navigate to the candidate details page
      if (isAdmin) {
        window.location.href = `/admin/candidates?candidateId=${candidate.id}`;
      } else {
        window.location.href = `/evaluator/candidates?candidateId=${candidate.id}`;
      }
    }
  }

  // Email functionality has been moved to the candidate page to avoid dialog overlap issues

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidates for {evaluationTitle}</DialogTitle>
            <DialogDescription>
              View and manage candidates assigned to this evaluation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Candidates List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No candidates found for this evaluation.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder-user.jpg" alt={candidate.name} />
                              <AvatarFallback>{candidate.name?.charAt(0) || candidate.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{candidate.name || "Unnamed Candidate"}</div>
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {candidate.evaluationStatus && (
                              <Badge className={
                                candidate.evaluationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                candidate.evaluationStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                candidate.evaluationStatus === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                candidate.evaluationStatus === 'flagged' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {candidate.evaluationStatus.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleViewProfile(candidate)}>
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* We've removed the nested CandidateProfile component to avoid UI overlap */}
    </>
  )
}
