// Helper function to add evaluation results to candidates
export const updateCandidateEvaluationResults = () => {
  if (typeof window === "undefined") return;
  
  try {
    // Get candidates and evaluations
    const candidatesJson = localStorage.getItem('candidates');
    const evaluationsJson = localStorage.getItem('evaluations');
    
    if (!candidatesJson || !evaluationsJson) return;
    
    const candidates = JSON.parse(candidatesJson);
    const evaluations = JSON.parse(evaluationsJson);
    
    // Create evaluation results for each candidate
    for (const candidate of candidates) {
      // Initialize evaluation results array if it doesn't exist
      if (!candidate.evaluationResults) {
        candidate.evaluationResults = [];
      }
      
      // Find evaluations this candidate is assigned to
      for (const evaluation of evaluations) {
        if (evaluation.assignedCandidates && evaluation.assignedCandidates.includes(candidate.id)) {
          // Check if this evaluation is already in results
          const existingResult = candidate.evaluationResults.find(
            (result: { evaluationId: string }) => result.evaluationId === evaluation.id
          );
          
          if (!existingResult) {
            // Add a new result with random score if status is completed
            const status = Math.random() > 0.5 ? 'completed' : (Math.random() > 0.5 ? 'in_progress' : 'assigned');
            const score = status === 'completed' ? Math.floor(Math.random() * 100) : undefined;
            const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
            
            candidate.evaluationResults.push({
              evaluationId: evaluation.id,
              evaluationTitle: evaluation.title,
              status,
              score,
              completedAt,
              assignedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        }
      }
    }
    
    // Update the candidates in localStorage
    localStorage.setItem('candidates', JSON.stringify(candidates));
    
    return true;
  } catch (error) {
    console.error('Error updating candidate evaluation results:', error);
    return false;
  }
};
