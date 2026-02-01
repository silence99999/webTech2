const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/orderController");

router.get("/", auth,role("admin"), controller.getAllOrders);
router.get("/:id", auth,role("admin"), controller.getOrderById);

router.get("/my/orders",auth,controller.getMyOrders);

router.post("/", auth, controller.createOrder);
router.put("/:id", auth, controller.updateOrder);
router.delete("/:id", auth, controller.deleteOrder);

module.exports = router;
