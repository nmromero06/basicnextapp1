"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getUsers, addUser, updateUser, toggleUserActive, changeUserPassword, User } from "./actions";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import ChangeUserPasswordModal from "./ChangeUserPasswordModal";
import AssignUserRolesModal from "./AssignUserRolesModal";
import ActDeactUserModal from "./ActDeactUserModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToToggle, setUserToToggle] = useState<User | null>(null);
    const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null);
    const [userToAssignRoles, setUserToAssignRoles] = useState<User | null>(null);

    const fetchUsers = useCallback(() => {
        getUsers()
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoadingUsers(false));
    }, []);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session, fetchUsers]);

    const handleAddUser = async (data: {
        email: string;
        name: string;
        fullname: string;
        birthdate: string;
        gender: string;
    }) => {
        try {
            await addUser(data);
            await showMessage("User added successfully!");
            fetchUsers();
        } catch (error: unknown) {
            if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
                await showMessage("Session changed in another tab. Reloading...");
                window.location.reload();
                return;
            }
            console.error(error);
            await showMessage("Failed to add user.");
        }
    };

    const handleEditUser = async (data: {
        id: string;
        email: string;
        name: string;
        fullname: string;
        birthdate: string;
        gender: string;
    }) => {
        try {
            await updateUser(data);
            await showMessage("User updated successfully!");
            fetchUsers();
        } catch (error: unknown) {
            if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
                await showMessage("Session changed in another tab. Reloading...");
                window.location.reload();
                return;
            }
            console.error(error);
            await showMessage("Failed to update user.");
        }
    };

    const handleToggleUser = async (id: string, active: boolean) => {
        try {
            await toggleUserActive(id, active);
          //  await showMessage(`User ${active ? "activated" : "deactivated"} successfully!`);
            fetchUsers();
        } catch (error: unknown) {
            if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
                await showMessage("Session changed in another tab. Reloading...");
                window.location.reload();
                return;
            }
            console.error(error);
            await showMessage("Failed to update user status.");
        }
    };

    const handleChangePassword = async (id: string, password: string) => {
        try {
            await changeUserPassword(id, password);
            await showMessage("Password changed successfully!");
        } catch (error: unknown) {
            if (error instanceof Error && (error.message === "SessionMismatch" || error.message.includes("SessionMismatch"))) {
                await showMessage("Session changed in another tab. Reloading...");
                window.location.reload();
                return;
            }
            console.error(error);
            await showMessage("Failed to change password.");
        }
    };

    if (isPending || !session) {
        return <div className="p-6">Loading...</div>; 
    }

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.fullname && user.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANACCESSUSERS"]}>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">User Controls</h2>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
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

        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANADDUSERS"]}>
            <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
            + Add User
            </button>
        </ButtonGuardWrapper>
        </div>
      </section>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANADDUSERS"]}>
        <AddUserModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddUser} 
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_CANEDITUSERS"]}>
        <EditUserModal
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          onEdit={handleEditUser}
          user={userToEdit}
        />
      </ButtonGuardWrapper>

      <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR", "USERS_ACTIVATEUSERS"]}>
        <ActDeactUserModal
          isOpen={!!userToToggle}
          onClose={() => setUserToToggle(null)}
          onToggle={handleToggleUser}
          user={userToToggle}
        />
      </ButtonGuardWrapper>

      <ChangeUserPasswordModal
        isOpen={!!userToChangePassword}
        onClose={() => setUserToChangePassword(null)}
        onChangePassword={handleChangePassword}
        user={userToChangePassword}
      />

      <AssignUserRolesModal
        isOpen={!!userToAssignRoles}
        onClose={() => setUserToAssignRoles(null)}
        user={userToAssignRoles}
      />

      <section className="overflow-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 w-16">
                  Row #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Birthdate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={user.active}
                      readOnly
                      className="h-4 w-4 rounded border-gray-300 text-green-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.fullname || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.gender || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <ButtonGuardWrapper requiredRoles={['ADMINISTRATOR', 'USERS_CANACTIVATEUSERS']}>
                        <button 
                            onClick={() => setUserToToggle(user)}
                            className={`rounded px-3 py-1 font-semibold text-white ${
                                user.active 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {user.active ? "Deactivate" : "Activate"}
                        </button>
                    </ButtonGuardWrapper>
                  </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                     <ButtonGuardWrapper requiredRoles={['ADMINISTRATOR', 'USERS_CANEDITUSERS']}>
                        <button 
                            onClick={() => setUserToEdit(user)}
                            className="rounded bg-amber-500 px-3 py-1 font-semibold text-white hover:bg-amber-600"
                        >
                            Edit
                        </button>
                    </ButtonGuardWrapper>

                    <ButtonGuardWrapper requiredRoles={['ADMINISTRATOR', 'USERS_CANEDITUSERS']}>
                        <button 
                            onClick={() => setUserToChangePassword(user)}
                            className="ml-2 rounded bg-purple-600 px-3 py-1 font-semibold text-white hover:bg-purple-700"
                            title="Change Password"
                        >
                            Password
                        </button>
                    </ButtonGuardWrapper>

                    <ButtonGuardWrapper requiredRoles={['ADMINISTRATOR','USERS_CANASSIGNUSERSROLES']}>
                        <button 
                            onClick={() => setUserToAssignRoles(user)}
                            className="ml-2 rounded bg-teal-600 px-3 py-1 font-semibold text-white hover:bg-teal-700"
                            title="Assign Roles"
                        >
                            Roles
                        </button>
                    </ButtonGuardWrapper>
                  </td>
                </tr>
              ))}
              {!loadingUsers && filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No users found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="mt-2 text-sm text-gray-700">
          Showing {filteredUsers.length} of {users.length} users
        </div>
    </div>
    </PageGuardWrapper>
  );
}
