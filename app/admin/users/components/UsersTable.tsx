"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { UserRole } from "@/utils/roles";
import { supabase } from "@/lib/tanstack/supabase";

export async function getUserRole(): Promise<UserRole | null> {
  try {
    const user = await useAuth();

    if (!user) {
      return null;
    }

    // Get user role from Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.userId)
      .single();

    if (error || !data) {
      console.error("Error fetching role from database:", error);
      return null;
    }

    return (data.role as UserRole) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}
import {
  UserMinus,
  UserCog,
  Check,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useClerk();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);

        // Fetch users from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setUsers(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchTermLower) || email.includes(searchTermLower)
    );
  });

  const setUserRole = async (userId: string, role: UserRole) => {
    if (!session) {
      setError("You must be logged in to perform this action");
      return;
    }

    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
          role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user role");
      }

      // Update local state
      setUsers(
        users.map((user) => {
          if (user.clerk_id === userId) {
            return { ...user, role };
          }
          return user;
        })
      );
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
      console.error("Error updating user role:", err);
    }
  };

  if (isLoading) {
    return (
      <div className='w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-4'>
        <div className='animate-pulse space-y-4'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-full'></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='h-16 bg-gray-200 dark:bg-gray-700 rounded w-full'
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
        <div className='text-red-500'>
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden'>
      {/* Search input */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <input
          type='text'
          placeholder='Search users by name or email...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        />
      </div>

      {/* Users table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-900'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                User
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Joined
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className='hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0'>
                      {user.image_url ? (
                        <img
                          className='h-10 w-10 rounded-full'
                          src={user.image_url}
                          alt={user.name || "User"}
                        />
                      ) : (
                        <div className='h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                          <UserIcon
                            size={20}
                            className='text-gray-500 dark:text-gray-400'
                          />
                        </div>
                      )}
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {user.name ||
                          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                          "Anonymous User"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {user.email || "No email"}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : user.role === "moderator"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {user.role || "user"}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex space-x-2 justify-end'>
                    <button
                      onClick={() => setUserRole(user.clerk_id, "admin")}
                      disabled={user.role === "admin"}
                      className={`inline-flex items-center p-1 ${
                        user.role === "admin"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      }`}
                      title='Make Admin'
                    >
                      <ShieldAlert size={18} />
                    </button>
                    <button
                      onClick={() => setUserRole(user.clerk_id, "moderator")}
                      disabled={user.role === "moderator"}
                      className={`inline-flex items-center p-1 ${
                        user.role === "moderator"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      }`}
                      title='Make Moderator'
                    >
                      <UserCog size={18} />
                    </button>
                    <button
                      onClick={() => setUserRole(user.clerk_id, "user")}
                      disabled={!user.role || user.role === "user"}
                      className={`inline-flex items-center p-1 ${
                        !user.role || user.role === "user"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      }`}
                      title='Reset to User'
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
