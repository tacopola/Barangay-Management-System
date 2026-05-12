import { getAuthUser, ROLE_HOME } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const user = await getAuthUser()
  if (user) redirect(ROLE_HOME[user.role])
  redirect("/auth/resident-login")
}