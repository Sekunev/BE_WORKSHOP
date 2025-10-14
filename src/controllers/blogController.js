const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { generateBlogContent, generateRandomBlog, getRemainingTopics, blogKonulari } = require('../services/groqService');

// @desc    Tüm blogları getir
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filtreleme
    let query = { isPublished: true };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const total = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .select('-content'); // İçeriği listelemede gösterme

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

// @desc    Tek blog getir
// @route   GET /api/blogs/:slug
// @access  Public
const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name avatar bio');

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog bulunamadı'
      });
    }

    // Görüntülenme sayısını artır
    blog.viewCount += 1;
    await blog.save();

    // Blog yorumlarını getir
    const comments = await Comment.find({ 
      blog: blog._id,
      isApproved: true 
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        blog: {
          ...blog.toObject(),
          comments
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni blog oluştur
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    // Yazar bilgisini ekle
    req.body.author = req.user.id;

    const blog = await Blog.create(req.body);

    await blog.populate('author', 'name avatar');

    res.status(201).json({
      status: 'success',
      message: 'Blog başarıyla oluşturuldu',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Blog güncelle
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog bulunamadı'
      });
    }

    // Kullanıcı blog sahibi mi veya admin mi kontrol et
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bu blog için yetkiniz bulunmuyor'
      });
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name avatar');

    res.status(200).json({
      status: 'success',
      message: 'Blog başarıyla güncellendi',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Blog sil
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog bulunamadı'
      });
    }

    // Kullanıcı blog sahibi mi veya admin mi kontrol et
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bu blog için yetkiniz bulunmuyor'
      });
    }

    // Blog yorumlarını da sil
    await Comment.deleteMany({ blog: req.params.id });

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Blog başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcının kendi bloglarını getir
// @route   GET /api/blogs/my-blogs
// @access  Private
const getMyBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Blog.countDocuments({ author: req.user.id });

    const blogs = await Blog.find({ author: req.user.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

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

// @desc    Blog beğen
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog bulunamadı'
      });
    }

    // Beğeni sayısını artır
    blog.likeCount += 1;
    await blog.save();

    res.status(200).json({
      status: 'success',
      message: 'Blog beğenildi',
      data: {
        likeCount: blog.likeCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Blog kategorilerini getir
// @route   GET /api/blogs/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });

    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Popüler etiketleri getir
// @route   GET /api/blogs/tags
// @access  Public
const getPopularTags = async (req, res, next) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        tags: tags.map(tag => ({ name: tag._id, count: tag.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI ile blog oluştur
// @route   POST /api/blogs/ai/generate
// @access  Private/Admin
const generateAIBlog = async (req, res, next) => {
  try {
    // Sadece admin kullanıcılar AI blog oluşturabilir
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmuyor'
      });
    }

    const { konu, tarz, kelimeSayisi, hedefKitle, autoPublish } = req.body;

    // AI ile blog içeriği oluştur
    const aiContent = await generateBlogContent(konu, {
      tarz,
      kelimeSayisi,
      hedefKitle
    });

    // Blog oluştur
    const blogData = {
      title: aiContent.title,
      content: aiContent.content,
      excerpt: aiContent.excerpt,
      category: aiContent.category || 'Teknoloji',
      tags: aiContent.tags || [],
      author: req.user.id,
      isPublished: autoPublish === true,
      publishedAt: autoPublish === true ? new Date() : null,
      aiGenerated: true,
      aiMetadata: aiContent.metadata
    };

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name avatar');

    res.status(201).json({
      status: 'success',
      message: 'AI blog başarıyla oluşturuldu',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rastgele AI blog oluştur
// @route   POST /api/blogs/ai/generate-random
// @access  Private/Admin
const generateRandomAIBlog = async (req, res, next) => {
  try {
    // Sadece admin kullanıcılar AI blog oluşturabilir
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmuyor'
      });
    }

    const { autoPublish } = req.body;

    // Rastgele AI blog oluştur
    const aiContent = await generateRandomBlog();

    // Blog oluştur
    const blogData = {
      title: aiContent.title,
      content: aiContent.content,
      excerpt: aiContent.excerpt,
      category: aiContent.category || 'Teknoloji',
      tags: aiContent.tags || [],
      author: req.user.id,
      isPublished: autoPublish === true,
      publishedAt: autoPublish === true ? new Date() : null,
      aiGenerated: true,
      aiMetadata: aiContent.metadata
    };

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name avatar');

    res.status(201).json({
      status: 'success',
      message: 'Rastgele AI blog başarıyla oluşturuldu',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mevcut blog konularını getir
// @route   GET /api/blogs/ai/topics
// @access  Private/Admin
const getAITopics = async (req, res, next) => {
  try {
    // Kullanılmış konuları bul
    const usedBlogs = await Blog.find({ aiGenerated: true }).select('aiMetadata.konu');
    const usedTopics = usedBlogs
      .filter(blog => blog.aiMetadata?.konu)
      .map(blog => blog.aiMetadata.konu);

    const remainingTopics = getRemainingTopics(usedTopics);

    res.status(200).json({
      status: 'success',
      data: {
        allTopics: blogKonulari,
        usedTopics,
        remainingTopics,
        totalTopics: blogKonulari.length,
        usedCount: usedTopics.length,
        remainingCount: remainingTopics.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI bloglarını getir
// @route   GET /api/blogs/ai/blogs
// @access  Private/Admin
const getAIBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { aiGenerated: true };

    const total = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

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

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  likeBlog,
  getCategories,
  getPopularTags,
  generateAIBlog,
  generateRandomAIBlog,
  getAITopics,
  getAIBlogs
};
