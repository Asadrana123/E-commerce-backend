const products=require("../model/productModel");
const Errorhandler = require("../utils/errorhandler");
const apiFeature=require("../utils/apiFeature");
const catchAsyncError=require("../middleware/catchAsyncError");
const productModel = require("../model/productModel");
//Create Product
exports.createProduct= catchAsyncError(
     async(req,res,next)=>{
          req.body.user=req.user._id;
          const newproduct=await products.create(req.body);
          return res.status(201).json({success:true,
             newproduct
           })
      }
) 
//getproducts
exports.getAllProducts=catchAsyncError(
     async (req,res,next)=>{
          const temp=new apiFeature(products.find(),req.query).search();
          const allProducts=await temp.query;
          if(!allProducts)  return next (new Errorhandler("No products present",404));
          return res.status(201).json({success:true,allProducts});
     }
) 
//updateproduct
exports.updateProduct=catchAsyncError(
     async (req,res,next)=>{
          let findproduct=await products.findById(req.params.id);
          if(!findproduct){
                return next(new Errorhandler("Product not found",404));
          } 
          findproduct=await products.findByIdAndUpdate(req.params.id,req.body,{
                new:true,
                runValidators:true,
          })
          return res.status(201).json({
               success:true,
               product:findproduct
          })
}
) 
exports.deleteProduct=catchAsyncError(
     async(req,res,next)=>{
          let findproduct=await products.findById(req.params.id);
          if(!findproduct){
               return next(new Errorhandler("Product not found",500));
          }
         await findproduct.deleteOne();
          return res.status(200).json({
               message:"Product deleted",
               success:"true"
          })
    }
) 
exports.getProductDetails=catchAsyncError(
     async(req,res,next)=>{
          let findproduct=await products.findById(req.params.id);
          if(!findproduct){
               return next(new Errorhandler("Product not found",500));
          }
          return res.status(200).json({
               success:true,
               productDetails:findproduct
          })
     }
)
exports.createProductReview=catchAsyncError(
     async(req,res,next)=>{
           const review={
             user:req.user._id,
             name:req.body.name,
             rating:Number(req.body.rating),
             comment:req.body.comment
           }
           const product=await products.findById(req.body.productId);
           if(!product){
               next(new Errorhandler(`Product ID--${req.body.productId} not valid`))
           }
           const ispreviouslyReviewedbythisuser=product.reviews.find((review)=>{
               return review.user.equals(req.user._id)
           });
           if(ispreviouslyReviewedbythisuser){
               product.reviews.forEach((currentreview,index)=>{
                    if(currentreview.user.equals(req.user._id)){
                          let totalpreviousrating=product.reviews.length*product.rating;
                          let totalnewrating=totalpreviousrating-currentreview.rating+Number(req.body.rating);
                          let newavgrating=totalnewrating/product.reviews.length;
                          product.rating=newavgrating;
                          product.comment=req.body.comment;
                          product.reviews[index].rating=Number(req.body.rating);
                    }
               }) 
           }
           else{
               let newsumofallrating=product.rating*product.reviews.length+Number(req.body.rating);
               product.rating=newsumofallrating/(product.reviews.length+1);
               product.reviews.push(review);
           }
           await product.save();
           return res.status(200).json({
               message:"Review created successfully",
               product,
           })
     }
 )
 exports.getProductReview=catchAsyncError(
     async(req,res,next)=>{
          const product=await productModel.findById(req.params.id);
          if(!product){
               next(new Errorhandler("No Product found with provided id"));
          }
          res.status(200).json({
               success:true,
               reviews:product.reviews
          })
     }
)
//req.params vs req.query 
// It is used to extract route parameters from the URL.
// Route parameters are placeholders in the URL pattern specified when defining a route.
// For example, in the route definition app.get('/users/:id', ...), :id is a route parameter.
//---
// //It is used to extract query parameters from the URL.
// Query parameters are key-value pairs appended to the end of a URL after the "?" character.
// For example, in the URL /search?query=express&category=node, query and category are query parameters.
exports.deleteProductReview=catchAsyncError(
     async(req,res,next)=>{
          const product=await productModel.findById(req.query.productId);
          if(!product){
               next(new Errorhandler("No Product found with provided id"));
          }
          const reviewsafterfilter=product.reviews.filter((currentreview)=>currentreview.id.toString()!=req.query.reviewId.toString())
          product.reviews=reviewsafterfilter;
          await product.save();
          res.status(200).json({
               success:true,
               product
          }) 
     }
)