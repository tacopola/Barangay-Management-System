import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ROLE_HOME } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Look up role and redirect accordingly
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.authId, data.user.id))
        .limit(1)

      if (dbUser) {
        const home = ROLE_HOME[dbUser.role as keyof typeof ROLE_HOME]
        return NextResponse.redirect(`${origin}${home}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/resident-login?error=auth_callback_failed`)
}