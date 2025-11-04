import React from "react";

export default function SalesCard({ title, value, change }) {
  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className={`text-sm mt-1 ${changeColor}`}>
        {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
      </p>
    </div>
  );
}
