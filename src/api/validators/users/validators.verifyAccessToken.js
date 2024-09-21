const jwt = require("jsonwebtoken")

const verifyAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = verifyAccessToken;
