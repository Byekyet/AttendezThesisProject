import React, { useState } from "react";
import { X, Info } from "lucide-react";
import PasswordUpdatedModal from "../components/PasswordUpdatedModal";

const ChangePasswordModal = ({ onClose }) => {
  const [showUpdated, setShowUpdated] = useState(false);
  const [current,   setCurrent] = useState("");
  const [next,      setNext]    = useState("");
  const [confirm,   setConfirm] = useState("");

  // mismatch flag
  const mismatch =
    confirm.length > 0 && next.length > 0 && confirm !== next;

  const handleUpdate = () => {
    if (mismatch) return;
    setShowUpdated(true);
  };

  return (
    <>
      {/* overlay + form */}
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          {/* Close icon */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold mb-4">Change password</h2>

          {/* Requirements */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <div className="flex items-center text-blue-600 font-medium mb-2">
              <Info className="w-4 h-4 mr-1" />
              Password requirements:
            </div>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
              <li>At least 8 characters long</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>

          {/* Form fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current password
              </label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New password
              </label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                className={`w-full rounded px-3 py-2 border ${
                  mismatch ? "border-red-500" : "border-gray-300"
                }`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {mismatch && (
                <p className="mt-1 flex items-center text-red-600 text-sm">
                  <Info className="w-4 h-4 mr-1" />
                  Passwords don’t match
                </p>
              )}
            </div>
          </div>

          {/* Update button */}
          <button
            onClick={handleUpdate}
            disabled={mismatch}
            className={`w-full py-2 font-medium rounded ${
              mismatch
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Update password
          </button>
        </div>
      </div>

      {/* Success popup */}
      {showUpdated && (
        <PasswordUpdatedModal
          onConfirm={() => {
            setShowUpdated(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ChangePasswordModal;
