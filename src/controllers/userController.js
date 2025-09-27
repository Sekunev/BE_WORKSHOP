const User = require('../models/User');
const Blog = require('../models/Blog');

// @desc    Tüm kullanıcıları getir (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments();
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    res.status(200).json({
      status: 'success',
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tek kullanıcı getir
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcının blog sayısını getir
    const blogCount = await Blog.countDocuments({ author: req.params.id });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toObject(),
          blogCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Profil güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'Profil başarıyla güncellendi',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcıyı sil (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kendi hesabını silmeye çalışıyor mu kontrol et
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Kendi hesabınızı silemezsiniz'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcının bloglarını getir
// @route   GET /api/users/:id/blogs
// @access  Public
const getUserBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Blog.countDocuments({ 
      author: req.params.id,
      isPublished: true 
    });

    const blogs = await Blog.find({ 
      author: req.params.id,
      isPublished: true 
    })
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .select('-content');

    res.status(200).json({
      status: 'success',
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        blogs
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'Avatar başarıyla güncellendi',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateProfile,
  deleteUser,
  getUserBlogs,
  updateAvatar
};
