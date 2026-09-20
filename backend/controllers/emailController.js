const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");
const {
  generateInvoicePdfBuffer
} = require("../utils/invoicePdf");

const sendInvoiceEmail = async (req, res) => {
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

    if (!invoice.client.email) {
      return res.status(400).json({
        message: "Client email is required to send invoice"
      });
    }

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const pdfBuffer = await generateInvoicePdfBuffer(invoice);

    const mail = await transporter.sendMail({
      from: `"InvoiceFlow" <${testAccount.user}>`,
      to: invoice.client.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: `Hello ${invoice.client.name},

Please find your invoice ${invoice.invoiceNumber} attached.

Invoice Amount: Rs. ${invoice.totalAmount.toFixed(2)}
Status: ${invoice.status}

Thank you,
InvoiceFlow`,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    const previewUrl = nodemailer.getTestMessageUrl(mail);

    res.status(200).json({
      message: "Invoice email sent successfully",
      previewUrl
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send invoice email",
      error: error.message
    });
  }
};

module.exports = {
  sendInvoiceEmail
};