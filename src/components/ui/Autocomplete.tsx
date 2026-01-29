import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { ChevronDown, Check } from "lucide-react";

interface AutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOption: (value: string) => void;
  error?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  value,
  onChange,
  onSelectOption,
  error,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        onSelectOption(filteredOptions[highlightedIndex]);
        setIsOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block font-semibold text-gray-700 text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={clsx(
            "w-full rounded-xl border px-4 py-3 outline-none transition-all",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100",
            className,
          )}
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          {...props}
        />
        {isOpen && filteredOptions.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option, index) => (
              <li
                key={option}
                className={clsx(
                  "relative cursor-pointer select-none py-2 pl-3 pr-9",
                  index === highlightedIndex
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-900",
                )}
                onClick={() => {
                  onSelectOption(option);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="block truncate font-medium">{option}</span>
                {value === option && (
                  <span
                    className={clsx(
                      "absolute inset-y-0 right-0 flex items-center pr-4",
                      index === highlightedIndex
                        ? "text-gray-900"
                        : "text-gray-900",
                    )}
                  >
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <span className="mt-1 block text-sm font-medium text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};
