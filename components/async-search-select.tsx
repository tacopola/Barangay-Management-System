"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AsyncSearchSelectProps<T> = {
  name: string;
  defaultValue?: T | null;
  searchAction: (query: string) => Promise<T[]>;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  fieldError?: string;
  helperText?: string;
  debounceMs?: number;
  onSelect?: (item: T | null) => void;
};

export function AsyncSearchSelect<T>({
  name,
  defaultValue = null,
  searchAction,
  getItemId,
  getItemLabel,
  renderItem,
  renderSelected,
  placeholder = "Search...",
  emptyMessage = "No results found",
  fieldError,
  helperText,
  debounceMs = 300,
  onSelect,
}: AsyncSearchSelectProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(defaultValue);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, startSearch] = useTransition();
  const hiddenRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync hidden input
  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = selected ? getItemId(selected) : "";
    }
  }, [selected, getItemId]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setHasSearched(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      startSearch(async () => {
        const data = await searchAction(value);

        setResults(data);
        setHasSearched(true);
        setIsOpen(true);
      });
    }, debounceMs);
  }

  function handleSelect(item: T) {
    setSelected(item);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect?.(item);
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect?.(null);
  }

  return (
    <div className="space-y-1.5">
      <input type="hidden" name={name} ref={hiddenRef} />

      {selected ? (
        <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/40">
          <div className="flex-1 min-w-0">
            {renderSelected ? (
              renderSelected(selected)
            ) : (
              <p className="text-sm font-medium truncate">
                {getItemLabel(selected)}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-9"
            autoComplete="off"
          />

          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {isOpen && results.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-52 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={getItemId(item)}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm",
                    "hover:bg-accent transition-colors",
                  )}
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <span>{getItemLabel(item)}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!isSearching &&
            hasSearched &&
            query.trim() &&
            results.length === 0 && (
              <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
        </div>
      )}

      {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}

      {helperText && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
