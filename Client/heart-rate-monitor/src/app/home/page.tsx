import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const home = () => {
  return (
    <>
    <Link href="/dashboard">
        <Button>Go to Dashboard</Button>
    </Link>
    </>
  )
}

export default home