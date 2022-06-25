const express = require("express");
const {
  newOrder,
  getSingleOrder,
  getMyAllOrders,
} = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/new").post(isAuthenticatedUser, newOrder);
router
  .route("/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);
router
  .route("/myOrders")
  .get(isAuthenticatedUser, getMyAllOrders);

module.exports = router;
