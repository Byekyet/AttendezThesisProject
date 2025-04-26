import React from "react";
import { CheckCircle } from "lucide-react";

const PasswordUpdatedModal = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-6">
          Successfully updated the password!
        </h2>
        <button
          onClick={onConfirm}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default PasswordUpdatedModal;
