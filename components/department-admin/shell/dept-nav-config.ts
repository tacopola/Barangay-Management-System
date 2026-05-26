export type NavItem = {
  label: string;
  href: string;
  iconName: string;
};

export type DeptConfig = {
  label: string;
  description: string;
  accentColor: string;
  accentText: string;
  accentBorder: string;
  navItems: NavItem[];
};

export const DEPT_CONFIG: Record<string, DeptConfig> = {
  treasury: {
    label: "Treasury",
    description: "Collections & Financial Operations",
    accentColor: "bg-amber-500",
    accentText: "text-amber-600",
    accentBorder: "border-amber-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/treasury",
        iconName: "LayoutDashboard",
      },
      {
        label: "Collections",
        href: "/department-admin/treasury/collections",
        iconName: "Receipt",
      },
      {
        label: "Official Receipts",
        href: "/department-admin/treasury/receipts",
        iconName: "FileText",
      },
      {
        label: "Fee Schedule",
        href: "/department-admin/treasury/fees",
        iconName: "ClipboardList",
      },
      {
        label: "Reports",
        href: "/department-admin/treasury/reports",
        iconName: "BarChart3",
      },
    ],
  },
  mayor_office: {
    label: "Mayor's Office",
    description: "Executive Operations",
    accentColor: "bg-blue-600",
    accentText: "text-blue-600",
    accentBorder: "border-blue-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/mayor_office",
        iconName: "LayoutDashboard",
      },
      {
        label: "Documents",
        href: "/department-admin/mayor_office/documents",
        iconName: "FolderOpen",
      },
      {
        label: "Correspondence",
        href: "/department-admin/mayor_office/correspondence",
        iconName: "Mail",
      },
      {
        label: "Appointments",
        href: "/department-admin/mayor_office/appointments",
        iconName: "Calendar",
      },
      {
        label: "Announcements",
        href: "/department-admin/mayor_office/announcements",
        iconName: "Megaphone",
      },
    ],
  },
  health: {
    label: "Health",
    description: "Health Services",
    accentColor: "bg-emerald-500",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/health",
        iconName: "LayoutDashboard",
      },
      {
        label: "Patients",
        href: "/department-admin/health/patients",
        iconName: "Users",
      },
      {
        label: "Records",
        href: "/department-admin/health/records",
        iconName: "FileText",
      },
      {
        label: "Reports",
        href: "/department-admin/health/reports",
        iconName: "BarChart3",
      },
    ],
  },
  civil_registry: {
    label: "Civil Registry",
    description: "Vital Records & Documents",
    accentColor: "bg-violet-600",
    accentText: "text-violet-600",
    accentBorder: "border-violet-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/civil_registry",
        iconName: "LayoutDashboard",
      },
      {
        label: "Registrations",
        href: "/department-admin/civil_registry/registrations",
        iconName: "FileText",
      },
      {
        label: "Records",
        href: "/department-admin/civil_registry/records",
        iconName: "FolderOpen",
      },
      {
        label: "Reports",
        href: "/department-admin/civil_registry/reports",
        iconName: "BarChart3",
      },
    ],
  },
  engineering: {
    label: "Engineering",
    description: "Permits & Infrastructure",
    accentColor: "bg-orange-500",
    accentText: "text-orange-600",
    accentBorder: "border-orange-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/engineering",
        iconName: "LayoutDashboard",
      },
      {
        label: "Permits",
        href: "/department-admin/engineering/permits",
        iconName: "FileText",
      },
      {
        label: "Projects",
        href: "/department-admin/engineering/projects",
        iconName: "ClipboardList",
      },
      {
        label: "Reports",
        href: "/department-admin/engineering/reports",
        iconName: "BarChart3",
      },
    ],
  },
  social_welfare: {
    label: "Social Welfare",
    description: "Welfare & Beneficiary Services",
    accentColor: "bg-pink-500",
    accentText: "text-pink-600",
    accentBorder: "border-pink-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/social_welfare",
        iconName: "LayoutDashboard",
      },
      {
        label: "Beneficiaries",
        href: "/department-admin/social_welfare/beneficiaries",
        iconName: "Users",
      },
      {
        label: "Programs",
        href: "/department-admin/social_welfare/programs",
        iconName: "ClipboardList",
      },
      {
        label: "Reports",
        href: "/department-admin/social_welfare/reports",
        iconName: "BarChart3",
      },
    ],
  },
  budget: {
    label: "Budget",
    description: "Budget Planning & Allocation",
    accentColor: "bg-cyan-600",
    accentText: "text-cyan-600",
    accentBorder: "border-cyan-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/budget",
        iconName: "LayoutDashboard",
      },
      {
        label: "Allocations",
        href: "/department-admin/budget/allocations",
        iconName: "BarChart3",
      },
      {
        label: "Reports",
        href: "/department-admin/budget/reports",
        iconName: "FileText",
      },
    ],
  },
  accounting: {
    label: "Accounting",
    description: "Accounts & Financial Records",
    accentColor: "bg-teal-600",
    accentText: "text-teal-600",
    accentBorder: "border-teal-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/accounting",
        iconName: "LayoutDashboard",
      },
      {
        label: "Vouchers",
        href: "/department-admin/accounting/vouchers",
        iconName: "FileText",
      },
      {
        label: "Ledger",
        href: "/department-admin/accounting/ledger",
        iconName: "ClipboardList",
      },
      {
        label: "Reports",
        href: "/department-admin/accounting/reports",
        iconName: "BarChart3",
      },
    ],
  },
  assessor: {
    label: "Assessor",
    description: "Property Assessment",
    accentColor: "bg-lime-600",
    accentText: "text-lime-700",
    accentBorder: "border-lime-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/assessor",
        iconName: "LayoutDashboard",
      },
      {
        label: "Properties",
        href: "/department-admin/assessor/properties",
        iconName: "FolderOpen",
      },
      {
        label: "Assessments",
        href: "/department-admin/assessor/assessments",
        iconName: "ClipboardList",
      },
      {
        label: "Reports",
        href: "/department-admin/assessor/reports",
        iconName: "BarChart3",
      },
    ],
  },
  hr: {
    label: "Human Resources",
    description: "Personnel & HR Operations",
    accentColor: "bg-indigo-500",
    accentText: "text-indigo-600",
    accentBorder: "border-indigo-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/hr",
        iconName: "LayoutDashboard",
      },
      {
        label: "Personnel",
        href: "/department-admin/hr/personnel",
        iconName: "Users",
      },
      {
        label: "Leaves",
        href: "/department-admin/hr/leaves",
        iconName: "Calendar",
      },
      {
        label: "Reports",
        href: "/department-admin/hr/reports",
        iconName: "BarChart3",
      },
    ],
  },
  planning: {
    label: "Planning",
    description: "Development & Land Use Planning",
    accentColor: "bg-rose-500",
    accentText: "text-rose-600",
    accentBorder: "border-rose-500",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/planning",
        iconName: "LayoutDashboard",
      },
      {
        label: "Projects",
        href: "/department-admin/planning/projects",
        iconName: "ClipboardList",
      },
      {
        label: "Documents",
        href: "/department-admin/planning/documents",
        iconName: "FolderOpen",
      },
      {
        label: "Reports",
        href: "/department-admin/planning/reports",
        iconName: "BarChart3",
      },
    ],
  },
  vice_mayor_office: {
    label: "Vice Mayor's Office",
    description: "Legislative Operations",
    accentColor: "bg-sky-600",
    accentText: "text-sky-600",
    accentBorder: "border-sky-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/vice_mayor_office",
        iconName: "LayoutDashboard",
      },
      {
        label: "Documents",
        href: "/department-admin/vice_mayor_office/documents",
        iconName: "FolderOpen",
      },
      {
        label: "Correspondence",
        href: "/department-admin/vice_mayor_office/correspondence",
        iconName: "Mail",
      },
      {
        label: "Announcements",
        href: "/department-admin/vice_mayor_office/announcements",
        iconName: "Megaphone",
      },
    ],
  },
  sb_office: {
    label: "SB Office",
    description: "Sangguniang Bayan Operations",
    accentColor: "bg-fuchsia-600",
    accentText: "text-fuchsia-600",
    accentBorder: "border-fuchsia-600",
    navItems: [
      {
        label: "Dashboard",
        href: "/department-admin/sb_office",
        iconName: "LayoutDashboard",
      },
      {
        label: "Resolutions",
        href: "/department-admin/sb_office/resolutions",
        iconName: "FileText",
      },
      {
        label: "Ordinances",
        href: "/department-admin/sb_office/ordinances",
        iconName: "ClipboardList",
      },
      {
        label: "Sessions",
        href: "/department-admin/sb_office/sessions",
        iconName: "Calendar",
      },
    ],
  },
};
