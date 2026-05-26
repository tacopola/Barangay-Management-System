import { ReactNode } from "react";
import { DeptSidebar } from "./dept-sidebar";
import { DEPT_CONFIG } from "./dept-nav-config";
import { requireDepartmentAdmin } from "@/lib/auth-helper";

type DeptShellProps = {
  children: ReactNode;
  deptType: string;
};

export async function DeptShell({ children, deptType }: DeptShellProps) {
  const { admin } = await requireDepartmentAdmin();
  const config = DEPT_CONFIG[deptType];

  if (!config)
    throw new Error(`No config found for department type: ${deptType}`);

  const serializedNav = config.navItems.map((item) => ({
    label: item.label,
    href: item.href,
    iconName: item.iconName,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DeptSidebar
        deptLabel={config.label}
        deptDescription={config.description}
        accentColor={config.accentColor}
        accentText={config.accentText}
        navItems={serializedNav}
        adminName={`${admin.firstName} ${admin.lastName}`}
      />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
