"use client";

import { useActionState } from "react";
import {
  requestResetAction,
  type ResetRequestState,
} from "@/app/compte/actions";
import { useAuthDrawer } from "@/components/auth-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const { openAuth } = useAuthDrawer();
  const [state, formAction, pending] = useActionState(
    requestResetAction,
    null as ResetRequestState,
  );

  if (state?.sent) {
    return (
      <p className="mt-8 max-w-sm text-sm leading-relaxed" role="status">
        Si un compte existe, un lien part à cette adresse. Regardez aussi
        Mailpit en local. Le lien tient une heure.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex max-w-sm flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien"}
      </Button>
      <p className="text-sm text-muted-foreground">
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => openAuth()}
        >
          Retour à la connexion
        </button>
      </p>
    </form>
  );
}
