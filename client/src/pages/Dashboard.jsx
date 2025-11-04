import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/upload`,
        formData
      );
      setInsights(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
  };

  const chartData = insights?.chart_data
    ? {
        labels: insights.chart_data.map((item) => item.PRODUCTLINE),
        datasets: [
          {
            label: "Total Sales",
            data: insights.chart_data.map((item) => item.total_sales),
            backgroundColor: "rgba(37, 99, 235, 0.6)",
          },
        ],
      }
    : null;

  return (
    <div className="p-8 min-h-screen bg-gray-800 w-full">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">
        📊 Sales Insight Dashboard
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 w-1/2">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border p-2 rounded w-full mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      {insights && (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Insights</h2>
          <p>
            <strong>Total Rows:</strong> {insights.total_rows}
          </p>
          {insights.total_sales && (
            <p>
              <strong>Total Sales:</strong> ${insights.total_sales.toFixed(2)}
            </p>
          )}
          {insights.average_sales && (
            <p>
              <strong>Average Sales:</strong> $
              {insights.average_sales.toFixed(2)}
            </p>
          )}

          {chartData && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">
                Sales by Product Line
              </h3>
              <Bar data={chartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
