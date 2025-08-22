"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import CandidateProfile from "./candidate-profile"

type CandidateMgrProps = {
  candidates: any[]
  onSendEmail?: (email: string, name?: string) => void
  onPromote?: (id: string, email?: string, name?: string) => void
  isAdmin?: boolean
  onCandidateClick?: (candidate: any) => void
  refreshCandidates?: () => void
}

export default function CandidateManager({
  candidates,
  onSendEmail,
  onPromote,
  isAdmin = false,
  onCandidateClick,
  refreshCandidates
}: CandidateMgrProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  
  // Add a listener for the custom event that signals viewing a candidate from an evaluation
  useEffect(() => {
    const handleViewCandidate = (e: any) => {
      const candidate = e.detail;
      if (candidate) {
        setSelectedCandidate(candidate);
        setIsProfileOpen(true);
      }
    };
    
    window.addEventListener('viewCandidate', handleViewCandidate as EventListener);
    
    return () => {
      window.removeEventListener('viewCandidate', handleViewCandidate as EventListener);
    };
  }, []);
  
  useEffect(() => {
    let filtered = [...candidates]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        c => (c.name && c.name.toLowerCase().includes(term)) || 
             (c.email && c.email.toLowerCase().includes(term))
      )
    }
    
    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter(c => c.role === filterRole)
    }
    
    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter(c => c.evaluationStatus === filterStatus)
    }
    
    setFilteredCandidates(filtered)
  }, [candidates, searchTerm, filterRole, filterStatus])
  
  const handleViewProfile = (candidate: any) => {
    setSelectedCandidate(candidate)
    setIsProfileOpen(true)
    if (onCandidateClick) onCandidateClick(candidate)
  }
  
  const handleCloseProfile = () => {
    setIsProfileOpen(false)
    if (refreshCandidates) refreshCandidates()
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filterRole || ""}
              onChange={(e) => setFilterRole(e.target.value || null)}
            >
              <option value="">All Roles</option>
              <option value="candidate">Candidate</option>
              <option value="employee">Employee</option>
              <option value="evaluator">Evaluator</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="not_assigned">Not Assigned</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50">
            <p className="text-gray-500">No candidates found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-medium">{candidate.name || "Unnamed Candidate"}</h3>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                  <div className="flex items-center mt-1 gap-2">
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewProfile(candidate)}
                  >
                    View Profile
                  </Button>
                  {onSendEmail && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSendEmail(candidate.email, candidate.name)}
                    >
                      Send Email
                    </Button>
                  )}
                  {isAdmin && onPromote && candidate.role !== 'evaluator' && (
                    <Button 
                      size="sm" 
                      onClick={() => onPromote(candidate.id, candidate.email, candidate.name)}
                    >
                      Promote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Candidate Profile Dialog */}
      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
          onSendEmail={onSendEmail}
          onPromote={onPromote}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}
