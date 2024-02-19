const express=require("express");
const app=express();
const dotenv=require("dotenv");
const cookieparser=require("cookie-parser");
dotenv.config();
const port=process.env.PORT;
const productRoutes=require("./routes/productRoutes");
const userRoutes=require("./routes/userRoutes");
const orderRoutes=require("./routes/orderRoutes");
const connectDatabase=require("./Config/dataBase");
const errorMiddleware=require("./middleware/error");
connectDatabase();
//unhandledexception error
process.on("uncaughtException",(err)=>{
     console.log(`unhandled exception ${err.msg}`);
     console.log("server shutting down due to unhandled exception");
          process.exit(1);
})
app.use(express.json());
app.use(cookieparser());
app.use("/api/v1/",productRoutes);
app.use("/api/user",userRoutes);
app.use("/api/order/",orderRoutes)
app.use(errorMiddleware);
const server=app.listen(port,()=>{
     console.log(`app running on ${port}`);
})
//unhandled promise rejection
process.on("unhandledRejection",(err)=>{
     console.log(`unhandled Promise Rejection ${err}`);
     console.log("Server shutting down due to Promise Rejection");
     server.close(()=>{
          process.exit(1);
     })
})
