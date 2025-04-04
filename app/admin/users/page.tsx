import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/utils/roles";
import UsersTable from "./components/UsersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard | Organic",
  description: "Manage users and their roles",
};

export default async function AdminUsersPage() {
  const isUserAdmin = await isAdmin();

  // Double-check admin status
  if (!isUserAdmin) {
    redirect("/");
  }

  return (
    <div className='container mx-auto px-4 pt-24 pb-12'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>User Management</h1>
      </div>

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
