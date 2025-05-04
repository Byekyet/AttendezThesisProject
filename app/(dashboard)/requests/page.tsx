"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
} from "lucide-react";

interface Request {
  id: string;
  type: string;
  courseCode: string;
  courseName: string;
  requestDate: string;
  status: string;
  userName?: string;
  description?: string;
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("ALL");
  const itemsPerPage = 10;

  const isTeacher = session?.user?.role === "TEACHER";

  // Fetch the requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/requests");
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        const data = await response.json();
        setRequests(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (err) {
        setError("Failed to load requests. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests based on status
  const getFilteredRequests = () => {
    if (filter === "ALL") return requests;
    return requests.filter((req) => req.status === filter);
  };

  // Get paginated requests
  const getPaginatedRequests = () => {
    const filteredRequests = getFilteredRequests();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

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

  // Handle request review
  const handleReviewRequest = (requestId: string) => {
    // Navigate to review page
    window.location.href = `/requests/review/${requestId}`;
  };

  // Handle request view
  const handleViewRequest = (requestId: string) => {
    // Navigate to view page
    window.location.href = `/requests/view/${requestId}`;
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

  if (loading) {
    return <div className="p-6 text-center">Loading requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const paginatedRequests = getPaginatedRequests();
  const filteredRequests = getFilteredRequests();
  const totalItems = filteredRequests.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isTeacher ? "Student Requests" : "My Requests"}
        </h1>
        <div className="flex space-x-2">
          {!isTeacher && (
            <>
              <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
                My requests
              </button>
              <Link
                href="/requests/new"
                className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded font-medium hover:bg-gray-50"
              >
                Send request
              </Link>
            </>
          )}
          {isTeacher && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="ALL">All requests</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {isTeacher
              ? "There are no requests for your courses."
              : "You have no requests yet."}
          </p>
          {!isTeacher && (
            <Link
              href="/requests/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium"
            >
              Create a Request
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-700 text-left">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium">
                      Request ID
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">
                      Request type
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">
                      Course code
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">
                      Course name
                    </th>
                    {isTeacher && (
                      <th className="px-4 py-3 text-sm font-medium">
                        Student name
                      </th>
                    )}
                    <th className="px-4 py-3 text-sm font-medium">
                      Request date
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">Status</th>
                    {isTeacher && (
                      <th className="px-4 py-3 text-sm font-medium">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{request.id}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatRequestType(request.type)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {request.courseCode}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {request.courseName}
                      </td>
                      {isTeacher && (
                        <td className="px-4 py-3 text-sm">
                          {request.userName}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {request.requestDate}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={request.status} />
                      </td>
                      {isTeacher && (
                        <td className="px-4 py-3 text-sm">
                          {request.status === "PENDING" ? (
                            <button
                              onClick={() => handleReviewRequest(request.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewRequest(request.id)}
                              className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
                            >
                              View
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {Math.min(
                          (currentPage - 1) * itemsPerPage + 1,
                          totalItems
                        )}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                      </span>{" "}
                      of <span className="font-medium">{totalItems}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        } relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToPage(index + 1)}
                          className={`${
                            currentPage === index + 1
                              ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        } relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
