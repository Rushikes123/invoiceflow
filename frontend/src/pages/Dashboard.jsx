import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Total Invoices</p>

          <h2 className="text-3xl font-bold mt-2">
            {data.totalInvoices}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Total Billed</p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{data.totalBilledAmount.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Total Paid</p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{data.totalPaidAmount.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500">Outstanding</p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{data.outstandingAmount.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Recent Invoices
          </h2>
        </div>

        {data.recentInvoices.length === 0 ? (
          <div className="p-6 text-gray-500">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {data.recentInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b"
                  >
                    <td className="p-4">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="p-4">
                      {invoice.client?.name}
                    </td>

                    <td className="p-4">
                      ₹{invoice.totalAmount.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-gray-100">
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;