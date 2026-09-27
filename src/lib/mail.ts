import nodemailer from "nodemailer";
import { formatAddress } from "@/lib/address";
import { formatEur } from "@/lib/catalog";

type MailOrder = {
  id: string;
  email: string | null;
  status: string;
  shippingCents: number;
  totalCents: number;
  shipName: string;
  shipLine1: string;
  shipLine2: string;
  shipPostal: string;
  shipCity: string;
  shipCountry: string;
  shipPhone: string;
  lines: { name: string; quantity: number; unitCents: number }[];
};

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim());
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "1025"),
    secure: process.env.SMTP_SECURE === "1",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function mailFrom() {
  return process.env.MAIL_FROM?.trim() || "Cave Solive <cave@localhost>";
}

export function contactInbox() {
  return (
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "cave@localhost"
  );
}

export async function sendOrderConfirmation(order: MailOrder) {
  const to = order.email?.trim();
  if (!to || !mailConfigured()) return false;

  const transporter = createTransport();

  const paid = order.status === "paid";
  const address = formatAddress(order);
  const subtotal = order.totalCents - order.shippingCents;
  const lines = order.lines
    .map(
      (line) =>
        `${line.quantity} × ${line.name} — ${formatEur(line.unitCents * line.quantity)}`,
    )
    .join("\n");
  const destination = address
    ? [address.name, ...address.lines, address.phone]
        .filter(Boolean)
        .join("\n")
    : "Adresse à confirmer";

  const subject = paid
    ? `Cave Solive — commande payée`
    : `Cave Solive — commande enregistrée`;
  const intro = paid
    ? "Le règlement est passé. Voici le détail."
    : "La cave a bien la commande. Voici le détail.";

  const text = [
    intro,
    "",
    `Référence ${order.id}`,
    "",
    "Livraison",
    destination,
    "",
    "Bouteilles",
    lines,
    "",
    `Sous-total TTC ${formatEur(subtotal)}`,
    `Livraison ${order.shippingCents === 0 ? "offerte" : formatEur(order.shippingCents)}`,
    `Total TTC ${formatEur(order.totalCents)}`,
    "",
    "Cave Solive — 14 rue des Archives, 75004 Paris",
  ].join("\n");

  await transporter.sendMail({
    from: mailFrom(),
    to,
    subject,
    text,
  });

  return true;
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  if (!mailConfigured()) return false;

  const transporter = createTransport();
  await transporter.sendMail({
    from: mailFrom(),
    to: contactInbox(),
    replyTo: `${input.name} <${input.email}>`,
    subject: `Cave Solive — message de ${input.name}`,
    text: [
      `${input.name} <${input.email}> écrit :`,
      "",
      input.message,
    ].join("\n"),
  });
  return true;
}
