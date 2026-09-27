const BOTTLE_PREFIX = "/bottles/";

export function parseBottleImageSrc(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (
    !trimmed.startsWith(BOTTLE_PREFIX) ||
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes("//", 1)
  ) {
    return null;
  }
  return trimmed.slice(0, 180);
}

export function bottleImageAlt(name: string) {
  return `Bouteille ${name}`;
}
