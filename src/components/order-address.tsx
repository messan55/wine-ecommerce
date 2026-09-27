import { formatAddress } from "@/lib/address";

export function OrderAddress({
  order,
}: {
  order: {
    email: string | null;
    shipName: string;
    shipLine1: string;
    shipLine2: string;
    shipPostal: string;
    shipCity: string;
    shipCountry: string;
    shipPhone: string;
  };
}) {
  const address = formatAddress(order);
  if (!address) return null;

  return (
    <div className="mt-8 border-t border-border pt-4">
      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
        Livraison
      </p>
      <p className="mt-2 font-serif text-xl">{address.name}</p>
      {address.lines.map((line) => (
        <p key={line} className="text-sm leading-relaxed">
          {line}
        </p>
      ))}
      {address.phone ? (
        <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
      ) : null}
      {order.email ? (
        <p className="mt-1 text-sm text-muted-foreground">{order.email}</p>
      ) : null}
    </div>
  );
}
