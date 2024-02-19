const express=require("express");
const {CreateUser,Login,LogOut,forgotPassword, resetPassword,getUserDetails,
updatePassword,UpdateUserProfile,getAllUsers,getSingleUserforAdmin,deleteUser,UpdateUserProfileByAdmin}=require("../Controller/userController");
const {isAuthenticated,AuthorizedRoles}=require("../middleware/auth");
const router=express.Router();
router.post("/registerUser",CreateUser);
router.post("/login",Login);
router.get("/logout",LogOut);
router.post("/forgot/password",forgotPassword);
router.post("/password/reset/:token",resetPassword);
router.post("/me",isAuthenticated,getUserDetails);
router.put("/me/updateprofile",isAuthenticated,UpdateUserProfile);
router.put("/updatepassword",isAuthenticated,updatePassword);
router.get("/admin/getallusers",isAuthenticated,AuthorizedRoles("admin"),getAllUsers);
router.get("/admin/userdetails/:id",isAuthenticated,AuthorizedRoles("admin"),getSingleUserforAdmin);
router.delete("/admin/deleteuser/:id",isAuthenticated,AuthorizedRoles("admin"),deleteUser);
router.put("/admin/updateuserprofile/:id",isAuthenticated,AuthorizedRoles("admin"),UpdateUserProfileByAdmin);
module.exports=router;