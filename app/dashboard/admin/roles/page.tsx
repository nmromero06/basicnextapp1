"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getRoles, addRole, deleteRole, updateRole, Role } from "./actions";
import { downloadRolesExcel } from "./DownloadRoles";
import DownloadRolesPdf from "./DownloadRolesPdf";
import AddRoleModal from "./AddRoleModal";
import DeleteRoleModal from "./DeleteRoleModal";
import EditRoleModal from "./EditRoleModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import ConfirmModal from "@/components/ConfirmModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    const fetchRoles = useCallback(() => {
        getRoles()
            .then(setRoles)
            .catch(console.error)
            .finally(() => setLoadingRoles(false));
    }, []);

    useEffect(() => {
        if (session) {
            fetchRoles();
        }
    }, [session, fetchRoles]);

    const handleAddRole = async (id: string, description: string) => {
        try {
            await addRole(id, description);
            await showMessage("Role added successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add role.");
        }
    };

    const handleDeleteRole = async (id: string) => {
        try {
            await deleteRole(id);
            await showMessage("Role deleted successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete role.");
        }
    };

    const handleEditRole = async (id: string, description: string) => {
        try {
            await updateRole(id, description);
            await showMessage("Role updated successfully!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update role.");
        }
    };

    const handleDownloadExcel = async () => {
        const confirmed = await ConfirmModal("Download Roles to Excel?", {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-green-600 hover:bg-green-700",
        });
        if (!confirmed) return;
        const filtered = roles.filter(role => 
            role.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
            role.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        downloadRolesExcel(filtered);
    };

    if (isPending || !session) {
        return <div className="p-6">Loading...</div>; 
    }

    const filteredRoles = roles.filter(role => 
        role.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANACCESSROLES"]}>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Role Controls</h2>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full rounded border px-3 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-gray-700"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
            <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANDOWNLOADROLES"]}>
                <button
                    onClick={handleDownloadExcel}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                    Download Excel
                </button>
            </ButtonGuardWrapper>
            <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANPRINTROLES"]}>
                <DownloadRolesPdf roles={filteredRoles} searchQuery={searchQuery} />
            </ButtonGuardWrapper>
        </div>

        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANADDROLES"]}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            + Add Role
          </button>
        </ButtonGuardWrapper>
        </div>
      </section>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANADDROLES"]}>
        <AddRoleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddRole} 
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANDELETEROLES"]}>
        <DeleteRoleModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onDelete={handleDeleteRole}
          role={roleToDelete}
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANEDITROLES"]}>
        <EditRoleModal
          isOpen={!!roleToEdit}
          onClose={() => setRoleToEdit(null)}
          onEdit={handleEditRole}
          role={roleToEdit}
        />
      </ButtonGuardWrapper>

      <section className="overflow-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Row #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRoles.map((role, index) => (
                <tr key={role.id}>
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{role.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{role.description}</td>
                  <td className="px-4 py-3 text-sm print:hidden">
                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANEDITROLES"]}>
                      <button
                        onClick={() => setRoleToEdit(role)}
                        className="rounded bg-amber-500 px-3 py-1 font-semibold text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>
                    </ButtonGuardWrapper>

                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "ROLES_CANDELETEROLES"]}>
                      <button
                        onClick={() => setRoleToDelete(role)}
                        className="ml-2 rounded bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </ButtonGuardWrapper>
                  </td>
                </tr>
              ))}
              {!loadingRoles && filteredRoles.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No roles found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredRoles.length} of {roles.length} roles
        </div>
    </div>
    </PageGuardWrapper>
  );
}
