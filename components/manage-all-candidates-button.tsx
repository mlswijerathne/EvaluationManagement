"use client"

import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

type ManageAllCandidatesButtonProps = {
  isAdmin?: boolean
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null
  size?: "default" | "sm" | "lg" | "icon" | null
}

export default function ManageAllCandidatesButton({
  isAdmin = true,
  className = "",
  variant = "default",
  size = "default"
}: ManageAllCandidatesButtonProps) {
  const href = isAdmin ? "/admin/candidates" : "/evaluator/candidates"
  
  return (
    <Link href={href}>
      <Button 
        className={className} 
        variant={variant || "default"} 
        size={size || "default"}
      >
        <Users className="mr-2 h-4 w-4" />
        Manage All Candidates
      </Button>
    </Link>
  )
}
