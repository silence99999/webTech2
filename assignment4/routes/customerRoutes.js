const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/customerController");

router.get("/", controller.getAllCustomers);
router.get("/:id", controller.getCustomerById);

router.post("/", auth, role("admin"), controller.createCustomer);
router.put("/:id", auth, role("admin"), controller.updateCustomer);
router.delete("/:id", auth, role("admin"), controller.deleteCustomer);

module.exports = router;
