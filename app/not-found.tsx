import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl overflow-hidden">
          {/* Top Accent */}

          <div className="px-8 py-10 text-center">
            {/* Icon */}
            {/* <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <SearchX className="h-10 w-10 text-primary" />
            </div> */}

            {/* 404 */}
            <p className="text-sm font-medium tracking-[0.25em] text-muted-foreground uppercase">
              Error 404
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Page Not Found
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The page you are trying to access does not exist or may have been
              moved to another location.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1 h-11 rounded-xl">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-muted-foreground mt-5">
          Barangay Management System
        </p>
      </div>
    </div>
  );
}
