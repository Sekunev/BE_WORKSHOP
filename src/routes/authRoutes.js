const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ahmet Yılmaz"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmet@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Kullanıcı başarıyla oluşturuldu"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: Hatalı istek
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
], handleValidationErrors, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmet@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Giriş başarılı"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir')
], handleValidationErrors, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Kullanıcı profil bilgileri
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Şifre değiştir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Hatalı istek
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gereklidir'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
], handleValidationErrors, changePassword);

module.exports = router;
