const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Message = require('../models/messageModel')
const generateToken = require("../config/generateToken");
const mongoose = require('mongoose');
const Chat = require("../models/chatModel");
//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public


const deleteUser = asyncHandler(async(req, res) => {
    const { _id } = req.body;


    const deleteUser = await User.findOneAndDelete({ _id: _id });
    const deleteSme = await Message.deleteMany({ sender: _id })
    console.log(deleteSme);
    const deleteChat = await Chat.deleteMany({ users: { _id } })
    console.log(deleteChat);

    if (deleteUser) {
        res.send(deleteUser);
    } else {
        res.status(401);
        throw new Error("user not found");
    }

})


const allMember = asyncHandler(async(req, res) => {


    const users = await User.find({}).find({ _id: { $ne: req.user._id } }).select('name phoneNumber responsiblity').exec();
    res.send(users);
    console.log(users)
});

const allUsers = asyncHandler(async(req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { phoneNumber: { $regex: req.query.search, $options: "i" } },
        ],
    } : {};
    console.log(keyword);
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async(req, res) => {

    const userErrorHandller = (userError) => {
        res.send(userError);

    }

    const {
        name,
        phoneNumber,
        responsiblity,
        password,
        pic,
    } = req.body;

    if (!name || !phoneNumber || !password || !responsiblity) {
        res.status(400);
        userError += 'ሁሉንም ቅጽ በትክክል አልሞሉም!';
        userErrorHandller(userError);
        throw new Error("Please Enter all the Feilds");

    }

    const userExists = await User.findOne({ phoneNumber });

    if (userExists) {
        res.status(400);
        userError = "ስልክ ቁጥሩ ካሁን በፊት ተመዝግቧል እባክዎ ስልክ ቁጥር ቀይረው እንደገና ይሞክሩ!";
        userErrorHandller(userError);
        throw new Error("User already exists");

    }

    const user = await User.create({
        name,
        phoneNumber,
        password,
        responsiblity,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            superAdmin: user.superAdmin,
            isAdmin: user.isAdmin,
            pic: user.pic,
            // token: generateToken(user._id),
        });
    } else {
        res.status(400);
        userError = 'አዲስ ደበኛ መመዝገብ አልቻሉም እባክዎ እንደገና ዪሞክሩ! ';
        userErrorHandller(userError);

        throw new Error("failed to create new user");

    }
    // if (userError.length > 0) {
    //     console.log(userError);
    //     res.send(userError)
    // }
});

//update user info
const updateUser = asyncHandler(async(req, res) => {

    const userErrorHandller = (userError) => {
        res.send(userError);

    }

    const {
        name,
        eId,
        phoneNumber,
        responsiblity,
        password,
        pic,
    } = req.body;



    var user = null;

    if (password) {
        user = await User.updateOne({ _id: eId }, {
            name,
            phoneNumber,
            password,
            responsiblity,
            pic,
        });
    } else if (!password) {
        user = await User.updateOne({ _id: eId }, {
            name,
            phoneNumber,
            responsiblity,
            pic,
        });
    }




    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            superAdmin: user.superAdmin,
            isAdmin: user.isAdmin,
            pic: user.pic,
            // token: generateToken(user._id),
        });
    } else {
        res.status(400);
        userError = 'አዲስ ደበኛ መመዝገብ አልቻሉም እባክዎ እንደገና ዪሞክሩ! ';
        userErrorHandller(userError);

        throw new Error("failed to create new user");

    }
    // if (userError.length > 0) {
    //     console.log(userError);
    //     res.send(userError)
    // }
});
//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async(req, res) => {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            responsiblity: user.responsiblity,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");

    }
});

module.exports = { deleteUser, allMember, registerUser, authUser, allUsers, updateUser };