const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { findOne } = require("../models/messageModel");
const axios = require('axios');

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async(req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic phoneNumber")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async(req, res) => {
    const { content, chatId, allowSms } = req.body;
    //how to allow sms by the user for only for he need to notifiy using sms ,using botton on send onclick send to user 
    //that allow us to read the data
    //const {allowSms}=req.body;
    // const { users, groupChat } = await Chat.find({ _id: chatId }).select('users isGroupChat -_id').exec();
    const users = await Chat.findOne({ _id: chatId }).populate({ path: 'users' })
    if (allowSms) {
        const len = users.users.length;
        for (let i = 0; i < len; i++) {
            if (users.users[i]._id.toString() == req.user._id) {
                continue;
            } else {
                users.users[i]._id.toString()


                try {
                    const response = await axios.post("https://api.negarit.net/api/api_request/sent_message?API_KEY=PiHCcSYwdvLdzfpdhhgQqxm3etJgTsHK", {
                        API_KEY: "PiHCcSYwdvLdzfpdhhgQqxm3etJgTsHK",
                        sent_to: users.users[i].phoneNumber,
                        message: content + ' click the link to replay https://localhost:3000',
                        campaign_id: "447"
                    });
                    // 

                } catch (err) {
                    res.status(500).json({ message: err });
                }

            }
        }
    }






    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic phoneNumber",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };