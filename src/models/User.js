const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [50, 'İsim 50 karakterden fazla olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir e-posta adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // Şifre varsayılan olarak sorgularda döndürülmez
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio 500 karakterden fazla olamaz'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Şifreyi hash'le (kaydetmeden önce)
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmemişse devam et
  if (!this.isModified('password')) {
    next();
  }

  // Şifreyi hash'le
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token oluşturma metodu
UserSchema.methods.getSignedJwtToken = function() {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  });
  
  // Token süresini hesapla
  const expiresAt = new Date();
  if (expiresIn.endsWith('d')) {
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
  } else if (expiresIn.endsWith('h')) {
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
  } else if (expiresIn.endsWith('m')) {
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
  }
  
  return {
    token,
    expiresAt,
    expiresIn
  };
};

// Refresh token oluşturma metodu
UserSchema.methods.getRefreshToken = function() {
  const refreshToken = jwt.sign({ id: this._id, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  return {
    refreshToken,
    expiresAt
  };
};

module.exports = mongoose.model('User', UserSchema);
