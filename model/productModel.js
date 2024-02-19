const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product name"]
    },
    description: {
        type: String,
        required: [true, "Please Enter product Description"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter product Description"],
        maxLength: [8, "Price can not exceed 8 chareacters"]
    },
    rating: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category:{
          type:String,
          required:[true,"Please Enter Product category"],
    },
    Stock:{
        type:Number,
        required:[true,"Please Enter product Stock"],
        maxLength:[4,"Stock cannot exceed characters"],
        deafult:1
    },
    numofReviews:{
        type:Number,
        deafult:0
    },
    reviews:[
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "userModel",
                required: true,
              },
              name:{
                type:String,
                required:true,
              },
              rating:{
                 type:Number,
                 required:true
              },
              comment:{
                type:String,
                required:true
              } 
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "userModel",
        required: true,
      },
    createAt:{
          type:Date,
          default:Date.now
    }
})
module.exports=mongoose.model("Product",productSchema);