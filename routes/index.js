const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");
const chatRoute = require("./chat");
const messageRoute = require("./message");

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/chat", chatRoute);
router.use("/message", messageRoute);

module.exports = router;