const Order = require("../models/orderModels");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErros = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//Create a new Order
exports.newOrder = catchAsyncErros(async (req, res, next) => {
  const {
    shippingInfo,
    orderedItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderedItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({ success: true });
});

//get single order item
exports.getSingleOrder = catchAsyncErros(async (req, res, next) => {
  const order = await Order.findById(req.params.id.toString()).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order does not exist", 404));
  }

  res.status(200).json({ success: true, order });
});

//get logged in user orders
exports.getMyAllOrders = catchAsyncErros(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return next(new ErrorHandler("Order does not exist", 404));
  }

  res.status(200).json({ success: true, orders });
});
