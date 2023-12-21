const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const Chat = require("../models/chat");

/*
 *  @description     Create or fetch One to One Chat
 *  @route           POST /api/chat/
 *  @access          Protected
 */
exports.accessChat = catchAsync(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.status(400).json({
            "message": "Invalid Request"
        });
    }

    if (userId === req.user._id) {
        console.log("UserId must be different");
        return res.status(400).json({
            "message": "Invalid Request"
        });
    }

    const userTo = await User.findOne({
        _id: userId,
    });
    if (!userTo) {
        console.log("No Such User Exists");
        return res.status(400).json({
            "message": "Invalid Request"
        });
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "firstName lastName _id email avatar about status").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "firstName lastName _id email avatar about status",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {

        let chatData = {
            chatName: "OneToOne",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "firstName lastName _id email avatar about status"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

/*
 *  @description     Fetch common chats between users
 *  @route           GET /api/common/:userId/
 *  @access          Protected
 */
exports.fetchCommonGroups = catchAsync(async (req, res) => {
    try {
        Chat.find({ users: { $all: [req.user._id, req.params.userId] }, isGroupChat: true })
            // .populate("users", "firstName lastName _id email avatar about status")
            // .populate("groupAdmin", "firstName lastName _id email avatar about status")
            // .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                // console.log(results);
                results.forEach((cht, index) => {
                    let filtered_users = cht.users;
                    filtered_users = filtered_users.filter(user => {
                        return !(user._id.equals(req.user._id));
                    })
                    results[index].users = filtered_users;
                })
                // results = await User.populate(results, {
                //     path: "latestMessage.sender",
                //     select: "firstName lastName _id email avatar about status",
                // });
                res.status(200).send(results);
            })

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

/*
 *  @description     Fetch all chats for a user
 *  @route           GET /api/chat/
 *  @access          Protected
 */
exports.fetchChats = catchAsync(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "firstName lastName _id email avatar about status")
            .populate("groupAdmin", "firstName lastName _id email avatar about status")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                // console.log(results);
                results.forEach((cht, index) => {
                    let filtered_users = cht.users;
                    filtered_users = filtered_users.filter(user => {
                        return !(user._id.equals(req.user._id));
                    })
                    results[index].users = filtered_users;
                })
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "firstName lastName _id email avatar about status",
                });
                res.status(200).send(results);
            })

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

/*
 *  @description     Fetch details of a Chat
 *  @route           GET /api/chat/:chatId
 *  @access          Protected
 */
exports.fetchThisChat = catchAsync(async (req, res) => {
    try {
        Chat.findOne({ _id: req.params.chatId })
            .populate("users", "firstName lastName _id email avatar about status")
            .populate("groupAdmin", "firstName lastName _id email avatar about status")
            .then(async (results) => {
                let filtered_users = results.users;
                filtered_users = filtered_users.filter(user => {
                    return !(user._id.equals(req.user._id));
                })
                results.users = filtered_users;
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

/*
 *  @description     Create New Group Chat
 *  @route           POST /api/chat/group
 *  @access          Protected
 */
exports.createGroupChat = catchAsync(async (req, res) => {

    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.unshift(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        await Chat.findOne({ _id: groupChat._id })
            .populate("users", "firstName lastName _id email avatar about status")
            .populate("groupAdmin", "firstName lastName _id email avatar about status")
            .then(async (results) => {
                let filtered_users = results.users;
                filtered_users = filtered_users.filter(user => {
                    return !(user._id.equals(req.user._id));
                })
                results.users = filtered_users;
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

/*
 *  @description     Rename Group
 *  @route           PUT /api/chat/rename
 *  @access          Protected
 */
exports.renameGroup = catchAsync(async (req, res) => {

    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true },
    ).populate("users", "firstName lastName _id email avatar about status")
        .populate("groupAdmin", "firstName lastName _id email avatar about status");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

/*
 *  @description     Remove user from Group
 *  @route           PUT /api/chat/group-remove
 *  @access          Protected
 */
exports.removeFromGroup = catchAsync(async (req, res) => {

    const { chatId, userId } = req.body;

    // check if the requester is admin
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    ).populate("users", "firstName lastName _id email avatar about status")
        .populate("groupAdmin", "firstName lastName _id email avatar about status");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
});

/*
 *  @description     Add user to Group / Leave
 *  @route           PUT /api/chat/group-add
 *  @access          Protected
 */
exports.addToGroup = catchAsync(async (req, res) => {

    const { chatId, userId } = req.body;

    // check if the requester is admin
    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    ).populate("users", "firstName lastName _id email avatar about status")
        .populate("groupAdmin", "firstName lastName _id email avatar about status");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});
