import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     if (decoded.role !== "artist") {
      return res.status(403).json({
        success: false,
        message: "Forbidden only artist can create music",
      });
    }
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};
 export const protectUser = (req,res,next)=>{
   const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

try {
  
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
if (decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden only user can access",
      });
    }


   res.user = decoded;
   next();





} catch (error) {
   return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
}



 }