const router = require("express").Router();

const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/protected");


router.post("/", protect, chatController.accessChat);
router.get("/", protect, chatController.fetchChats);
router.get("/common/:userId", protect, chatController.fetchCommonGroups);
router.get("/:chatId", protect, chatController.fetchThisChat);
router.post("/group", protect, chatController.createGroupChat);
router.put("/rename", protect, chatController.renameGroup);
router.put("/group-remove", protect, chatController.removeFromGroup);
router.put("/group-add", protect, chatController.addToGroup);

module.exports = router;