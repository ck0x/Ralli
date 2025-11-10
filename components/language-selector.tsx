"use client";

import type React from "react";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/lib/translations";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languageOptions = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { value: 'zh', label: 'Chinese', nativeLabel: '中文' },
] as const;

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-slate-700">
        <Languages className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium hidden sm:inline">Language:</span>
      </div>
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[140px] h-10 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.nativeLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
