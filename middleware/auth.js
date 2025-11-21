const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, "MY_SECRET_KEY");
    req.user = decoded;
    req.userId = decoded.id; // <-- HERE (IMPORTANT)
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
