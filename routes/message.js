const router = require("express").Router();
const messageController = require("../controllers/messegesController");
const { protect } = require("../middleware/protected");

router.get("/:chatId", protect, messageController.allMessages);
router.post("/", protect, messageController.sendMessage);

module.exports = router;