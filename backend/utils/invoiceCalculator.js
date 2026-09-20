const calculateInvoice = (items, taxPercentage = 0, discount = 0) => {
  const calculatedItems = items.map((item) => {
    const amount = item.quantity * item.rate;

    return {
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount
    };
  });

  const subtotal = calculatedItems.reduce(
    (total, item) => total + item.amount,
    0
  );

  const taxAmount = (subtotal * taxPercentage) / 100;

  const totalAmount = subtotal + taxAmount - discount;

  return {
    items: calculatedItems,
    subtotal,
    taxPercentage,
    taxAmount,
    discount,
    totalAmount
  };
};

module.exports = calculateInvoice;