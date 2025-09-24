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

    // Token oluştur
    const token = user.getSignedJwtToken();

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
        token
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

    // Token oluştur
    const token = user.getSignedJwtToken();

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
        token
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

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
