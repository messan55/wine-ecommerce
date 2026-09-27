"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AGE_KEY = "cave-solive.majorite";
const AGE_EVENT = "cave-solive-majorite";

type AgeSnapshot = "server" | "ask" | "ok";

export function AgeGate() {
  const snapshot = useSyncExternalStore<AgeSnapshot>(
    subscribeAge,
    readAgeSnapshot,
    readAgeServerSnapshot,
  );
  const [refused, setRefused] = useState(false);

  if (snapshot === "ok") return null;

  if (snapshot === "server") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="font-serif text-3xl text-wine-deep">Cave Solive</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-wine-deep/80" aria-hidden="true" />
      <Dialog open onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <p className="text-xs tracking-[0.22em] text-gold uppercase">
              Cave Solive
            </p>
            <DialogTitle className="font-serif text-2xl leading-tight">
              {refused
                ? "Pas encore"
                : "Cette cave est réservée aux adultes"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground/80">
              {refused
                ? "La vente d’alcool est interdite aux mineurs. Nous ne pouvons pas vous laisser entrer."
                : "Confirmez que vous avez 18 ans ou plus. La vente d’alcool aux mineurs est interdite."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col">
            {refused ? (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => setRefused(false)}
              >
                J’ai fait une erreur
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => setRefused(true)}
                >
                  Je suis mineur
                </Button>
                <Button
                  type="button"
                  className="h-10"
                  onClick={() => {
                    window.localStorage.setItem(AGE_KEY, "oui");
                    window.dispatchEvent(new Event(AGE_EVENT));
                  }}
                >
                  J’ai 18 ans ou plus
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function subscribeAge(callback: () => void) {
  window.addEventListener(AGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readAgeSnapshot(): AgeSnapshot {
  return window.localStorage.getItem(AGE_KEY) === "oui" ? "ok" : "ask";
}

function readAgeServerSnapshot(): AgeSnapshot {
  return "server";
}
