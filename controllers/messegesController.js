const catchAsync = require("../utils/catchAsync");
const Message = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat");

/*
 *  @description     Get all Messages
 *  @route           GET /api/Message/:chatId
 *  @access          Protected
 */
exports.allMessages = catchAsync(async (req, res) => {

    try {
        const messages = await Message.find({
            chat: req.params.chatId
        }).populate("sender", "firstName lastName _id email avatar about")
            .populate("chat");

        res.json(messages);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

});

/*
 *  @description     Create New Message
 *  @route           POST /api/message/
 *  @access          Protected
 */
exports.sendMessage = catchAsync(async (req, res) => {
    const { content, chatId, type } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.status(400).json({
            "message": "Invalid Request"
        });
    }

    const chat2 = await Chat.findOne({
        _id: chatId,
    });
    if (!chat2) {
        console.log("No Such Chat Exists");
        return res.status(400).json({
            "message": "Invalid Request"
        });
    }


    // await Message.findOne().sort('-created_at').exec(async (err, mess) => {
    //     let flag = (mess === null);
    //     if (!flag) {
    //         let date = new Date(mess.createdAt)
    //         let today = new Date()
    //         today = new Date(today.toDateString())
    //         let yesterday = new Date().setDate(today.getDate() - 1)
    //         flag = (!(date > today) & date > yesterday);
    //     }
    //     if (flag) {
    //         await Message.create({
    //             sender: req.user._id,
    //             content: " ",
    //             chat: chatId,
    //             type: "Divider"
    //         })
    //     }
    // });


    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        type: type,
    };

    try {

        let message = await Message.create(newMessage);

        message = await message.populate("sender", "firstName lastName _id email avatar about");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "firstName lastName _id email avatar about status",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        res.status(200).json(message);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
