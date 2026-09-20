import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch clients for client filter
  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");

      setClients(response.data.clients);
    } catch (error) {
      console.log("Failed to load clients");
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices", {
        params: {
          search,
          status,
          client,
          date,
        },
      });

      setInvoices(response.data.invoices);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial loading
  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  // Automatically fetch when filters change
  useEffect(() => {
    fetchInvoices();
  }, [status, client, date]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchInvoices();
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);

      fetchInvoices();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete invoice"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Invoices
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your invoices
          </p>
        </div>

        <Link
          to="/invoices/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          + Create Invoice
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search invoice/client/company..."
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Client */}
          <select
            value={client}
            onChange={(e) =>
              setClient(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Clients
            </option>

            {clients.map((clientItem) => (
              <option
                key={clientItem._id}
                value={clientItem._id}
              >
                {clientItem.name}
                {clientItem.companyName
                  ? ` - ${clientItem.companyName}`
                  : ""}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Statuses
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Unpaid">
              Unpaid
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Overdue">
              Overdue
            </option>
          </select>

          {/* Issue Date */}
          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear Filters */}
        {(search ||
          status ||
          client ||
          date) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setClient("");
              setDate("");
            }}
            className="mt-4 text-blue-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          Loading invoices...
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            No invoices found
          </h3>

          <p className="text-gray-500 mt-2">
            Try changing your filters or create
            your first invoice.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-left">
                  <th className="p-4">
                    Invoice
                  </th>

                  <th className="p-4">
                    Client
                  </th>

                  <th className="p-4">
                    Issue Date
                  </th>

                  <th className="p-4">
                    Due Date
                  </th>

                  <th className="p-4">
                    Amount
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="p-4">
                      {invoice.client?.name ||
                        "-"}
                    </td>

                    <td className="p-4">
                      {new Date(
                        invoice.issueDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {new Date(
                        invoice.dueDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      ₹
                      {Number(
                        invoice.totalAmount
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-gray-100">
                        {invoice.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        View
                      </Link>

                      <Link
                        to={`/invoices/edit/${invoice._id}`}
                        className="text-green-600 hover:underline mr-3"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            invoice._id
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;