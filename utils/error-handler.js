const errorHandler = (err, req, res, next) => {
    // default to 500 server error
    return res.status(500).json({ status: 'error', message: err.message });
  };
  
  module.exports = errorHandler;