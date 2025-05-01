"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Update the session
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
        },
      });

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-semibold">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="font-medium text-xl">{session.user.name}</div>
              <div className="text-sm text-gray-500">
                {session.user.role === "TEACHER" ? "Teacher" : "Student"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="font-medium text-sm">
                Full Name
              </label>
              {isEditing ? (
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="border rounded p-2 text-sm"
                  disabled={loading}
                />
              ) : (
                <div className="p-2 text-sm">{session.user.name}</div>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="font-medium text-sm">
                Email Address
              </label>
              <div className="p-2 text-sm">{session.user.email}</div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="role" className="font-medium text-sm">
                Role
              </label>
              <div className="p-2 text-sm">
                {session.user.role === "TEACHER" ? "Teacher" : "Student"}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="rounded px-4 py-2 text-sm font-medium"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-gray-500">
                Change your password to secure your account
              </p>
            </div>
            <button
              type="button"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => router.push("/change-password")}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
