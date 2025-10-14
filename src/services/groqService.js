const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Ücretsiz ve güçlü model

// Blog konuları dizisi
const blogKonulari = [
  "Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?",
  "2025'te Öne Çıkacak Teknoloji Trendleri",
  "Remote Çalışma Kültürü ve Verimlilik",
  "JavaScript ES2024 Yenilikleri",
  "Dijital Pazarlama Temelleri",
  "Online Eğitimde Başarı Sırları",
  "Yeni Nesil Öğrenme Platformları",
  "Kariyer Değişimi için Yol Haritası"
];

// Blog tarzları
const blogTarzlari = ['profesyonel', 'samimi', 'akademik', 'eğitici'];

// Hedef kitleler
const hedefKitleler = ['yeni başlayanlar', 'profesyoneller', 'öğrenciler'];

// Kelime sayıları
const kelimeSayilari = [800, 1200, 1500];

/**
 * Rastgele blog konusu seç
 */
const getRandomTopic = () => {
  return blogKonulari[Math.floor(Math.random() * blogKonulari.length)];
};

/**
 * Rastgele parametreler oluştur
 */
const getRandomParameters = () => {
  return {
    tarz: blogTarzlari[Math.floor(Math.random() * blogTarzlari.length)],
    kelimeSayisi: kelimeSayilari[Math.floor(Math.random() * kelimeSayilari.length)],
    hedefKitle: hedefKitleler[Math.floor(Math.random() * hedefKitleler.length)]
  };
};

/**
 * Markdown karakterlerini temizle
 */
const cleanMarkdown = (text) => {
  if (!text) return '';
  
  // JSON formatındaki content'i extract et
  let content = text;
  
  // Eğer JSON formatındaysa, content alanını çıkar
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Kontrol karakterlerini temizle
      let cleanedJson = jsonMatch[0]
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Kontrol karakterlerini kaldır
        .replace(/\n/g, '\\n') // Newline'ları escape et
        .replace(/\r/g, '\\r') // Carriage return'leri escape et
        .replace(/\t/g, '\\t'); // Tab'ları escape et
      
      const jsonData = JSON.parse(cleanedJson);
      if (jsonData.content) {
        content = jsonData.content;
      }
    }
  } catch (e) {
    // JSON parse edilemezse, orijinal text'i kullan
  }
  
  return content
    .replace(/#{1,6}\s+/g, '') // Başlık işaretlerini kaldır
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold işaretlerini kaldır
    .replace(/\*(.*?)\*/g, '$1') // Italic işaretlerini kaldır
    .replace(/`(.*?)`/g, '$1') // Inline kod işaretlerini kaldır
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Link metnini al
    .replace(/^[-*+]\s+/gm, '') // Liste işaretlerini kaldır
    .replace(/^\d+\.\s+/gm, '') // Numaralı liste işaretlerini kaldır
    .replace(/\n+/g, ' ') // Çoklu newline'ları tek space'e çevir
    .replace(/\s+/g, ' ') // Çoklu space'leri tek space'e çevir
    .trim();
};

/**
 * İçerikten temiz excerpt oluştur
 */
const createCleanExcerpt = (content, maxLength = 150) => {
  const cleaned = cleanMarkdown(content);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
};

/**
 * Blog prompt'u oluştur
 */
const createBlogPrompt = (konu, tarz, kelimeSayisi, hedefKitle) => {
  return `
KONU: "${konu}"
TARZ: ${tarz}
UZUNLUK: ${kelimeSayisi} kelime
HEDEF KİTLE: ${hedefKitle}

LÜTFEN ŞU FORMATTA BLOG YAZISI YAZ:
1. İlgi çekici başlık
2. Kısa giriş paragrafı
3. Ana başlıklar (H2) ve alt başlıklar (H3)
4. Maddeler halinde önemli noktalar
5. Özet ve sonuç bölümü
6. Okuyucuya soru veya çağrı

SEO uyumlu, akıcı bir dille yaz. Teknik terimleri açıkla.
SADECE TÜRKÇE YAZ.

Yanıtını şu JSON formatında ver:
{
  "title": "Blog başlığı",
  "content": "Blog içeriği (Markdown formatında)",
  "category": "Kategori",
  "tags": ["etiket1", "etiket2", "etiket3"]
}

ÖNEMLİ: excerpt alanı ekleme, ben otomatik oluşturacağım.
`;
};

/**
 * Groq API ile blog içeriği oluştur
 */
