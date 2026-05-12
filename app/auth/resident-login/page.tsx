import { getAuthUser, ROLE_HOME } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResidentLoginForm } from "@/components/auth/resident-login-form";
import { User } from "lucide-react";

export default async function ResidentLoginPage() {
  const user = await getAuthUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Resident Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your registered phone number
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <ResidentLoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account? Visit your barangay hall to register.
        </p>
      </div>
    </main>
  );
}
