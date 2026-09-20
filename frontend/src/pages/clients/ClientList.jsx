import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClients = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clients", {
        params: {
          search: searchValue,
        },
      });

      setClients(response.data.clients);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    fetchClients(value);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);

      fetchClients(search);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete client"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Clients
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your clients
          </p>
        </div>

        <Link
          to="/clients/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          + Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, company or email..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          Loading clients...
        </div>
      ) : clients.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            No clients found
          </h3>

          <p className="text-gray-500 mt-2">
            Add your first client to get started.
          </p>
        </div>
      ) : (
        /* Client Table */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">
                      {client.name}
                    </td>

                    <td className="p-4">
                      {client.companyName || "-"}
                    </td>

                    <td className="p-4">
                      {client.email || "-"}
                    </td>

                    <td className="p-4">
                      {client.phone || "-"}
                    </td>

                    <td className="p-4">
                      {client.gstNumber || "-"}
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/clients/edit/${client._id}`}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(client._id)
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

export default ClientList;