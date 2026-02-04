const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/orderController");

router.get("/", auth, controller.getAllOrders);
router.get("/:id", auth, controller.getOrderById);

router.post("/", auth, role("admin"), controller.createOrder);
router.put("/:id", auth, role("admin"), controller.updateOrder);
router.delete("/:id", auth, role("admin"), controller.deleteOrder);
router.patch("/:id/status", auth, controller.updateOrderStatusByUser);

router.post("/:id/items", auth, role("admin"), controller.addItemToOrder);
router.delete(
    "/:id/items/:productId",
    auth,
    role("admin"),
    controller.removeItemFromOrder
);

router.get(
    "/analytics/revenue-by-product",
    auth,
    role("admin"),
    controller.getRevenueByProduct
);

router.post("/place", auth, controller.placeOrder);


module.exports = router;
