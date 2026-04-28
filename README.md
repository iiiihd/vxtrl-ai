# ⚡ ViralTok AI

نظام توليد فيديوهات تيك توك فيروسية بالذكاء الاصطناعي

## التشغيل السريع

```bash
# 1. انسخ المفاتيح
cp .env.example .env
# عدّل .env وأضف مفاتيح OpenAI / ElevenLabs / Pexels

# 2. شغّل
npm start

# 3. افتح المتصفح
# http://localhost:3000
```

## يشتغل بدون مفاتيح (وضع تجريبي كامل)
```bash
npm start  # مباشرة بدون .env
```

## API Endpoints

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | /api/generate-full-video | ⭐ فكرة → فيديو كامل |
| POST | /api/generate-script | توليد السكريبت |
| POST | /api/generate-voice | توليد الصوت |
| POST | /api/get-videos | جلب مقاطع الفيديو |
| POST | /api/render-video | تصيير الفيديو |
| GET  | /api/health | فحص الحالة |

## مثال

```bash
curl -X POST http://localhost:3000/api/generate-full-video \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "أفضل 3 أدوات ذكاء اصطناعي في 2025",
    "language": "ar",
    "voice": "ar-gulf-male",
    "videoType": "listicle"
  }'
```

## هيكل المشروع
```
src/
├── server.js              — السيرفر الرئيسي
├── routes/
│   ├── full.js            — ⭐ one-shot endpoint
│   ├── script.js          — OpenAI GPT-4o
│   ├── voice.js           — ElevenLabs
│   ├── videos.js          — Pexels API
│   └── render.js          — FFmpeg
├── services/
│   ├── scriptService.js
│   ├── voiceService.js
│   ├── videoService.js
│   └── renderService.js
└── utils/viralScore.js
public/
├── index.html             — واجهة المستخدم
└── videos/                — الفيديوهات المنتجة
```
