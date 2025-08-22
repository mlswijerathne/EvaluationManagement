"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { ComponentProps } from "react"

interface PortalLinkProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  portalType: 'admin' | 'evaluator'
  path: string
  children: React.ReactNode
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null
}

export default function PortalLink({ 
  portalType, 
  path, 
  children, 
  variant = "outline",
  ...props 
}: PortalLinkProps) {
  const fullPath = `/${portalType}${path.startsWith('/') ? path : `/${path}`}`
  
  return (
    <Link href={fullPath} prefetch={false}>
      <Button 
        variant={variant || "outline"}
        {...props}
      >
        {children}
      </Button>
    </Link>
  )
}
