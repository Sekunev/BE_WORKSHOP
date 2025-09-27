const express = require('express');
const { body } = require('express-validator');
const { 
  getUsers, 
  getUser, 
  updateProfile, 
  deleteUser, 
  getUserBlogs 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları getir (Admin)
 *     tags: [Users]
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
 *         description: Kullanıcılar başarıyla getirildi
 *       403:
 *         description: Admin yetkisi gerekli
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Tek kullanıcı getir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla getirildi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get('/:id', protect, getUser);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Profil güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmet Yılmaz"
 *               bio:
 *                 type: string
 *                 example: "Yazılım geliştirici"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 */
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio 500 karakterden fazla olamaz'),
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Geçerli bir URL giriniz')
], handleValidationErrors, updateProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Kullanıcıyı sil (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 *       403:
 *         description: Admin yetkisi gerekli
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

/**
 * @swagger
 * /api/users/{id}/blogs:
 *   get:
 *     summary: Kullanıcının bloglarını getir
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
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
 *         description: Kullanıcının blogları başarıyla getirildi
 */
router.get('/:id/blogs', getUserBlogs);

module.exports = router;
