import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getAuthUser, ROLE_HOME } from "@/lib/auth";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default async function AdminLoginPage() {
  const user = await getAuthUser();

  if (user) {
    redirect(ROLE_HOME[user.role]);
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Hero Section */}
      <section className="relative hidden lg:block">
        <Image
          src="/bangui-featured.jpg"
          fill
          alt="Municipality of Bangui"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur px-3 py-2 border border-white/20">
              <p className="text-xs tracking-[0.25em] uppercase text-white/80">
                Municipality of Bangui
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <div>
              <h1 className="text-5xl font-bold leading-tight">
                Barangay Management System
              </h1>

              <p className="mt-4 text-base text-white/80 leading-relaxed">
                Centralized platform for barangay operations, resident records,
                document requests, and municipal administration.
              </p>
            </div>

            <div className="flex gap-6 text-sm text-white/70">
              <span>Secure Access</span>
              <span>Resident Services</span>
              <span>Administrative Tools</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Section */}
      <section className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Admin Portal
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Sign in using your authorized administrator account.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-xl">
            <AdminLoginForm />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Authorized personnel only. All login attempts are monitored.
          </p>
        </div>
      </section>
    </main>
  );
}
