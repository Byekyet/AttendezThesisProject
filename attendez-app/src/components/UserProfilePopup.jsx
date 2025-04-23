import React, { useState } from "react";
import {
  X,
  User as UserIcon,
  Lock,
  CreditCard,
  Mail,
  Phone,
  BookOpen,
  Calendar,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

const UserProfilePopup = ({ onClose }) => {
  const [showChange, setShowChange] = useState(false);

  return (
    <>
      <div className="absolute top-0 right-0 mt-12 mr-6 bg-white rounded-lg shadow-lg w-80 z-50">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">User profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Avatar & Name */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium">Beket Murat</p>
              <p className="text-gray-500 text-sm">Computer Science</p>
            </div>
          </div>

          {/* Info list */}
          {[
            { icon: CreditCard, label: "Student id", value: "180103306" },
            { icon: Mail,       label: "Email",      value: "180103306@stu.sdu.edu.kz" },
            { icon: Phone,      label: "Phone",      value: "+7 7479505075" },
            { icon: BookOpen,   label: "Academic year",    value: "3rd year" },
            { icon: Calendar,   label: "Enrolled courses", value: "7 courses" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center space-x-2">
              <Icon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-gray-700 text-sm">{value}</p>
              </div>
            </div>
          ))}

          {/* Change password */}
          <button
            onClick={() => setShowChange(true)}
            className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2 hover:bg-blue-700"
          >
            <Lock className="w-4 h-4" />
            <span>Change password</span>
          </button>
        </div>
      </div>

      {showChange && <ChangePasswordModal onClose={() => setShowChange(false)} />}
    </>
  );
};

export default UserProfilePopup;
