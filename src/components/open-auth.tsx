"use client";

import { useEffect } from "react";
import { useAuthDrawer } from "@/components/auth-drawer";
import { Button } from "@/components/ui/button";

export function OpenAuthOnMount({
  next,
  email,
}: {
  next?: string;
  email?: string;
}) {
  const { openAuth } = useAuthDrawer();

  useEffect(() => {
    openAuth({ next, email });
  }, [openAuth, next, email]);

  return null;
}

export function OpenAuthButton({
  next,
  email,
  children,
  className,
  variant = "default",
}: {
  next?: string;
  email?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const { openAuth } = useAuthDrawer();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => openAuth({ next, email })}
    >
      {children}
    </Button>
  );
}
