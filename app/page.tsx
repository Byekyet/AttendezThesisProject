import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white text-center p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-blue-600 mb-6">Attendez</h1>
        <p className="text-xl text-gray-700 mb-10">
          A modern attendance management system for educational institutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">For Students</h2>
            <p className="text-gray-600">
              Mark your attendance easily using OTP verification and track your
              attendance records.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">For Teachers</h2>
            <p className="text-gray-600">
              Take attendance manually or generate OTP codes for student
              verification.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Request System</h2>
            <p className="text-gray-600">
              Submit and manage absence requests with an easy-to-use interface.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
