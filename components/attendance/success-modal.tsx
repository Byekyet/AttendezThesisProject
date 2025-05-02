import { CheckIcon } from "lucide-react";

interface SuccessModalProps {
  onClose: () => void;
}

export function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          Successfully marked the attendance!
        </h2>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
