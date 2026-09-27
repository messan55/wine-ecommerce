"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/compte/actions";

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  next,
  emailDefault,
  switchHref,
  switchLabel,
  register = false,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  pendingLabel: string;
  next: string;
  emailDefault?: string;
  switchHref: string;
  switchLabel: string;
  register?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-8 flex max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={emailDefault}
          className="h-10"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={8}
          className="h-10"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
      <p className="text-sm text-muted-foreground">
        <Link href={switchHref} className="underline underline-offset-4">
          {switchLabel}
        </Link>
      </p>
    </form>
  );
}
