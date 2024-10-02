 const express = require("express");

 const {
     registerUser,
     authUser,
     allUsers,
     allMember,
     deleteUser,
     updateUser
 } = require("../controllers/userControllers");
 const { protect } = require("../middleware/authMiddleware");

 const router = express.Router();

 router.route("/").get(protect, allUsers);
 router.route("/").post(registerUser);
 router.route("/member").get(protect, allMember);
 router.route("/update").post(protect, updateUser);
 router.post("/login", authUser);
 router.route('/delete').post(protect, deleteUser);



 module.exports = router;