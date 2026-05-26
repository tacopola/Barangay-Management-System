export const PROGRAM_TYPES = [
  { value: "livelihood", label: "Livelihood" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "senior_citizen", label: "Senior Citizen" },
  { value: "pwd", label: "PWD" },
  { value: "youth", label: "Youth" },
  { value: "womens_welfare", label: "Women's Welfare" },
  { value: "disaster_relief", label: "Disaster Relief" },
  { value: "nutrition", label: "Nutrition" },
  { value: "other", label: "Other" },
] as const

export type ProgramType = (typeof PROGRAM_TYPES)[number]["value"]

export const PROGRAM_TYPE_COLORS: Record<string, string> = {
  livelihood: "bg-amber-100 text-amber-700 border-amber-200",
  health: "bg-rose-100 text-rose-700 border-rose-200",
  education: "bg-blue-100 text-blue-700 border-blue-200",
  senior_citizen: "bg-purple-100 text-purple-700 border-purple-200",
  pwd: "bg-teal-100 text-teal-700 border-teal-200",
  youth: "bg-green-100 text-green-700 border-green-200",
  womens_welfare: "bg-pink-100 text-pink-700 border-pink-200",
  disaster_relief: "bg-orange-100 text-orange-700 border-orange-200",
  nutrition: "bg-lime-100 text-lime-700 border-lime-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
}