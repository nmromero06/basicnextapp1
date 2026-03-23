import {
  createUom,
  deleteUom,
  getUoms,
  updateUom,
} from "./actions";

export default async function UomPage() {
  const uoms = await getUoms();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Units of Measure Management</h1>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Add UOM</h2>
        <form action={createUom} className="grid gap-3 md:grid-cols-3">
          <input
            name="name"
            required
            maxLength={15}
            placeholder="UOM name (e.g. mg/dL)"
            className="rounded border px-3 py-2"
          />
          <input
            name="description"
            placeholder="Description"
            className="rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Add
          </button>
        </form>
      </section>

      <section className="overflow-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {uoms.map((uom) => (
              <tr key={uom.id}>
                <td colSpan={2} className="px-4 py-3">
                  <form action={updateUom} className="grid gap-2 md:grid-cols-2">
                    <input type="hidden" name="id" value={uom.id} />
                    <input
                      name="name"
                      defaultValue={uom.name}
                      required
                      maxLength={15}
                      className="w-full rounded border px-3 py-2"
                    />
                    <input
                      name="description"
                      defaultValue={uom.description ?? ""}
                      className="w-full rounded border px-3 py-2"
                    />
                    <button
                      type="submit"
                      className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 md:col-span-2"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteUom}>
                    <input type="hidden" name="id" value={uom.id} />
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {uoms.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No UOM records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
