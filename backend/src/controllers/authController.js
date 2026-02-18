import jwt from 'jsonwebtoken';

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Check credentials against environment variables
    if (email !== process.env.SELLER_EMAIL || password !== process.env.SELLER_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign(
      { 
        email: email,
        role: 'admin'
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Response
    return res.json({
      success: true,
      message: "Logged in successfully",
      admin: {
        email: email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Admin Auth
export const checkAdminAuth = async (req, res) => {
  try {
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.json({ 
        success: false, 
        message: "Not authorized - No token found" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.role === 'admin' && decoded.email === process.env.SELLER_EMAIL) {
      return res.json({
        success: true,
        admin: {
          email: decoded.email,
          role: 'admin'
        },
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Not a valid admin" 
      });
    }
  } catch (error) {
    console.log(error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.json({ success: false, message: "Token expired" });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.json({ success: false, message: "Invalid token" });
    }
    
    return res.json({ success: false, message: error.message });
  }
};

// Admin Logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};