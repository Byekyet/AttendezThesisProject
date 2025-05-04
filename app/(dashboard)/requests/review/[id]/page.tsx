"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
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
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
}

export default function ReviewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check if user is a teacher
  useEffect(() => {
    if (session && session.user && session.user.role !== "TEACHER") {
      setError("Only teachers can access this page");
      setLoading(false);
    }
  }, [session]);

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

    if (session && session.user && session.user.role === "TEACHER") {
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

  // Handle approve request
  const handleApprove = async () => {
    await updateRequestStatus("APPROVED");
  };

  // Handle reject request
  const handleReject = async () => {
    await updateRequestStatus("REJECTED");
  };

  // Update request status
  const updateRequestStatus = async (status: string) => {
    if (!request) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update request");
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle success acknowledgment
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/requests");
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

  if (showSuccess) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="text-green-500 h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-4">
            Request Updated Successfully
          </h1>
          <p className="text-center mb-6 text-gray-600">{successMessage}</p>
          <div className="flex justify-center">
            <button
              onClick={handleCloseSuccess}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              Return to Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Review Request</h1>
        <Link
          href="/requests"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300"
        >
          Back to Requests
        </Link>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
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
                  <p className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ml-2">
                    PENDING
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Submitted on:</span>
                  <p className="font-medium">{formatDate(request.createdAt)}</p>
                </div>
              </div>
            </div>
            <div>
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
          </div>
        </div>
      </div>

      {/* Teacher Response */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Response</h2>
          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add your comments or feedback here..."
              disabled={submitting}
            ></textarea>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Request
            </button>
            <button
              onClick={handleReject}
              disabled={submitting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
