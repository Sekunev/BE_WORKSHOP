const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token doğrulama middleware
const protect = async (req, res, next) => {
  let token;

  // Authorization header'ını kontrol et
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı Bearer'dan ayır
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı veritabanından al
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Bu token için geçerli kullanıcı bulunamadı'
        });
      }

      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      
      // JWT hata türlerine göre mesaj döndür
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Geçersiz token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token süresi dolmuş'
        });
      }

      return res.status(401).json({
        status: 'error',
        message: 'Yetkilendirme başarısız'
      });
    }
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Token bulunamadı, erişim reddedildi'
    });
  }
};

// Admin yetkisi kontrolü
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmuyor'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
