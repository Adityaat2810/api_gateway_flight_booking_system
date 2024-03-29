const express = require('express');
const moragn = require('morgan');
const { rateLimit } = require("express-rate-limit");
const axios = require('axios')

const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express(); 

// basic server setup 
const PORT = 3010;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: ... , // Use an external store for more precise rate limiting
  });
  
app.use(limiter);

// morgan helps in maintaing the logs 
app.use(moragn('combined'))

app.use("/bookingService", async (req, res, next) => {
    try {
      const jwtToken = req.headers["x-access-token"];
      const response = await axios.get(
        "http://localhost:3001/api/v1/isAuthenticated",
        {
          headers: {
            "x-access-token": jwtToken,
          },
        }
      );
  
      console.log(response)
      if(response.data.success)
      {
          next();
      }
      else {
          return res.status(401).json({
              success : false,
              message :"Unauthorised",
              
          })
      }
  
    } catch (error) {
      console.log(error)
      throw {error }
    }
  });

app.use('/bookingservice',createProxyMiddleware({
    target:'http://localhost:3005',
    changeOrigin:true
   
}))

app.get('/home',(req,res)=>{
    console.log('first')
    return res.json({message:"Ok"})
})

app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
})
