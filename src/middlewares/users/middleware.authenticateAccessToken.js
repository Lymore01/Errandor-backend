const verifyAccessToken = require("../../api/validators/users/validators.verifyAccessToken");

const validateAccessToken = async (req, res, next) => {
  try {
    // the tokens comes from headers
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const result = await verifyAccessToken(token);

    if (!result.success) {
      return res.status(403).json({ error: result.error });
    }

    req.user = result.data;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = validateAccessToken;

/* 
{
    "email": "kellylimo@gmail.com",
    "password":"genlim@1234"
}
*/

