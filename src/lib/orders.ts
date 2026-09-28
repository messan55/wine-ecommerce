export const CUSTOMER_VISIBLE_STATUSES = [
  "placed",
  "paid",
  "pending",
  "shipped",
] as const;

export const SHIPPABLE_STATUSES = ["placed", "paid"] as const;

export type AdminOrderTab = "expedier" | "expediees" | "toutes";

export function parseAdminOrderTab(
  value: string | string[] | undefined,
): AdminOrderTab {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === "expediees" || tab === "toutes") return tab;
  return "expedier";
}

export function adminOrderWhere(tab: AdminOrderTab) {
  if (tab === "expedier") return { status: { in: [...SHIPPABLE_STATUSES] } };
  if (tab === "expediees") return { status: "shipped" as const };
  return {};
}

export function canShipOrder(status: string) {
  return (SHIPPABLE_STATUSES as readonly string[]).includes(status);
}

export function orderStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Payée";
    case "placed":
      return "Placée";
    case "pending":
      return "En cours";
    case "shipped":
      return "Expédiée";
    case "canceled":
      return "Annulée";
    case "expired":
      return "Expirée";
    default:
      return status;
  }
}
