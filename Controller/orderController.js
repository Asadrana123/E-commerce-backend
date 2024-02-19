const orderModel = require("../model/orderModel");
const Errorhandler = require("../utils/errorhandler");
const products=require("../model/productModel");
const catchAsyncError = require("../middleware/catchAsyncError");
exports.createOrder = catchAsyncError(
    async (req, res, next) => {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;
        const createdOrder = await orderModel.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            user:req.user._id,
            paidAt:Date.now()
        })
        return res.status(200).json({success:true,
            createdOrder
        })
    }
)
// When you hear about "populating" in the context of MongoDB and Mongoose, 
// it usually refers to the process of retrieving referenced documents from other 
// collections and replacing the references with the actual documents.
// This is particularly useful when you have relationships between documents in different collections.

//get order by id
exports.getSingleOrder=catchAsyncError(
    async(req,res,next)=>{
        const getOrder=await orderModel.findById(req.params.id).populate("user","name email");
        if(!getOrder){
            return next(new Errorhandler("No order found with this id"));
        }
        return res.status(200).json({
            success:true,
            OrderedItem:getOrder
        })
    }
)
//get all orders ordered by particuler user
exports.getOrderedItemsbyUser=catchAsyncError(
    async(req,res,next)=>{
        console.log(req.params);
        const orders=await orderModel.find({user:req.params.id})
        if(!orders){
            return next(new Errorhandler("No orders found with this id"));
        }
        return res.status({sucess:true,orders});
    }
)
//get all orders
exports.getallOrder=catchAsyncError(
    async(req,res,next)=>{
            const orders=await orderModel.find();
            if(!orders){
                next(new Errorhandler("No orders present"));
            }
            let totalamount=0;
            orders.forEach((order)=>{
               totalamount+=order.totalPrice;
            })
            return res.status(200).json({success:true,
             totalamount,
             orders
            })
    }
)
//update Order Status
exports.updateOrder=catchAsyncError(
    async(req,res,next)=>{
        const order=await orderModel.findById(req.params.id);
        if(order.orderStatus==="Delivered"){
            return res.status(200).json({sucess:true,
                message:"Order is Delivered"
            })
        }
        order.orderItems.forEach(async(item)=>{
           await updateStock(item.product,item.quantity);
        })
        order.orderStatus=req.body.status;
        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
          }
        
          await order.save({ validateBeforeSave: false });
          res.status(200).json({
            success: true,
            order
          });
    }
)
async function updateStock(id,quantity){
       const product=await products.findById(id);
       product.Stock-=quantity;
       await product.save({ validateBeforeSave: false });
}
//delete order
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
  
    if (!order) {
      return next(new Errorhandler("Order not found with this Id", 404));
    }
  
    await order.remove();
  
    res.status(200).json({
      success: true,
    });
  });
