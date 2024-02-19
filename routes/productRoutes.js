const express=require("express");
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails,createProductReview,getProductReview, deleteProductReview } = require("../Controller/productController");
const {isAuthenticated,AuthorizedRoles}=require("../middleware/auth");
const router=express.Router();
router.get("/products",isAuthenticated,getAllProducts);
router.post("/product/new",isAuthenticated,AuthorizedRoles("admin"),createProduct);
//put aur delete ka route same hi hai ek hi route me laga denge dono ko request put wali hogi to put me chala jayga nahi to delete wali hui to delete me
router.put("/product/:id",AuthorizedRoles("admin"),updateProduct).delete(deleteProduct).get("/product/:id",getProductDetails);
router.post("/product/createreview",isAuthenticated,createProductReview);
router.get("/product/getproductreview/:id",getProductReview);
router.delete("/product/deletereview/",isAuthenticated,deleteProductReview);
module.exports=router;
