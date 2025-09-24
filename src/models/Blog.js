const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden fazla olamaz']
  },
  content: {
    type: String,
    required: [true, 'İçerik gereklidir'],
    minlength: [50, 'İçerik en az 50 karakter olmalıdır']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Özet 300 karakterden fazla olamaz']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Kategori gereklidir'],
    enum: [
      'Teknoloji',
      'Yazılım Geliştirme',
      'Web Tasarım',
      'Mobil Uygulama',
      'Yapay Zeka',
      'Veri Bilimi',
      'Siber Güvenlik',
      'Diğer'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // dakika cinsinden
    default: 1
  },
  slug: {
    type: String,
    unique: true,
    sparse: true // null değerlere izin ver
  }
}, {
  timestamps: true
});

// Slug oluşturma (kaydetmeden önce)
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    // Türkçe karakterleri dönüştür
    const turkishChars = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    
    let slug = this.title;
    
    // Türkçe karakterleri değiştir
    for (const [turkish, english] of Object.entries(turkishChars)) {
      slug = slug.replace(new RegExp(turkish, 'g'), english);
    }
    
    // Slug oluştur
    this.slug = slug
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Özel karakterleri kaldır
      .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
      .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
      .replace(/^-|-$/g, ''); // Başta ve sonda tire varsa kaldır
    
    // Eğer slug boşsa, ID kullan
    if (!this.slug) {
      this.slug = this._id ? this._id.toString() : 'blog-' + Date.now();
    }
  }
  
  // Okuma süresini hesapla (ortalama 200 kelime/dakika)
  if (this.content) {
    const wordCount = this.content.split(' ').length;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Yayınlanma tarihi ayarla
BlogSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// İndeksler
BlogSchema.index({ title: 'text', content: 'text' });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Blog', BlogSchema);
