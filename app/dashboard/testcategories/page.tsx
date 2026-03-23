import {
  createTestCategory,
  deleteTestCategory,
  getTestCategories,
  updateTestCategory,
} from "./actions";

export default async function TestCategoriesPage() {
  const categories = await getTestCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Medical Test Categories Management</h1>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Add Category</h2>
        <form action={createTestCategory} className="grid gap-3 md:grid-cols-3">
          <input
            name="name"
            required
            maxLength={50}
            placeholder="Category name (e.g. CBC)"
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
            {categories.map((category) => (
              <tr key={category.id}>
                <td colSpan={2} className="px-4 py-3">
                  <form action={updateTestCategory} className="grid gap-2 md:grid-cols-2">
                    <input type="hidden" name="id" value={category.id} />
                    <input
                      name="name"
                      defaultValue={category.name}
                      required
                      maxLength={50}
                      className="w-full rounded border px-3 py-2"
                    />
                    <input
                      name="description"
                      defaultValue={category.description ?? ""}
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
                  <form action={deleteTestCategory}>
                    <input type="hidden" name="id" value={category.id} />
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
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No category records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
