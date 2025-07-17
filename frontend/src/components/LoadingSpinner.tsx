import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
  </div>
);

export default LoadingSpinner;
