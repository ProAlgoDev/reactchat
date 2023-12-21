const router = require("express").Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/protected");

router.get("/get-me", protect, userController.getMe);
router.patch("/update-me", protect, userController.updateMe);
router.get("/get-all-verified-users", protect, userController.getAllVerifiedUsers);
router.get("/get-users", protect, userController.getUsers);
router.get("/", protect, userController.allUsers);

module.exports = router;
