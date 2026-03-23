"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";

export interface LookupItem {
  id: number;
  name: string;
}

export interface MedicalTestRow {
  id: number;
  name: string;
  description: string | null;
  iduom: number;
  idcategory: number;
  uomname: string;
  categoryname: string;
  normalmin: number | null;
  normalmax: number | null;
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) {
    return null;
  }

  const raw = String(value).trim();
  if (raw === "") {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getMedicalTests(): Promise<MedicalTestRow[]> {
  const result = await query<MedicalTestRow>(
    `SELECT mt.id, mt.name, mt.description, mt.iduom, mt.idcategory, mt.normalmin, mt.normalmax,
            u.name AS uomname,
            tc.name AS categoryname
     FROM medicaltests mt
     JOIN uom u ON mt.iduom = u.id
     JOIN testcategories tc ON mt.idcategory = tc.id
     ORDER BY mt.name`
  );
  return result.rows;
}

export async function getUomLookup(): Promise<LookupItem[]> {
  const result = await query<LookupItem>("SELECT id, name FROM uom ORDER BY name");
  return result.rows;
}

export async function getCategoryLookup(): Promise<LookupItem[]> {
  const result = await query<LookupItem>(
    "SELECT id, name FROM testcategories ORDER BY name"
  );
  return result.rows;
}

export async function createMedicalTest(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const iduom = Number(formData.get("iduom"));
  const idcategory = Number(formData.get("idcategory"));
  const normalmin = toNullableNumber(formData.get("normalmin"));
  const normalmax = toNullableNumber(formData.get("normalmax"));

  if (!name || !iduom || !idcategory) {
    return;
  }

  await query(
    `INSERT INTO medicaltests (name, description, iduom, idcategory, normalmin, normalmax)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [name, description || null, iduom, idcategory, normalmin, normalmax]
  );

  revalidatePath("/dashboard/medicaltests");
}

export async function updateMedicalTest(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const iduom = Number(formData.get("iduom"));
  const idcategory = Number(formData.get("idcategory"));
  const normalmin = toNullableNumber(formData.get("normalmin"));
  const normalmax = toNullableNumber(formData.get("normalmax"));

  if (!id || !name || !iduom || !idcategory) {
    return;
  }

  await query(
    `UPDATE medicaltests
        SET name = $2,
            description = $3,
            iduom = $4,
            idcategory = $5,
            normalmin = $6,
            normalmax = $7
      WHERE id = $1`,
    [id, name, description || null, iduom, idcategory, normalmin, normalmax]
  );

  revalidatePath("/dashboard/medicaltests");
}

export async function deleteMedicalTest(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!id) {
    return;
  }

  await query("DELETE FROM medicaltests WHERE id = $1", [id]);
  revalidatePath("/dashboard/medicaltests");
}
