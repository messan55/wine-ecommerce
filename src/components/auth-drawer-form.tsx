"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  loginAction,
  lookupEmailAction,
  registerAction,
  type AuthState,
  type EmailLookupState,
} from "@/app/compte/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "login" | "register";

export function AuthDrawerForm({
  next,
  emailDefault,
  onClose,
}: {
  next: string;
  emailDefault?: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(emailDefault ?? "");
  const [lookup, lookupAction, looking] = useActionState(
    lookupEmailAction,
    null as EmailLookupState,
  );
  const [loginState, login, loggingIn] = useActionState(
    loginAction,
    null as AuthState,
  );
  const [registerState, register, registering] = useActionState(
    registerAction,
    null as AuthState,
  );

  useEffect(() => {
    if (!lookup || lookup.error || !lookup.email || lookup.exists === undefined) {
      return;
    }
    setEmail(lookup.email);
    setStep(lookup.exists ? "login" : "register");
  }, [lookup]);

  const pending = looking || loggingIn || registering;
  const error =
    (step === "email" ? lookup?.error : null) ||
    (step === "login" ? loginState?.error : null) ||
    (step === "register" ? registerState?.error : null);

  if (step === "email") {
    return (
      <form action={lookupAction} className="mt-6 flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="auth-email">E-mail</Label>
          <Input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            defaultValue={email}
            className="h-10"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-11" disabled={pending}>
          {looking ? "Vérification…" : "Continuer"}
        </Button>
      </form>
    );
  }

  const action = step === "login" ? login : register;

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="email" value={email} />
      <div>
        <p className="text-sm">
          {step === "login"
            ? "Ce compte existe. Entrez le mot de passe."
            : "Aucun compte à cette adresse. Choisissez un mot de passe."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>
        <button
          type="button"
          className="mt-1 text-sm underline underline-offset-4"
          onClick={() => setStep("email")}
        >
          Changer d’e-mail
        </button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="auth-password">Mot de passe</Label>
        <Input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={step === "login" ? "current-password" : "new-password"}
          required
          minLength={step === "register" ? 8 : undefined}
          autoFocus
          className="h-10"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {step === "login"
          ? loggingIn
            ? "Connexion…"
            : "Se connecter"
          : registering
            ? "Création…"
            : "Créer le compte"}
      </Button>
      {step === "login" ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href="/compte/mot-de-passe-oublie"
            className="underline underline-offset-4"
            onClick={onClose}
          >
            Mot de passe oublié ?
          </Link>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Au moins huit caractères.
        </p>
      )}
    </form>
  );
}
