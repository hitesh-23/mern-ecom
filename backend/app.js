const express = require("express");

const app = express();

const errorMiddleware = require("./middleware/error");

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

//Route Imports
const productRoute = require("./routes/productRoutes");
const userRoute = require("./routes/userRoutes");
const orderRoute = require("./routes/orderRoutes");

app.use("/api/v1", productRoute);

app.use("/api/v1/user", userRoute);

app.use("/api/v1/order", orderRoute);

//middleware for errors
app.use(errorMiddleware);

module.exports = app;
