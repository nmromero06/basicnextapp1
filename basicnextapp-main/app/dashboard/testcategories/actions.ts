"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";

export interface TestCategory {
  id: number;
  name: string;
  description: string | null;
}

export async function getTestCategories(): Promise<TestCategory[]> {
  const result = await query<TestCategory>(
    "SELECT id, name, description FROM testcategories ORDER BY name"
  );
  return result.rows;
}

export async function createTestCategory(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await query(
    "INSERT INTO testcategories (name, description) VALUES ($1, $2)",
    [name, description || null]
  );

  revalidatePath("/dashboard/testcategories");
}

export async function updateTestCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !name) {
    return;
  }

  await query(
    "UPDATE testcategories SET name = $2, description = $3 WHERE id = $1",
    [id, name, description || null]
  );

  revalidatePath("/dashboard/testcategories");
}

export async function deleteTestCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!id) {
    return;
  }

  await query("DELETE FROM testcategories WHERE id = $1", [id]);
  revalidatePath("/dashboard/testcategories");
}
