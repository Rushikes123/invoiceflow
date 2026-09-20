const Client = require("../models/Client");

const createClient = async (req, res) => {
  try {
    const { name, companyName, email, phone, billingAddress, gstNumber } =
      req.body;

    if (!name) {
      return res.status(400).json({
        message: "Client name is required"
      });
    }

    const client = await Client.create({
      user: req.userId,
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber
    });

    res.status(201).json({
      message: "Client created successfully",
      client
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create client",
      error: error.message
    });
  }
};

const getClients = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      user: req.userId
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: clients.length,
      clients
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message
    });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    res.status(200).json({
      client
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch client",
      error: error.message
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    const { name, companyName, email, phone, billingAddress, gstNumber } =
      req.body;

    if (name !== undefined) client.name = name;
    if (companyName !== undefined) client.companyName = companyName;
    if (email !== undefined) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (billingAddress !== undefined) client.billingAddress = billingAddress;
    if (gstNumber !== undefined) client.gstNumber = gstNumber;

    await client.save();

    res.status(200).json({
      message: "Client updated successfully",
      client
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update client",
      error: error.message
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    const Invoice = require("../models/Invoice");

    const invoiceExists = await Invoice.exists({
      client: client._id,
      user: req.userId
    });

    if (invoiceExists) {
      return res.status(409).json({
        message: "Client cannot be deleted because invoices exist for this client"
      });
    }

    await client.deleteOne();

    res.status(200).json({
      message: "Client deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete client",
      error: error.message
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};