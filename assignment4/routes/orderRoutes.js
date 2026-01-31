const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/orderController");

router.get("/", auth, controller.getAllOrders);
router.get("/:id", auth, controller.getOrderById);

router.post("/", auth, role("admin"), controller.createOrder);
router.put("/:id", auth, role("admin"), controller.updateOrder);
router.delete("/:id", auth, role("admin"), controller.deleteOrder);

module.exports = router;
