"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface FilterSearchBarProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function FilterSearchBar({ value, onChange, disabled, placeholder = "Tim" }: FilterSearchBarProps) {
  const [term, setTerm] = useState<string>(value);
  const debouncedTerm = useDebounce(term, 300);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    const next = debouncedTerm;
    if (next === value) {
      return;
    }

    onChange(next);
  }, [debouncedTerm, onChange, value]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C1C1C]/60" />
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border-[#ECAA4D]/60 pl-10 text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 focus-visible:ring-[#ECAA4D]"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
