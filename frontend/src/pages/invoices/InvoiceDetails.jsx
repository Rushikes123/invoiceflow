import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/invoices/${id}`);

        setInvoice(response.data.invoice);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Loading invoice...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>

        <button
          onClick={() => navigate("/invoices")}
          className="mt-4 bg-gray-200 px-4 py-2 rounded-lg"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }
  const handleDownloadPdf = async () => {
  try {
    const response = await api.get(
      `/invoices/${id}/pdf`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Failed to download PDF"
    );
  }
};

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Invoice Details
          </h1>

          <p className="text-gray-500 mt-1">
            {invoice.invoiceNumber}
          </p>
        </div>

       <div className="flex gap-3">
  <button
    onClick={handleDownloadPdf}
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
  >
    Download PDF
  </button>

  <Link
    to={`/invoices/edit/${invoice._id}`}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
  >
    Edit
  </Link>

  <button
    onClick={() => navigate("/invoices")}
    className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg"
  >
    Back
  </button>
</div>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 border-b pb-6">

          <div>
            <h2 className="text-3xl font-bold text-blue-600">
              InvoiceFlow
            </h2>

            <p className="text-gray-500 mt-2">
              Invoice Management System
            </p>
          </div>

          <div className="md:text-right">
            <h3 className="text-xl font-semibold">
              {invoice.invoiceNumber}
            </h3>

            <p className="text-gray-600 mt-2">
              Issue Date:{" "}
              {formatDate(invoice.issueDate)}
            </p>

            <p className="text-gray-600">
              Due Date:{" "}
              {formatDate(invoice.dueDate)}
            </p>

            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : invoice.status === "Overdue"
                  ? "bg-red-100 text-red-700"
                  : invoice.status === "Draft"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b">

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Bill To
            </h3>

            <p className="font-medium">
              {invoice.client?.name}
            </p>

            {invoice.client?.companyName && (
              <p className="text-gray-600">
                {invoice.client.companyName}
              </p>
            )}

            {invoice.client?.email && (
              <p className="text-gray-600">
                {invoice.client.email}
              </p>
            )}

            {invoice.client?.phone && (
              <p className="text-gray-600">
                {invoice.client.phone}
              </p>
            )}

            {invoice.client?.billingAddress && (
              <p className="text-gray-600 mt-2">
                {invoice.client.billingAddress}
              </p>
            )}

            {invoice.client?.gstNumber && (
              <p className="text-gray-600 mt-2">
                GST: {invoice.client.gstNumber}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Invoice Information
            </h3>

            <p className="text-gray-600">
              Status:{" "}
              <span className="font-medium text-gray-800">
                {invoice.status}
              </span>
            </p>

            <p className="text-gray-600">
              Issue Date:{" "}
              {formatDate(invoice.issueDate)}
            </p>

            <p className="text-gray-600">
              Due Date:{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="py-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Invoice Items
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3">
                    Description
                  </th>

                  <th className="text-center p-3">
                    Quantity
                  </th>

                  <th className="text-right p-3">
                    Rate
                  </th>

                  <th className="text-right p-3">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b"
                  >
                    <td className="p-3">
                      {item.description}
                    </td>

                    <td className="p-3 text-center">
                      {item.quantity}
                    </td>

                    <td className="p-3 text-right">
                      ₹{Number(item.rate).toLocaleString()}
                    </td>

                    <td className="p-3 text-right font-medium">
                      ₹{Number(item.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end border-t pt-6">
          <div className="w-full md:w-96 space-y-3">

            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span>
                ₹
                {Number(
                  invoice.subtotal
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Tax ({invoice.taxPercentage}%)
              </span>

              <span>
                ₹
                {Number(
                  invoice.taxAmount
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount
              </span>

              <span>
                - ₹
                {Number(
                  invoice.discount
                ).toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>

              <span>
                ₹
                {Number(
                  invoice.totalAmount
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="mt-6 flex gap-3">
        <Link
          to={`/invoices/edit/${invoice._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          Edit Invoice
        </Link>

        <button
          onClick={() => navigate("/invoices")}
          className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg"
        >
          Back to Invoices
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetails;