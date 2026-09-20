import { useEffect, useState } from "react";
import api from "../../services/api";

const PaymentPage = () => {
  const [invoices, setInvoices] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedInvoice, setSelectedInvoice] =
    useState("");

  const [paymentData, setPaymentData] =
    useState({
      amount: "",
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
      method: "Other",
      note: "",
    });

  const [paymentInfo, setPaymentInfo] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // Fetch invoices
  const fetchInvoices = async (
    searchValue = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/invoices",
        {
          params: {
            search: searchValue,
          },
        }
      );

      setInvoices(
        response.data.invoices
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Search invoices
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    fetchInvoices(value);
  };

  // Get payment history
  const fetchPaymentHistory =
    async (invoiceId) => {
      try {
        setHistoryLoading(true);
        setError("");

        const response =
          await api.get(
            `/payments/${invoiceId}`
          );

        setPaymentInfo(
          response.data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load payment history"
        );
      } finally {
        setHistoryLoading(false);
      }
    };

  // Select invoice
  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;

    setSelectedInvoice(invoiceId);
    setPaymentInfo(null);

    setPaymentData({
      amount: "",
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
      method: "Other",
      note: "",
    });

    if (invoiceId) {
      fetchPaymentHistory(
        invoiceId
      );
    }
  };

  // Payment input
  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Add payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!selectedInvoice) {
      setError(
        "Please select an invoice"
      );
      return;
    }

    if (
      !paymentData.amount ||
      Number(paymentData.amount) <= 0
    ) {
      setError(
        "Payment amount must be greater than 0"
      );
      return;
    }

    if (
      paymentInfo &&
      Number(paymentData.amount) >
        Number(
          paymentInfo.outstandingAmount
        )
    ) {
      setError(
        "Payment cannot be greater than outstanding amount"
      );
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/payments/${selectedInvoice}`,
        {
          amount: Number(
            paymentData.amount
          ),
          paymentDate:
            paymentData.paymentDate,
          method:
            paymentData.method,
          note:
            paymentData.note,
        }
      );

      setPaymentData({
        amount: "",
        paymentDate: new Date()
          .toISOString()
          .split("T")[0],
        method: "Other",
        note: "",
      });

      // Refresh history
      await fetchPaymentHistory(
        selectedInvoice
      );

      // Refresh invoice list
      await fetchInvoices(search);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add payment"
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedInvoiceData =
    invoices.find(
      (invoice) =>
        invoice._id ===
        selectedInvoice
    );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Payments
        </h1>

        <p className="text-gray-500 mt-1">
          Manage invoice payments and payment history
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <label className="block mb-2 font-medium">
          Search Invoice
        </label>

        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by invoice number, client name or company"
          className="w-full border rounded-lg px-4 py-3"
        />

        <p className="text-sm text-gray-500 mt-2">
          Example: INV-2026, Tejas Kale or company
          name
        </p>
      </div>

      {/* Invoice Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <label className="block mb-2 font-medium">
          Select Invoice
        </label>

        {loading ? (
          <p className="text-gray-500">
            Loading invoices...
          </p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-500">
            No invoices found.
          </p>
        ) : (
          <select
            value={selectedInvoice}
            onChange={
              handleInvoiceChange
            }
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">
              Select Invoice
            </option>

            {invoices.map(
              (invoice) => (
                <option
                  key={invoice._id}
                  value={invoice._id}
                >
                  {invoice.invoiceNumber}
                  {" - "}
                  {invoice.client?.name}
                  {" - ₹"}
                  {Number(
                    invoice.totalAmount
                  ).toLocaleString()}
                  {" - "}
                  {invoice.status}
                </option>
              )
            )}
          </select>
        )}
      </div>

      {/* Selected Invoice */}
      {selectedInvoice &&
        paymentInfo && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-gray-500">
                  Invoice Total
                </p>

                <p className="text-2xl font-bold mt-2">
                  ₹
                  {Number(
                    paymentInfo.invoice
                      .totalAmount
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-gray-500">
                  Total Paid
                </p>

                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₹
                  {Number(
                    paymentInfo.totalPaid
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-gray-500">
                  Outstanding
                </p>

                <p className="text-2xl font-bold text-red-600 mt-2">
                  ₹
                  {Number(
                    paymentInfo.outstandingAmount
                  ).toLocaleString()}
                </p>
              </div>

            </div>

            {/* Add Payment */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-semibold mb-5">
                Add Payment
              </h2>

              {selectedInvoiceData?.status ===
                "Draft" && (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-5">
                  Payment cannot be added to a
                  draft invoice.
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Amount */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Amount *
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={
                        paymentInfo.outstandingAmount
                      }
                      name="amount"
                      value={
                        paymentData.amount
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        selectedInvoiceData?.status ===
                        "Draft"
                      }
                      placeholder="Enter payment amount"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Payment Date
                    </label>

                    <input
                      type="date"
                      name="paymentDate"
                      value={
                        paymentData.paymentDate
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        selectedInvoiceData?.status ===
                        "Draft"
                      }
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>

                  {/* Method */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Payment Method
                    </label>

                    <select
                      name="method"
                      value={
                        paymentData.method
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        selectedInvoiceData?.status ===
                        "Draft"
                      }
                      className="w-full border rounded-lg px-4 py-3"
                    >
                      <option value="Cash">
                        Cash
                      </option>

                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="Card">
                        Card
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block mb-2 font-medium">
                      Note
                    </label>

                    <input
                      type="text"
                      name="note"
                      value={
                        paymentData.note
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        selectedInvoiceData?.status ===
                        "Draft"
                      }
                      placeholder="Optional note"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    selectedInvoiceData?.status ===
                      "Draft" ||
                    paymentInfo.outstandingAmount <=
                      0
                  }
                  className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg"
                >
                  {saving
                    ? "Adding Payment..."
                    : "Add Payment"}
                </button>
              </form>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm p-6">

              <h2 className="text-xl font-semibold mb-5">
                Payment History
              </h2>

              {historyLoading ? (
                <p className="text-gray-500">
                  Loading payment history...
                </p>
              ) : paymentInfo
                  .payments
                  .length === 0 ? (
                <p className="text-gray-500">
                  No payments found for this
                  invoice.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">

                    <thead>
                      <tr className="bg-gray-50 border-b">

                        <th className="text-left p-3">
                          Date
                        </th>

                        <th className="text-left p-3">
                          Amount
                        </th>

                        <th className="text-left p-3">
                          Method
                        </th>

                        <th className="text-left p-3">
                          Note
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {paymentInfo.payments.map(
                        (payment) => (
                          <tr
                            key={
                              payment._id
                            }
                            className="border-b"
                          >

                            <td className="p-3">
                              {new Date(
                                payment.paymentDate
                              ).toLocaleDateString()}
                            </td>

                            <td className="p-3 font-medium">
                              ₹
                              {Number(
                                payment.amount
                              ).toLocaleString()}
                            </td>

                            <td className="p-3">
                              {payment.method}
                            </td>

                            <td className="p-3 text-gray-600">
                              {payment.note ||
                                "-"}
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </>
        )}
    </div>
  );
};

export default PaymentPage;