import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    client: "",
    issueDate: "",
    dueDate: "",
    taxPercentage: 0,
    discount: 0,
    status: "Unpaid",
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      rate: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/clients");
        setClients(response.data.clients);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load clients"
        );
      }
    };

    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Change item
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] =
      field === "description" ? value : Number(value);

    setItems(updatedItems);
  };

  // Add item
  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  // Remove item
  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    const updatedItems = items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setItems(updatedItems);
  };

  // Calculate preview
  const subtotal = items.reduce(
    (total, item) =>
      total + item.quantity * item.rate,
    0
  );

  const taxAmount =
    (subtotal * Number(formData.taxPercentage)) / 100;

  const totalAmount =
    subtotal +
    taxAmount -
    Number(formData.discount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.client) {
      setError("Please select a client");
      return;
    }

    if (!formData.issueDate || !formData.dueDate) {
      setError("Please select issue date and due date");
      return;
    }

    for (const item of items) {
      if (!item.description) {
        setError("Please enter item description");
        return;
      }

      if (item.quantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      if (item.rate < 0) {
        setError("Rate cannot be negative");
        return;
      }
    }

    if (Number(formData.taxPercentage) < 0) {
      setError("Tax cannot be negative");
      return;
    }

    if (Number(formData.discount) < 0) {
      setError("Discount cannot be negative");
      return;
    }

    if (totalAmount < 0) {
      setError(
        "Discount cannot be greater than the invoice amount"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/invoices", {
        client: formData.client,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items,
        taxPercentage: Number(formData.taxPercentage),
        discount: Number(formData.discount),
        status: formData.status,
      });

      navigate("/invoices");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Invoice
        </h1>

        <p className="text-gray-500 mt-1">
          Create a new invoice
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Client and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div>
              <label className="block mb-2 font-medium">
                Client *
              </label>

              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="">
                  Select Client
                </option>

                {clients.map((client) => (
                  <option
                    key={client._id}
                    value={client._id}
                  >
                    {client.name}
                    {client.companyName
                      ? ` - ${client.companyName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Issue Date *
              </label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Due Date *
              </label>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Invoice Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="p-3">
                      Description
                    </th>

                    <th className="p-3">
                      Quantity
                    </th>

                    <th className="p-3">
                      Rate
                    </th>

                    <th className="p-3">
                      Amount
                    </th>

                    <th className="p-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const amount =
                      item.quantity * item.rate;

                    return (
                      <tr
                        key={index}
                        className="border-b"
                      >
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Item description"
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-24 border rounded-lg px-3 py-2"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "rate",
                                e.target.value
                              )
                            }
                            className="w-32 border rounded-lg px-3 py-2"
                          />
                        </td>

                        <td className="p-3 font-medium">
                          ₹{amount.toLocaleString()}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(index)
                            }
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div>
              <label className="block mb-2 font-medium">
                Tax (%)
              </label>

              <input
                type="number"
                min="0"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Discount
              </label>

              <input
                type="number"
                min="0"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Draft">Draft</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Tax ({formData.taxPercentage}%)
                </span>

                <span>
                  ₹{taxAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>

                <span>
                  - ₹
                  {Number(
                    formData.discount
                  ).toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>

                <span>
                  ₹{Math.max(totalAmount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg"
            >
              {loading
                ? "Creating..."
                : "Create Invoice"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/invoices")}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;