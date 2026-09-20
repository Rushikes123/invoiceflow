const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const InvoiceCounter = require("../models/InvoiceCounter");

const {
  generateInvoicePdf
} = require("../utils/invoicePdf");

const calculateInvoice = require("../utils/invoiceCalculator");


// Generate invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const counter = await InvoiceCounter.findOneAndUpdate(
    { year },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  const sequence = counter.sequence
    .toString()
    .padStart(3, "0");

  return `INV-${year}-${sequence}`;
};


// Update overdue status
const updateOverdueStatus = (invoice) => {
  if (
    invoice.status !== "Paid" &&
    new Date(invoice.dueDate) < new Date()
  ) {
    invoice.status = "Overdue";
  }

  return invoice;
};


// CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const {
      client,
      issueDate,
      dueDate,
      items,
      taxPercentage = 0,
      discount = 0,
      status = "Unpaid"
    } = req.body;

    if (!client || !issueDate || !dueDate || !items) {
      return res.status(400).json({
        message:
          "Client, issue date, due date and items are required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message:
          "Invoice must contain at least one item"
      });
    }

    if (taxPercentage < 0 || discount < 0) {
      return res.status(400).json({
        message:
          "Tax and discount cannot be negative"
      });
    }

    const clientExists = await Client.findOne({
      _id: client,
      user: req.userId
    });

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    const calculatedInvoice = calculateInvoice(
      items,
      taxPercentage,
      discount
    );

    if (calculatedInvoice.totalAmount < 0) {
      return res.status(400).json({
        message:
          "Discount cannot be greater than the invoice amount"
      });
    }

    const invoiceNumber =
      await generateInvoiceNumber();

    const invoice = await Invoice.create({
      user: req.userId,
      client,
      invoiceNumber,
      issueDate,
      dueDate,
      ...calculatedInvoice,
      status
    });

    const populatedInvoice =
      await Invoice.findById(invoice._id).populate(
        "client",
        "name companyName email phone billingAddress gstNumber"
      );

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create invoice",
      error: error.message
    });
  }
};


// GET INVOICES
const getInvoices = async (req, res) => {
  try {
    const {
      search,
      client,
      status,
      date
    } = req.query;

    const filter = {
      user: req.userId
    };

    // Filter by client ID
    if (client) {
      filter.client = client;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by issue date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);

      endDate.setDate(
        endDate.getDate() + 1
      );

      filter.issueDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Search by invoice number OR client/company name
    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i"
      };

      // Find matching clients
      const matchingClients =
        await Client.find({
          user: req.userId,
          $or: [
            {
              name: searchRegex
            },
            {
              companyName: searchRegex
            }
          ]
        }).select("_id");

      const clientIds =
        matchingClients.map(
          (client) => client._id
        );

      filter.$or = [
        {
          invoiceNumber: searchRegex
        },
        {
          client: {
            $in: clientIds
          }
        }
      ];
    }

    const invoices = await Invoice.find(filter)
      .populate(
        "client",
        "name companyName email phone billingAddress gstNumber"
      )
      .sort({ createdAt: -1 });

    const updatedInvoices =
      invoices.map((invoice) => {
        updateOverdueStatus(invoice);
        return invoice;
      });

    res.status(200).json({
      count: updatedInvoices.length,
      invoices: updatedInvoices
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message
    });
  }
};


// GET SINGLE INVOICE
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate(
      "client",
      "name companyName email phone billingAddress gstNumber"
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    updateOverdueStatus(invoice);

    res.status(200).json({
      invoice
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error.message
    });
  }
};


// UPDATE INVOICE
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    const {
      client,
      issueDate,
      dueDate,
      items,
      taxPercentage,
      discount,
      status
    } = req.body;

    if (client !== undefined) {
      const clientExists =
        await Client.findOne({
          _id: client,
          user: req.userId
        });

      if (!clientExists) {
        return res.status(404).json({
          message: "Client not found"
        });
      }

      invoice.client = client;
    }

    if (issueDate !== undefined) {
      invoice.issueDate = issueDate;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

    if (items !== undefined) {
      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "Invoice must contain at least one item"
        });
      }

      const calculatedInvoice =
        calculateInvoice(
          items,
          taxPercentage !== undefined
            ? taxPercentage
            : invoice.taxPercentage,
          discount !== undefined
            ? discount
            : invoice.discount
        );

      if (
        calculatedInvoice.totalAmount < 0
      ) {
        return res.status(400).json({
          message:
            "Discount cannot be greater than the invoice amount"
        });
      }

      invoice.items =
        calculatedInvoice.items;

      invoice.subtotal =
        calculatedInvoice.subtotal;

      invoice.taxPercentage =
        calculatedInvoice.taxPercentage;

      invoice.taxAmount =
        calculatedInvoice.taxAmount;

      invoice.discount =
        calculatedInvoice.discount;

      invoice.totalAmount =
        calculatedInvoice.totalAmount;
    } else if (
      taxPercentage !== undefined ||
      discount !== undefined
    ) {
      const calculatedInvoice =
        calculateInvoice(
          invoice.items,
          taxPercentage !== undefined
            ? taxPercentage
            : invoice.taxPercentage,
          discount !== undefined
            ? discount
            : invoice.discount
        );

      if (
        calculatedInvoice.totalAmount < 0
      ) {
        return res.status(400).json({
          message:
            "Discount cannot be greater than the invoice amount"
        });
      }

      invoice.subtotal =
        calculatedInvoice.subtotal;

      invoice.taxPercentage =
        calculatedInvoice.taxPercentage;

      invoice.taxAmount =
        calculatedInvoice.taxAmount;

      invoice.discount =
        calculatedInvoice.discount;

      invoice.totalAmount =
        calculatedInvoice.totalAmount;
    }

    if (status !== undefined) {
      invoice.status = status;
    }

    updateOverdueStatus(invoice);

    await invoice.save();

    const updatedInvoice =
      await Invoice.findById(
        invoice._id
      ).populate(
        "client",
        "name companyName email phone billingAddress gstNumber"
      );

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update invoice",
      error: error.message
    });
  }
};


// DELETE INVOICE
const deleteInvoice = async (req, res) => {
  try {
    const invoice =
      await Invoice.findOne({
        _id: req.params.id,
        user: req.userId
      });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete invoice",
      error: error.message
    });
  }
};


// DOWNLOAD PDF
const downloadInvoicePdf = async (
  req,
  res
) => {
  try {
    const invoice =
      await Invoice.findOne({
        _id: req.params.id,
        user: req.userId
      }).populate(
        "client",
        "name companyName email phone billingAddress gstNumber"
      );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    updateOverdueStatus(invoice);

    generateInvoicePdf(
      invoice,
      res
    );
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to generate invoice PDF",
      error: error.message
    });
  }
};


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf
};