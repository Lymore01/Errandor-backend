const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const errorStatus = err.statusCode || 500;
  const errorMsg = err.message || "Internal Server Error";
  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
};

module.exports = errorHandler;
