"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { AuthDrawerForm } from "@/components/auth-drawer-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AuthDrawerOptions = {
  next?: string;
  email?: string;
};

type AuthDrawerContextValue = {
  open: boolean;
  next: string;
  email: string;
  openAuth: (options?: AuthDrawerOptions) => void;
  closeAuth: () => void;
};

const AuthDrawerContext = createContext<AuthDrawerContextValue | null>(null);

function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/compte";
  }
  return value;
}

export function AuthDrawerProvider({
  children,
  signedIn = false,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) {
  const pathname = usePathname();
  const skipClose = useRef(false);
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("/compte");
  const [email, setEmail] = useState("");

  const closeAuth = useCallback(() => {
    setOpen(false);
  }, []);

  const openAuth = useCallback((options?: AuthDrawerOptions) => {
    skipClose.current = true;
    setNext(safeNext(options?.next));
    setEmail(options?.email ?? "");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (skipClose.current) {
      skipClose.current = false;
      return;
    }
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (signedIn) setOpen(false);
  }, [signedIn]);

  const value = useMemo(
    () => ({ open, next, email, openAuth, closeAuth }),
    [open, next, email, openAuth, closeAuth],
  );

  return (
    <AuthDrawerContext.Provider value={value}>
      {children}
      <AuthDrawer />
    </AuthDrawerContext.Provider>
  );
}

export function useAuthDrawer() {
  const context = useContext(AuthDrawerContext);
  if (!context) {
    throw new Error("useAuthDrawer must be used within AuthDrawerProvider");
  }
  return context;
}

function AuthDrawer() {
  const { open, next, email, closeAuth } = useAuthDrawer();

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && closeAuth()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="px-6 pt-8 pb-2">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Compte
          </p>
          <SheetTitle className="font-serif text-3xl font-normal tracking-tight">
            Connexion
          </SheetTitle>
          <SheetDescription>
            Votre e-mail suffit pour commencer. S’il est déjà connu, on ouvre le
            compte ; sinon on en crée un.
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-8">
          <AuthDrawerForm
            key={`${open}-${next}-${email}`}
            next={next}
            emailDefault={email}
            onClose={closeAuth}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
