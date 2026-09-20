const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const getDashboard = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.userId
    })
      .populate("client", "name companyName")
      .sort({ createdAt: -1 });

    const payments = await Payment.find({
      user: req.userId
    });

    const paymentMap = {};

    payments.forEach((payment) => {
      const invoiceId = payment.invoice.toString();

      if (!paymentMap[invoiceId]) {
        paymentMap[invoiceId] = 0;
      }

      paymentMap[invoiceId] += payment.amount;
    });

    const today = new Date();

    invoices.forEach((invoice) => {
      const totalPaid = paymentMap[invoice._id.toString()] || 0;

      if (totalPaid >= invoice.totalAmount) {
        invoice.status = "Paid";
      } else if (new Date(invoice.dueDate) < today) {
        invoice.status = "Overdue";
      } else if (invoice.status !== "Draft") {
        invoice.status = "Unpaid";
      }
    });

    const totalInvoices = invoices.length;

    const totalBilledAmount = invoices.reduce(
      (total, invoice) => total + invoice.totalAmount,
      0
    );

    const totalPaidAmount = payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    const outstandingAmount = Math.max(
      totalBilledAmount - totalPaidAmount,
      0
    );

    const recentInvoices = invoices.slice(0, 5).map((invoice) => {
      const totalPaid = paymentMap[invoice._id.toString()] || 0;

      return {
        ...invoice.toObject(),
        totalPaid,
        outstandingAmount: Math.max(
          invoice.totalAmount - totalPaid,
          0
        )
      };
    });

    res.status(200).json({
      totalInvoices,
      totalBilledAmount,
      totalPaidAmount,
      outstandingAmount,
      recentInvoices
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

module.exports = {
  getDashboard
};