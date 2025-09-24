const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Yorum içeriği gereklidir'],
    trim: true,
    maxlength: [1000, 'Yorum 1000 karakterden fazla olamaz']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Blog'daki yorum sayısını güncelle
CommentSchema.post('save', async function() {
  const Blog = mongoose.model('Blog');
  await Blog.findByIdAndUpdate(this.blog, {
    $inc: { commentCount: 1 }
  });
});

// Blog'daki yorum sayısını azalt
CommentSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Blog = mongoose.model('Blog');
  await Blog.findByIdAndUpdate(this.blog, {
    $inc: { commentCount: -1 }
  });
});

module.exports = mongoose.model('Comment', CommentSchema);
