import React from "react";
import clsx from "clsx";

function Button({ children, variant = "primary", className = "", ...props }) {
  const baseStyles =
    "px-4 py-2 text-sm font-medium rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
