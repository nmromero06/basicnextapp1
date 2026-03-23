"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";

export interface Uom {
  id: number;
  name: string;
  description: string | null;
}

export async function getUoms(): Promise<Uom[]> {
  const result = await query<Uom>(
    "SELECT id, name, description FROM uom ORDER BY name"
  );
  return result.rows;
}

export async function createUom(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await query("INSERT INTO uom (name, description) VALUES ($1, $2)", [
    name,
    description || null,
  ]);

  revalidatePath("/dashboard/uom");
}

export async function updateUom(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !name) {
    return;
  }

  await query("UPDATE uom SET name = $2, description = $3 WHERE id = $1", [
    id,
    name,
    description || null,
  ]);

  revalidatePath("/dashboard/uom");
}

export async function deleteUom(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!id) {
    return;
  }

  await query("DELETE FROM uom WHERE id = $1", [id]);
  revalidatePath("/dashboard/uom");
}
