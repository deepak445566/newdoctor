export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // 2. Check credentials against environment variables
    if (email !== process.env.SELLER_EMAIL || password !== process.env.SELLER_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Create token (user की तरह)
    const token = jwt.sign({ 
      email: email,
      role: 'seller',
      sellerId: 'admin_seller'  // या कोई unique ID
    }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Set cookie (user की तरह)
    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Response (user की तरह)
    return res.json({
      success: true,
      message: "Logged in successfully",
      seller: {
        email: email,
        name: "Admin Seller", // या environment से नाम लें
        role: 'seller'
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};