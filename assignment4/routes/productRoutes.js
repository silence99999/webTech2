const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/productController");

router.get("/", controller.getAll);
router.post("/", auth, role("admin"), controller.create);
router.put("/:id", auth, role("admin"), controller.update);
router.delete("/:id", auth, role("admin"), controller.remove);

module.exports = router;
