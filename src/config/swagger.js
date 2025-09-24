const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'Modern Blog API sistemi - Node.js, Express, MongoDB',
      contact: {
        name: 'Abdullah',
        email: 'abdullah@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Kullanıcı adı'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Şifre (minimum 6 karakter)'
            }
          }
        },
        Blog: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: {
              type: 'string',
              description: 'Blog başlığı'
            },
            content: {
              type: 'string',
              description: 'Blog içeriği'
            },
            excerpt: {
              type: 'string',
              description: 'Blog özeti'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Blog etiketleri'
            },
            category: {
              type: 'string',
              description: 'Blog kategorisi'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Hata mesajı'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // API route dosyalarının yolu
};

const specs = swaggerJSDoc(options);
module.exports = specs;
