import { ThemedPage } from "../(themed)/themed-page-wrapper"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await auth()
  if (session?.user) {
    redirect("/")
  }
  return (
    <ThemedPage pageKey="login">
      <LoginForm error={searchParams?.error} />
    </ThemedPage>
  )
}
