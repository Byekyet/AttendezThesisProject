"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface Request {
  id: string;
  type: string;
  courseCode: string;
  courseName: string;
  requestDate: string;
  status: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch the user's requests
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

  // For demo purposes - add mock data if no requests are found
  useEffect(() => {
    if (requests.length === 0 && !loading && !error) {
      const mockRequests: Request[] = [
        {
          id: "001",
          type: "RE_REGISTRATION",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "NEW",
        },
        {
          id: "002",
          type: "LEAVE",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "APPROVED",
        },
        {
          id: "003",
          type: "RE_REGISTRATION",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "NEW",
        },
        {
          id: "004",
          type: "RE_REGISTRATION",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "NEW",
        },
        {
          id: "005",
          type: "RE_REGISTRATION",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "REJECTED",
        },
        {
          id: "006",
          type: "REGISTRATION",
          courseCode: "INF 303",
          courseName: "Database management system 1",
          requestDate: "2025.03.02",
          status: "REJECTED",
        },
      ];
      setRequests(mockRequests);
      setTotalPages(Math.ceil(mockRequests.length / itemsPerPage));
    }
  }, [requests, loading, error]);

  // Get paginated requests
  const getPaginatedRequests = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return requests.slice(startIndex, endIndex);
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
      case "NEW":
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
  const totalItems = requests.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My requests</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
            My requests
          </button>
          <Link
            href="/requests/new"
            className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded font-medium hover:bg-gray-50"
          >
            Send request
          </Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">You have no requests yet.</p>
          <Link
            href="/requests/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium"
          >
            Create a Request
          </Link>
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
                    <th className="px-4 py-3 text-sm font-medium">
                      Request date
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">Status</th>
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
                      <td className="px-4 py-3 text-sm">
                        {request.requestDate}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <button className="px-3 py-1 border border-gray-300 rounded">
                        <MoreHorizontal size={16} />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-1 border border-gray-300 rounded"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
