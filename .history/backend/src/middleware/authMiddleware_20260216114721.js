import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  const { adminToken } = req.cookies;

  if (!adminToken) {
    return res.json({
      success: false,
      message: "Not Authorized"
    });
  }

  try {
    const tokenDecode = jwt.verify(adminToken, process.env.JWT_SECRET);
    
    if (tokenDecode.role === 'admin' && tokenDecode.email === process.env.SELLER_EMAIL) {
      req.admin = { 
        email: tokenDecode.email,
        role: 'admin'
      };
      next();
    } else {
      return res.json({
        success: false,
        message: "Not authorized"
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "Invalid Token"
    });
  }
};

export default authAdmin;