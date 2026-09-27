"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { COLORS, PRICE_BANDS, REGIONS } from "@/lib/catalog";

type FilterState = {
  region: string;
  couleur: string;
  prix: string;
};

export function CatalogFilters(filters: FilterState) {
  const activeCount = [filters.region, filters.couleur, filters.prix].filter(
    Boolean,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 w-full">
              Filtrer{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-serif text-xl">
                Filtrer la cave
              </SheetTitle>
              <SheetDescription>
                Région, couleur, ou une fourchette de prix.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <FilterFields idPrefix="mobile" filters={filters} />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className="h-10">Voir les bouteilles</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        <FilterFields idPrefix="desktop" filters={filters} />
      </div>
    </div>
  );
}

function FilterFields({
  idPrefix,
  filters,
}: {
  idPrefix: string;
  filters: FilterState;
}) {
  const router = useRouter();
  const active = Boolean(filters.region || filters.couleur || filters.prix);

  function update(key: keyof FilterState, value: string) {
    const next = {
      ...filters,
      [key]: value === "tous" ? "" : value,
    };
    const params = new URLSearchParams();
    if (next.region) params.set("region", next.region);
    if (next.couleur) params.set("couleur", next.couleur);
    if (next.prix) params.set("prix", next.prix);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/", { scroll: false });
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-region`}>Région</Label>
        <Select
          value={filters.region || "tous"}
          onValueChange={(value) => update("region", value)}
        >
          <SelectTrigger id={`${idPrefix}-region`} className="h-10 w-full">
            <SelectValue placeholder="Toutes les régions" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="tous">Toutes les régions</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-couleur`}>Couleur</Label>
        <Select
          value={filters.couleur || "tous"}
          onValueChange={(value) => update("couleur", value)}
        >
          <SelectTrigger id={`${idPrefix}-couleur`} className="h-10 w-full">
            <SelectValue placeholder="Toutes les couleurs" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="tous">Toutes les couleurs</SelectItem>
            {COLORS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-prix`}>Prix</Label>
        <Select
          value={filters.prix || "tous"}
          onValueChange={(value) => update("prix", value)}
        >
          <SelectTrigger id={`${idPrefix}-prix`} className="h-10 w-full">
            <SelectValue placeholder="Tous les prix" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="tous">Tous les prix</SelectItem>
            {PRICE_BANDS.map((band) => (
              <SelectItem key={band.id} value={band.id}>
                {band.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-10 justify-self-start"
        disabled={!active}
        onClick={() => router.push("/", { scroll: false })}
      >
        Effacer
      </Button>
    </div>
  );
}
