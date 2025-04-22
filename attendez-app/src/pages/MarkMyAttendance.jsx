import React, { useState, useRef } from "react";
import { Bell, User, X, CheckCircle } from "lucide-react";

const MarkAttendance = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 6) {
      if (code === "123456") {
        setShowModal(false);
        setShowSuccess(true);
        setShowError(false);
      } else {
        setShowError(true);
      }
    }
  };

  return (
    <div className="px-2 pt-0 pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-xl font-semibold">Mark my attendance</h2>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-500" />
          <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select course
          </label>
          <select className="w-full border px-3 py-2 rounded text-sm">
            <option>INF 202: Database Management Systems 1</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select course schedule
          </label>
          <select className="w-64 border px-3 py-2 rounded text-sm">
            <option>Monday 09:00</option>
          </select>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => setShowModal(true)}
        >
          Mark attendance
        </button>
      </div>

      {/* OTP Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">Verification</h2>
            <p className="text-center text-gray-600 mb-6">
              Please type the one-time password to mark your attendance
            </p>
            <div className="flex justify-center gap-2 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`w-12 h-12 text-xl text-center border rounded ${
                    showError ? "border-red-500" : ""
                  }`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </div>
            {showError && (
              <p className="text-center text-red-600 text-sm mb-4">
                Please enter a valid OTP
              </p>
            )}
            <div className="text-center">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                onClick={handleVerify}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Successfully marked the attendance!
            </h2>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
              onClick={() => setShowSuccess(false)}
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
