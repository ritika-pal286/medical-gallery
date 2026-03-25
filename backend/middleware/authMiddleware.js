import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: invalid or expired token",
      error: error.message,
    });
  }
};

export default authMiddleware;