const generateBlogContent = async (konu = null, options = {}) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable bulunamadı');
    }

    // Parametreleri belirle
    const selectedKonu = konu || getRandomTopic();
    const params = options.randomize ? getRandomParameters() : {
      tarz: options.tarz || 'profesyonel',
      kelimeSayisi: options.kelimeSayisi || 1200,
      hedefKitle: options.hedefKitle || 'profesyoneller'
    };

    // Prompt oluştur
    const prompt = createBlogPrompt(
      selectedKonu,
      params.tarz,
      params.kelimeSayisi,
      params.hedefKitle
    );

    console.log(`Blog oluşturuluyor - Konu: ${selectedKonu}, Tarz: ${params.tarz}`);

    // Groq API çağrısı
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Sen profesyonel bir blog yazarısın. SEO uyumlu, ilgi çekici ve bilgilendirici içerikler üretiyorsun. Her zaman Türkçe yazıyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 saniye timeout
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Groq API geçersiz yanıt döndü');
    }

    const content = response.data.choices[0].message.content;

    // JSON yanıtı parse et
    let blogData;
    try {
      // JSON formatını bul
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Kontrol karakterlerini temizle (newline, tab vs.)
        let cleanedJson = jsonMatch[0]
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Kontrol karakterlerini kaldır
          .replace(/\n/g, '\\n') // Newline'ları escape et
          .replace(/\r/g, '\\r') // Carriage return'leri escape et
          .replace(/\t/g, '\\t'); // Tab'ları escape et
        
        blogData = JSON.parse(cleanedJson);
      } else {
        // JSON formatı yoksa, içeriği manuel olarak yapılandır
        blogData = {
          title: selectedKonu,
          content: content,
          category: 'Teknoloji',
          tags: ['yapay zeka', 'teknoloji', 'blog']
        };
      }
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      console.error('Ham içerik:', content.substring(0, 200));
      
      // Parse edilemezse, içeriği olduğu gibi kullan
      blogData = {
        title: selectedKonu,
        content: content,
        category: 'Teknoloji',
        tags: ['yapay zeka', 'teknoloji', 'blog']
      };
    }

    // Kategoriyi doğrula ve düzelt
    const validCategories = [
      'Teknoloji',
      'Yazılım Geliştirme',
      'Web Tasarım',
      'Mobil Uygulama',
      'Yapay Zeka',
      'Veri Bilimi',
      'Siber Güvenlik',
      'Diğer'
    ];
    
    if (!validCategories.includes(blogData.category)) {
      // Kategori geçersizse, konu bazlı otomatik kategori belirle
      if (selectedKonu.includes('Yapay Zeka')) {
        blogData.category = 'Yapay Zeka';
      } else if (selectedKonu.includes('JavaScript') || selectedKonu.includes('Teknoloji')) {
        blogData.category = 'Yazılım Geliştirme';
      } else if (selectedKonu.includes('Dijital') || selectedKonu.includes('Pazarlama')) {
        blogData.category = 'Teknoloji';
      } else {
        blogData.category = 'Diğer';
      }
    }

    // Temiz excerpt oluştur
    blogData.excerpt = createCleanExcerpt(blogData.content, 150);

    // Content'i düzelt - yan yana gelen ## karakterlerini ayır
    if (blogData.content) {
      blogData.content = blogData.content
        .replace(/##\s*###/g, '\n\n###') // ## ### kombinasyonunu ### yap ve öncesinde boş satır ekle
        .replace(/##([^#\n])/g, '## $1') // ## karakterinden sonra boşluk ekle (newline hariç)
        .replace(/###([^#\n])/g, '### $1') // ### karakterinden sonra boşluk ekle (newline hariç)
        .replace(/\n##/g, '\n\n##') // ## öncesinde boş satır ekle
        .replace(/\n###/g, '\n\n###') // ### öncesinde boş satır ekle
        .replace(/\n\n\n+/g, '\n\n'); // Çoklu boş satırları ikiye düşür
    }

    return {
      ...blogData,
      metadata: {
        konu: selectedKonu,
        tarz: params.tarz,
        kelimeSayisi: params.kelimeSayisi,
        hedefKitle: params.hedefKitle,
        model: GROQ_MODEL,
        generatedAt: new Date()
      }
    };

  } catch (error) {
    console.error('Groq API hatası:', error.response?.data || error.message);
    throw new Error(`Blog içeriği oluşturulamadı: ${error.message}`);
  }
};

/**
 * Tüm konulardan rastgele blog oluştur
 */
const generateRandomBlog = async () => {
  return await generateBlogContent(null, { randomize: true });
};

/**
 * Kalan blog konularını getir
 */
const getRemainingTopics = (usedTopics = []) => {
  return blogKonulari.filter(topic => !usedTopics.includes(topic));
};

module.exports = {
  generateBlogContent,
  generateRandomBlog,
  getRandomTopic,
  getRemainingTopics,
  blogKonulari
};

