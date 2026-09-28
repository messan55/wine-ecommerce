import {
  bookFromShipFields,
  resolveSavedAddress,
  type BookAddress,
  type SavedAddress,
  type ShippingAddress,
  type StoredAddress,
} from "@/lib/address";
import { prisma } from "@/lib/prisma";

const userAddressSelect = {
  shipName: true,
  shipLine1: true,
  shipLine2: true,
  shipPostal: true,
  shipCity: true,
  shipPhone: true,
} as const;

function fromRow(row: {
  id: string;
  name: string;
  line1: string;
  line2: string;
  postal: string;
  city: string;
  phone: string;
  isDefault: boolean;
}): StoredAddress {
  return {
    id: row.id,
    name: row.name,
    line1: row.line1,
    line2: row.line2,
    postal: row.postal,
    city: row.city,
    phone: row.phone,
    isDefault: row.isDefault,
  };
}

function shipData(address: ShippingAddress | BookAddress) {
  return {
    shipName: address.name,
    shipLine1: address.line1,
    shipLine2: address.line2,
    shipPostal: address.postal,
    shipCity: address.city,
    shipPhone: address.phone,
  };
}

async function syncUserBook(userId: string, address: ShippingAddress | BookAddress) {
  await prisma.user.update({
    where: { id: userId },
    data: shipData(address),
  });
}

export async function listUserAddresses(userId: string): Promise<StoredAddress[]> {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return rows.map(fromRow);
}

export async function getUserAddress(
  userId: string,
  addressId: string,
): Promise<StoredAddress | null> {
  const row = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  return row ? fromRow(row) : null;
}

export async function getBookAddress(
  userId: string,
): Promise<BookAddress | null> {
  const [preferred, user] = await Promise.all([
    prisma.address.findFirst({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: userAddressSelect,
    }),
  ]);
  if (preferred) return fromRow(preferred);
  return user ? bookFromShipFields(user) : null;
}

export async function getSavedAddress(
  userId: string,
): Promise<SavedAddress | null> {
  const [book, order] = await Promise.all([
    getBookAddress(userId),
    prisma.order.findFirst({
      where: { userId, shipLine1: { not: "" } },
      orderBy: { createdAt: "desc" },
      select: userAddressSelect,
    }),
  ]);

  return resolveSavedAddress(book, order ? bookFromShipFields(order) : null);
}

export async function saveUserAddress(
  userId: string,
  address: ShippingAddress | BookAddress,
) {
  const existing = await prisma.address.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (existing) {
    await prisma.address.update({
      where: { id: existing.id },
      data: {
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        postal: address.postal,
        city: address.city,
        phone: address.phone,
        isDefault: true,
      },
    });
  } else {
    await prisma.address.create({
      data: {
        userId,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        postal: address.postal,
        city: address.city,
        phone: address.phone,
        isDefault: true,
      },
    });
  }

  await syncUserBook(userId, address);
}

export async function createUserAddress(
  userId: string,
  address: ShippingAddress | BookAddress,
) {
  const count = await prisma.address.count({ where: { userId } });
  const created = await prisma.address.create({
    data: {
      userId,
      name: address.name,
      line1: address.line1,
      line2: address.line2,
      postal: address.postal,
      city: address.city,
      phone: address.phone,
      isDefault: count === 0,
    },
  });
  if (count === 0) await syncUserBook(userId, address);
  return created.id;
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  address: ShippingAddress | BookAddress,
) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true, isDefault: true },
  });
  if (!existing) return false;

  await prisma.address.update({
    where: { id: existing.id },
    data: {
      name: address.name,
      line1: address.line1,
      line2: address.line2,
      postal: address.postal,
      city: address.city,
      phone: address.phone,
    },
  });
  if (existing.isDefault) await syncUserBook(userId, address);
  return true;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return false;

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, NOT: { id: existing.id } },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: existing.id },
      data: { isDefault: true },
    }),
  ]);
  await syncUserBook(userId, fromRow(existing));
  return true;
}

export async function deleteUserAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return false;

  await prisma.address.delete({ where: { id: existing.id } });

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
      await syncUserBook(userId, fromRow({ ...next, isDefault: true }));
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          shipName: "",
          shipLine1: "",
          shipLine2: "",
          shipPostal: "",
          shipCity: "",
          shipPhone: "",
        },
      });
    }
  }

  return true;
}

export async function clearUserAddress(userId: string) {
  const preferred = await prisma.address.findFirst({
    where: { userId, isDefault: true },
    select: { id: true },
  });
  if (preferred) {
    await deleteUserAddress(userId, preferred.id);
    return;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      shipName: "",
      shipLine1: "",
      shipLine2: "",
      shipPostal: "",
      shipCity: "",
      shipPhone: "",
    },
  });
}
