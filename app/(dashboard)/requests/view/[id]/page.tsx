"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface RequestDetails {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  courseId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id?: string;
    name: string;
    code: string;
  };
}

export default function ViewRequestPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = session?.user?.role === "TEACHER";

  // Fetch request details
  useEffect(() => {
    const fetchRequest = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/requests/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Request not found");
          } else if (response.status === 403) {
            throw new Error("You don't have access to this request");
          } else {
            throw new Error("Failed to fetch request details");
          }
        }

        const data = await response.json();
        setRequest(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchRequest();
    }
  }, [params.id, session]);

  // Format request type for display
  const formatRequestType = (type: string) => {
    switch (type) {
      case "RE_REGISTRATION":
        return "Re-registration";
      case "LEAVE":
        return "On leave";
      case "ABSENCE":
        return "Absence";
      case "LATE":
        return "Late arrival";
      default:
        return (
          type.charAt(0).toUpperCase() +
          type.slice(1).toLowerCase().replace("_", " ")
        );
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let classes = "inline-block px-2 py-1 text-xs font-medium rounded-full ";

    switch (status) {
      case "APPROVED":
        classes += "bg-green-100 text-green-800";
        break;
      case "REJECTED":
        classes += "bg-red-100 text-red-800";
        break;
      case "PENDING":
      default:
        classes += "bg-blue-100 text-blue-800";
        break;
    }

    return (
      <span className={classes}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  // Add this function to display attendance status change information
  const getAttendanceStatusMessage = (request: RequestDetails) => {
    if (request.status !== "APPROVED") return null;

    const isAttendanceRelated = ["ABSENCE", "LATE", "RE_REGISTRATION"].includes(
      request.type
    );
    if (!isAttendanceRelated) return null;

    const statusMap: Record<string, string> = {
      ABSENCE: "excused absence",
      LATE: "late arrival",
      RE_REGISTRATION: "present",
    };

    const statusText = statusMap[request.type] || "";
    if (!statusText) return null;

    return (
      <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md">
        <p className="font-medium">Attendance Status Updated</p>
        <p className="text-sm mt-1">
          This request was approved and the student's attendance status has been
          updated to <strong>{statusText}</strong>.
        </p>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
        <Link
          href="/requests"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300"
        >
          Back to Requests
        </Link>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6 text-center">Request not found or inaccessible</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Request Details</h1>
        <Link
          href="/requests"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300"
        >
          Back to Requests
        </Link>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Request Information
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Request ID:</span>
                  <p className="font-medium">{request.id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Type:</span>
                  <p className="font-medium">
                    {formatRequestType(request.type)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={request.status} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Submitted on:</span>
                  <p className="font-medium">{formatDate(request.createdAt)}</p>
                </div>
                {request.status !== "PENDING" && (
                  <div>
                    <span className="text-gray-500 text-sm">Last updated:</span>
                    <p className="font-medium">
                      {formatDate(request.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              {isTeacher && request.user ? (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    Student Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Name:</span>
                      <p className="font-medium">{request.user.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Email:</span>
                      <p className="font-medium">{request.user.email}</p>
                    </div>
                  </div>
                </>
              ) : (
                <h2 className="text-lg font-semibold mb-4">
                  Course Information
                </h2>
              )}
              <div className="space-y-3 mt-3">
                <div>
                  <span className="text-gray-500 text-sm">Course:</span>
                  <p className="font-medium">
                    {request.course.code} - {request.course.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Request Description</h2>
            <p className="whitespace-pre-line bg-gray-50 p-4 rounded">
              {request.description}
            </p>
            {getAttendanceStatusMessage(request)}
          </div>
        </div>
      </div>
    </div>
  );
}
