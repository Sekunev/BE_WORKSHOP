const express = require('express');
const { body } = require('express-validator');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  likeBlog,
  getCategories,
  getPopularTags
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Tüm blogları getir
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Blog kategorisi
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Blog etiketi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama terimi
 *     responses:
 *       200:
 *         description: Bloglar başarıyla getirildi
 */
router.get('/', getBlogs);

/**
 * @swagger
 * /api/blogs/categories:
 *   get:
 *     summary: Blog kategorilerini getir
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla getirildi
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/blogs/tags:
 *   get:
 *     summary: Popüler etiketleri getir
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Etiketler başarıyla getirildi
 */
router.get('/tags', getPopularTags);

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Tek blog getir
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: Blog başarıyla getirildi
 *       404:
 *         description: Blog bulunamadı
 */
/**
 * @swagger
 * /api/blogs/my-blogs:
 *   get:
 *     summary: Kullanıcının kendi bloglarını getir
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sayfa başına kayıt sayısı
 *     responses:
 *       200:
 *         description: Bloglar başarıyla getirildi
 */
router.get('/my-blogs', protect, getMyBlogs);

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Tek blog getir
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: Blog başarıyla getirildi
 *       404:
 *         description: Blog bulunamadı
 */
router.get('/:slug', getBlog);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Yeni blog oluştur
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Node.js ile Modern Backend Geliştirme"
 *               content:
 *                 type: string
 *                 example: "Bu blog yazısında Node.js ile modern backend geliştirme..."
 *               excerpt:
 *                 type: string
 *                 example: "Node.js kullanarak modern bir backend API nasıl geliştirilir?"
 *               category:
 *                 type: string
 *                 enum: ["Teknoloji", "Yazılım Geliştirme", "Web Tasarım", "Mobil Uygulama", "Yapay Zeka", "Veri Bilimi", "Siber Güvenlik", "Diğer"]
 *                 example: "Yazılım Geliştirme"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nodejs", "express", "mongodb"]
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Blog başarıyla oluşturuldu
 *       400:
 *         description: Hatalı istek
 */
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Başlık 5-100 karakter arasında olmalıdır'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('İçerik en az 50 karakter olmalıdır'),
  body('category')
    .isIn(['Teknoloji', 'Yazılım Geliştirme', 'Web Tasarım', 'Mobil Uygulama', 'Yapay Zeka', 'Veri Bilimi', 'Siber Güvenlik', 'Diğer'])
    .withMessage('Geçerli bir kategori seçiniz'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Etiketler array formatında olmalıdır')
], handleValidationErrors, createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Blog güncelle
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog başarıyla güncellendi
 *       403:
 *         description: Yetkiniz bulunmuyor
 *       404:
 *         description: Blog bulunamadı
 */
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Başlık 5-100 karakter arasında olmalıdır'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('İçerik en az 50 karakter olmalıdır'),
  body('category')
    .optional()
    .isIn(['Teknoloji', 'Yazılım Geliştirme', 'Web Tasarım', 'Mobil Uygulama', 'Yapay Zeka', 'Veri Bilimi', 'Siber Güvenlik', 'Diğer'])
    .withMessage('Geçerli bir kategori seçiniz')
], handleValidationErrors, updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Blog sil
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog başarıyla silindi
 *       403:
 *         description: Yetkiniz bulunmuyor
 *       404:
 *         description: Blog bulunamadı
 */
router.delete('/:id', protect, deleteBlog);

/**
 * @swagger
 * /api/blogs/{id}/like:
 *   post:
 *     summary: Blog beğen
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog beğenildi
 *       404:
 *         description: Blog bulunamadı
 */
router.post('/:id/like', protect, likeBlog);

module.exports = router;
