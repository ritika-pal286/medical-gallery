import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";
const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PASSWORD = "admin123";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        email: ADMIN_EMAIL,
        role: "admin",
      },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

export const verifyToken = async (req, res) => {
  return res.status(200).json({
    message: "Token is valid",
    user: req.user,
  });
};
