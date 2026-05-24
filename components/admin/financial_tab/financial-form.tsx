"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  createFinancialRecordAction,
  updateFinancialRecordAction,
} from "@/actions/admin/financial";
import { toast } from "sonner";

type FinancialRecord = {
  id: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
  referenceNumber: string | null;
  transactionDate: string;
  fiscalYear: number;
  quarter: number | null;
};

export function FinancialForm({
  record,
  currentYear,
  incomeCategories,
  expenseCategories,
  onSuccess,
}: {
  record?: FinancialRecord | null;
  currentYear: number;
  incomeCategories: string[];
  expenseCategories: string[];
  onSuccess?: () => void;
}) {
  const action = record
    ? updateFinancialRecordAction.bind(null, record.id)
    : createFinancialRecordAction;

  const [state, formAction, isPending] = useActionState(action, {});
  const [type, setType] = useState(record?.type ?? "");
  const [category, setCategory] = useState(record?.category ?? "");
  const [quarter, setQuarter] = useState(
    record?.quarter ? String(record.quarter) : "",
  );

  // Reset category when type changes
  useEffect(() => {
    if (!record) setCategory("");
  }, [type]);

  useEffect(() => {
    if (state.success) {
      toast.success(record ? "Record updated." : "Record added.");
      onSuccess?.();
    }
  }, [state.success]);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  return (
    <form action={formAction} className="overflow-y-auto max-h-[70vh]">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all ${
              type === "income"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-border hover:bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="text-base">↑</span> Income
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all ${
              type === "expense"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-border hover:bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="text-base">↓</span> Expense
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
        {state.fieldErrors?.type && (
          <p className="text-xs text-destructive">{state.fieldErrors.type}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs font-medium mt-2">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          name="category"
          value={category}
          onValueChange={setCategory}
          disabled={!type}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue
              placeholder={type ? "Select category..." : "Select type first..."}
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="text-sm">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.category && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.category}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-xs font-medium">
          Amount (₱) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ₱
          </span>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={record?.amount ?? ""}
            className="h-9 text-sm pl-7"
          />
        </div>
        {state.fieldErrors?.amount && (
          <p className="text-xs text-destructive">{state.fieldErrors.amount}</p>
        )}
      </div>

      {/* Date + Quarter */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="transactionDate" className="text-xs font-medium">
            Transaction Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="transactionDate"
            name="transactionDate"
            type="date"
            defaultValue={record?.transactionDate ?? ""}
            className="h-9 text-sm"
          />
          {state.fieldErrors?.transactionDate && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.transactionDate}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium mt-2">Quarter</Label>
          <Select name="quarter" value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-sm">
                None
              </SelectItem>
              <SelectItem value="1" className="text-sm">
                Q1 (Jan-Mar)
              </SelectItem>
              <SelectItem value="2" className="text-sm">
                Q2 (Apr-Jun)
              </SelectItem>
              <SelectItem value="3" className="text-sm">
                Q3 (Jul-Sep)
              </SelectItem>
              <SelectItem value="4" className="text-sm">
                Q4 (Oct-Dec)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fiscal year */}
      <div className="space-y-2">
        <Label htmlFor="fiscalYear" className="text-xs mt-2 font-medium">
          Fiscal Year <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fiscalYear"
          name="fiscalYear"
          type="number"
          defaultValue={record?.fiscalYear ?? currentYear}
          className="h-9 text-sm"
        />
        {state.fieldErrors?.fiscalYear && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.fiscalYear}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs mt-2 font-bold uppercase tracking-widest text-muted-foreground">
          Additional Info
        </p>
        <Separator className="mt-1.5 mb-3" />
      </div>

      {/* Reference number */}
      <div className="space-y-2">
        <Label htmlFor="referenceNumber" className="text-xs font-medium">
          Reference / OR Number
          <span className="text-muted-foreground ml-1">(optional)</span>
        </Label>
        <Input
          id="referenceNumber"
          name="referenceNumber"
          placeholder="e.g. OR-2025-001"
          defaultValue={record?.referenceNumber ?? ""}
          className="h-9 text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs mt-2 font-medium">
          Description
          <span className="text-muted-foreground ml-1">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Additional notes or details..."
          defaultValue={record?.description ?? ""}
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full my-4"
        disabled={isPending || !type || !category}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : record ? (
          "Save Changes"
        ) : (
          "Add Record"
        )}
      </Button>
    </form>
  );
}
