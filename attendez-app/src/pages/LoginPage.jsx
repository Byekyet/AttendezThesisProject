import React, { useState } from "react";
import { Eye, EyeOff, Mail, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Student");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === "Student") {
      navigate("/dashboard");
    } else {
      alert(`Redirect for role: ${role} is not yet implemented.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">Sign in</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Welcome back to Attendez, please sign in to your account
        </p>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">I am</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Key className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm"
            />
            <span
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </span>
          </div>
        </div>

        <div className="text-right mb-4">
          <a href="#" className="text-sm text-blue-600 font-medium hover:underline">
            Forgot your password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
