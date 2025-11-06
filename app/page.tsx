import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  // Otherwise, redirect to sign in page
  redirect('/auth/signin')
}
