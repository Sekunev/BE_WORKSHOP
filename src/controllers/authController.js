const jwt = require('jsonwebtoken');

const User = require('../models/User');

// @desc    Kullanıcı kayıt
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password
    });

    // Token'ları oluştur
    const tokenData = user.getSignedJwtToken();
    const refreshTokenData = user.getRefreshToken();

    res.status(201).json({
      status: 'success',
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        accessToken: {
          token: tokenData.token,
          expiresAt: tokenData.expiresAt,
          expiresIn: tokenData.expiresIn
        },
        refreshToken: {
          token: refreshTokenData.refreshToken,
          expiresAt: refreshTokenData.expiresAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcı giriş
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // E-posta ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'E-posta ve şifre gereklidir'
      });
    }

    // Kullanıcıyı şifre ile birlikte bul
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz kimlik bilgileri'
      });
    }

    // Şifre kontrolü
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz kimlik bilgileri'
      });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();

    // Token'ları oluştur
    const tokenData = user.getSignedJwtToken();
    const refreshTokenData = user.getRefreshToken();

    res.status(200).json({
      status: 'success',
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          lastLogin: user.lastLogin
        },
        accessToken: {
          token: tokenData.token,
          expiresAt: tokenData.expiresAt,
          expiresIn: tokenData.expiresIn
        },
        refreshToken: {
          token: refreshTokenData.refreshToken,
          expiresAt: refreshTokenData.expiresAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcı profil bilgilerini getir
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Şifre değiştir
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Mevcut şifreyi kontrol et
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Mevcut şifre yanlış'
      });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token gereklidir'
      });
    }

    // Refresh token'ı doğrula
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz refresh token'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Yeni token'ları oluştur
    const tokenData = user.getSignedJwtToken();
    const refreshTokenData = user.getRefreshToken();

    res.status(200).json({
      status: 'success',
      message: 'Token yenilendi',
      data: {
        accessToken: {
          token: tokenData.token,
          expiresAt: tokenData.expiresAt,
          expiresIn: tokenData.expiresIn
        },
        refreshToken: {
          token: refreshTokenData.refreshToken,
          expiresAt: refreshTokenData.expiresAt
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz refresh token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token süresi dolmuş'
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  refreshToken
};
