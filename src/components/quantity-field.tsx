"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuantityField({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const set = (next: number) => {
    onChange(Math.min(max, Math.max(1, next)));
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Diminuer la quantité, ${label}`}
        disabled={value <= 1}
        onClick={() => set(value - 1)}
      >
        −
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        aria-label={label}
        className="h-8 w-14 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (Number.isNaN(parsed)) return;
          set(parsed);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Augmenter la quantité, ${label}`}
        disabled={value >= max}
        onClick={() => set(value + 1)}
      >
        +
      </Button>
    </div>
  );
}
