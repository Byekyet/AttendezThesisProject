"use client";

import * as React from "react";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    []
  );

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto-dismiss toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border p-4 shadow-md ${
              t.variant === "destructive"
                ? "border-red-500 bg-red-50 text-red-900"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            {t.title && <div className="font-medium">{t.title}</div>}
            {t.description && <div className="text-sm">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const toast = (props: ToastProps) => {
  if (typeof window !== "undefined") {
    // This is a simple implementation without a global context
    // In a real app, you would use the context to manage toasts
    console.log("Toast:", props);

    // Create a temporary toast element
    const toastDiv = document.createElement("div");
    toastDiv.className = `fixed bottom-4 right-4 z-50 rounded-md border p-4 shadow-md ${
      props.variant === "destructive"
        ? "border-red-500 bg-red-50 text-red-900"
        : "border-gray-200 bg-white text-gray-900"
    }`;

    const titleDiv = document.createElement("div");
    titleDiv.className = "font-medium";
    titleDiv.textContent = props.title || "";

    const descDiv = document.createElement("div");
    descDiv.className = "text-sm";
    descDiv.textContent = props.description || "";

    toastDiv.appendChild(titleDiv);
    toastDiv.appendChild(descDiv);
    document.body.appendChild(toastDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(toastDiv);
    }, 3000);
  }
};
