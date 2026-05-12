import { getAuthUser, ROLE_HOME } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { ShieldCheck } from "lucide-react";

export default async function AdminLoginPage() {
  const user = await getAuthUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Barangay officials and municipal administrators
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <AdminLoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          This portal is for authorized personnel only.
        </p>
      </div>
    </main>
  );
}
