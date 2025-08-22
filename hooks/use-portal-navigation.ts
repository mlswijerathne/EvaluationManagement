"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

// This custom hook can be used to ensure all navigation stays within the correct portal
export function usePortalNavigation(portalType: 'admin' | 'evaluator') {
  const router = useRouter()
  const pathname = usePathname()
  
  // Ensure we're in the correct portal
  const navigate = (path: string) => {
    // If path starts with a slash, treat as absolute path within the portal
    if (path.startsWith('/')) {
      const fullPath = path.startsWith(`/${portalType}`) ? path : `/${portalType}${path}`
      router.push(fullPath)
    } else {
      // Relative path, just navigate
      router.push(path)
    }
  }
  
  // Check if we're in the correct portal
  const isInCorrectPortal = pathname.includes(`/${portalType}`)
  
  return {
    navigate,
    isInCorrectPortal,
    portalRoot: `/${portalType}`
  }
}
