import React from "react";

function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center max-h-96 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
      <span className="text-indigo-700 font-semibold text-lg">{text}</span>
    </div>
  );
}

export default Loader;