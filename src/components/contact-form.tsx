"use client";

import { useActionState } from "react";
import { contactAction, type ContactState } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    contactAction,
    null as ContactState,
  );

  if (state?.sent) {
    return (
      <p className="mt-8 max-w-lg text-sm leading-relaxed" role="status">
        C’est parti. On vous répond à l’adresse indiquée.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 grid max-w-lg gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" name="name" required className="h-10" autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="h-10"
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="h-11 w-fit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
