"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface FilterSearchBarProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function FilterSearchBar({ value, onChange, disabled, placeholder = "Tìm kiếm sản phẩm..." }: FilterSearchBarProps) {
  const [term, setTerm] = useState<string>(value);
  const debouncedTerm = useDebounce(term, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmittedValue = useRef<string>(value);

  // Sync with external value changes only when needed
  useEffect(() => {
    if (value !== lastEmittedValue.current && value !== term) {
      setTerm(value);
      lastEmittedValue.current = value;
    }
  }, [value]);

  // Emit debounced changes
  useEffect(() => {
    if (debouncedTerm !== lastEmittedValue.current) {
      onChange(debouncedTerm);
      lastEmittedValue.current = debouncedTerm;
    }
  }, [debouncedTerm, onChange]);

  const handleClear = useCallback(() => {
    setTerm("");
    onChange("");
    lastEmittedValue.current = "";
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="relative flex-1 z-20">
      <Search 
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C1C1C]/60" 
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border-[#ECAA4D]/60 pl-10 pr-10 text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 focus-visible:border-[#ECAA4D] focus-visible:ring-[#ECAA4D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        autoComplete="off"
        spellCheck={false}
        aria-label="Tìm kiếm sản phẩm"
        type="text"
      />
      {term && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-[#1C1C1C]/60 hover:text-[#1C1C1C] hover:bg-[#ECAA4D]/10 rounded-md transition-colors"
          aria-label="Xóa tìm kiếm"
          tabIndex={0}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
