const userModel=require("../model/userModel");
const catchAsyncError=require("../middleware/catchAsyncError");
const Errorhandler=require("../utils/errorhandler");
const sendToken=require("../utils/getToken");
const sendEmail=require("../utils/sendEmail");
exports.CreateUser=catchAsyncError(
     async(req,res)=>{
        const newUser =await userModel.create(req.body);
       sendToken(newUser,201,res);
     }
)
exports.Login=catchAsyncError(
    async(req,res,next)=>{
           const {email,password}=req.body;
           const finduser=await userModel.findOne({email}).select("+password");
           if(!finduser) return  next(new Errorhandler("Invalid Email or Password",400));
           const matchPassword=finduser.comparePassword(password);
          if(!matchPassword) return  next(new Errorhandler("Invalid Email or Password",400));
           sendToken(finduser,200,res);
    }
)
//catchAsyncError is a middleware function or wrapper that handles asynchronous errors.
//next (next middleware function in the Express pipeline).
//httpOnly: true: Ensures that the cookie is only accessible through HTTP(S) and cannot be accessed by client-side JavaScript, adding a layer of security.
exports.LogOut=catchAsyncError(
  async(req,res,next)=>{
    res.cookie("token",null,{
      httpOnly:true,
      expires: new Date(Date.now())
    })
    return res.status(200).json({success:true,message:"User Logout successfully"})
  }
)
exports.forgotPassword=catchAsyncError(
    async(req,res,next)=>{
        const {email}=req.body;
        const User=await userModel.findOne({email});
        if(!User){
          return next(new Errorhandler("No user found with this email",404));
        }
        const resetPasswordtoken=User.getResetPasswordToken();
        await User.save({validateBeforeSave:false});
        console.log(User);
        const resetUrl=`${req.protocol}://${req.get("host")}/api/user/password/reset/${resetPasswordtoken}`; 
        const message=`Your reset password token is:- /n/n ${resetUrl}, if You have not requested then please ignore it`
        try{
                await sendEmail({
                  email:req.body.email,
                  message:message,
                  subject:"Email password recovery"
                })  
                res.status(200).json({
                  success:true,
                  message:"Recovery Email sent to user"
                })
        }catch(error){
            User.resetPasswordToken=undefined;
            User.resetPasswordExpire=undefined;
            await User.save({validation:false});
            return next(new Errorhandler(error.message,500));
        }
    }
)
exports.resetPassword=catchAsyncError(
     async(req,res,next)=>{
         const resetPasswordToken=require("crypto").createHash("sha256").update(req.params.token).digest("hex");
         console.log(resetPasswordToken);
         const User=await userModel.findOne({resetPasswordToken,
          resetPasswordExpire:{$gt:Date.now()}
        })
        if(!User){
            return next(new Errorhandler("resetPassword token is invalid or has been expired",400));
        }
        if(req.body.password!==req.body.confirmpassword){
          return next(new Errorhandler("Password is not matching",400))
        }
        User.password=req.body.password;
        User.resetPasswordToken=undefined;
        User.resetPasswordExpire=undefined;
        await User.save({validateBeforeSave:false})
        sendToken(User,200,res);
     }
)
//User Details
//circuler error means await is not added
exports.getUserDetails=catchAsyncError(
        async(req,res)=>{
            const User=await userModel.findById(req.user.id);
            res.status(200).json({
              sucess:true,
              User
            })
        }
)
exports.updatePassword=catchAsyncError(
   async(req,res)=>{
        const User=await userModel.findById(req.user.id).select("+password");
        const isMatchPassword=User.comparePassword(req.body.oldpassword);
        if(!isMatchPassword){
          return next(new Errorhandler("OldPassword is wrong",400));
        }
        if(req.body.newpassword!==req.body.confirmpassword){
          return next(new Errorhandler("Passwords not matching",400));
        }
        User.password=req.body.newpassword;
        await User.save();
        sendToken(User,200,res);
   }
)
/*db.collection.findAndModify({
  query: <query>,
  sort: <sort>,
  update: <update>,
  options: <options>
});
<query>: The query to identify the document to be modified.
<sort>: Optional. Specifies the order in which to sort the documents that match the query.
<update>: The modifications to apply to the document.
<options>: Optional. Additional options such as specifying whether to return the original or modified document, whether to perform upsert (insert if not exists), etc.
*/
/*{ useFindAndModify: false } explicitly opts not to use the deprecated findAndModify command, 
which is a best practice for more recent versions of */

//update profile or role
exports.UpdateUserProfile=catchAsyncError(
    async(req,res)=>{
        const newUserProfile={
          name:req.body.name,
          email:req.body.email,
        } 
        console.log(req.body.name,req.body.email);
        const user=await userModel.findByIdAndUpdate(req.user.id,newUserProfile,{
           new:true,
           runValidators:true,
           useFindandModify:false
        }) 
        return res.status(200).json({
          success:true,
          user,
        })
    }
)
//get all users admin
exports.getAllUsers=catchAsyncError(
   async(req,res)=>{
           const allusers=await userModel.find();
           return res.status(200).json({success:true,allusers})
   }
)
//get single user admin
exports.getSingleUserforAdmin=catchAsyncError(
   async(req,res,next)=>{
      const user=await userModel.findById(req.params.id);
      if(!user){
           next(new Errorhandler(`user not found with this ${req.params.id}`));
      }
      return res.status(200).json({
          success:true,
          user
      })
   }
)
exports.deleteUser=catchAsyncError(
    async(req,res,next)=>{
        const user=await userModel.findById(req.params.id);
        if(!user){
            next(new Errorhandler(`User not found with this id-- ${req.params.id}`));
        }
        await user.deleteOne();
        return res.status(200).json({success:true,message:"User Removed Successfullyy"})
    }
)
exports.UpdateUserProfileByAdmin=catchAsyncError(
  async(req,res)=>{
      const newUserProfile={
        role:req.body.role
      } 
      const user=await userModel.findByIdAndUpdate(req.params.id,newUserProfile,{
         new:true,
         runValidators:true,
         useFindandModify:false
      }) 
      return res.status(200).json({
        success:true,
        user,
      })
  }
)
