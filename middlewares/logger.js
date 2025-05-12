const LoggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url } = req;
  console.log(`[${timestamp}] ${method} ${url} - IP: ${req.ip}`);

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${method} ${url} Response: ${res.statusCode} - IP: ${req.ip} - Duration: ${duration}ms`
    );
  });
  next();
};

module.exports = LoggerMiddleware;
