const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const updateInvoiceStatus = async (invoice) => {
  const payments = await Payment.find({
    invoice: invoice._id,
    user: invoice.user
  });

  const totalPaid = payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  if (totalPaid >= invoice.totalAmount) {
    invoice.status = "Paid";
  } else if (new Date(invoice.dueDate) < new Date()) {
    invoice.status = "Overdue";
  } else {
    invoice.status = "Unpaid";
  }

  await invoice.save();

  return {
    totalPaid,
    outstandingAmount: Math.max(invoice.totalAmount - totalPaid, 0)
  };
};

const addPayment = async (req, res) => {
  try {
    const {
      amount,
      paymentDate,
      method = "Other",
      note
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0"
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.invoiceId,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    if (invoice.status === "Draft") {
      return res.status(400).json({
        message: "Payment cannot be added to a draft invoice"
      });
    }

    const existingPayments = await Payment.find({
      invoice: invoice._id,
      user: req.userId
    });

    const totalPaid = existingPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    const outstandingAmount = invoice.totalAmount - totalPaid;

    if (amount > outstandingAmount) {
      return res.status(400).json({
        message: "Payment cannot be greater than outstanding amount",
        outstandingAmount
      });
    }

    const payment = await Payment.create({
      user: req.userId,
      invoice: invoice._id,
      amount,
      paymentDate: paymentDate || new Date(),
      method,
      note
    });

    const paymentSummary = await updateInvoiceStatus(invoice);

    const populatedPayment = await Payment.findById(payment._id).populate(
      "invoice",
      "invoiceNumber totalAmount status"
    );

    res.status(201).json({
      message: "Payment added successfully",
      payment: populatedPayment,
      totalPaid: paymentSummary.totalPaid,
      outstandingAmount: paymentSummary.outstandingAmount,
      invoiceStatus: invoice.status
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add payment",
      error: error.message
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.invoiceId,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    const payments = await Payment.find({
      invoice: invoice._id,
      user: req.userId
    }).sort({ paymentDate: -1 });

    const totalPaid = payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    const outstandingAmount = Math.max(
      invoice.totalAmount - totalPaid,
      0
    );

    res.status(200).json({
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        status: invoice.status
      },
      totalPaid,
      outstandingAmount,
      payments
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment history",
      error: error.message
    });
  }
};

module.exports = {
  addPayment,
  getPaymentHistory
};