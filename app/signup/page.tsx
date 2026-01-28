import { ThemedPage } from "../(themed)/themed-page-wrapper"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <ThemedPage pageKey="signup">
      <SignupForm />
    </ThemedPage>
  )
}
