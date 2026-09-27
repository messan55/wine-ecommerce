"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";

export function ClearPaidCart() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [clear, ready]);

  return null;
}
