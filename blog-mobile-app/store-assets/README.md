# Store Listing Assets

## Google Play Store Assets

### Required Images
1. **App Icon**
   - Size: 512x512px
   - Format: PNG (no transparency)
   - 32-bit PNG with alpha channel

2. **Feature Graphic**
   - Size: 1024x500px
   - Format: JPG or PNG (no transparency)
   - Used in store listings and promotions

3. **Screenshots**
   - Phone: 320px-3840px (min width/height)
   - 7-inch Tablet: 1024px-7680px
   - 10-inch Tablet: 1024px-7680px
   - At least 2 screenshots required, up to 8 allowed
   - Format: JPG or PNG (no transparency)

4. **Promo Video (Optional)**
   - YouTube video URL
   - 30 seconds to 2 minutes

### Store Listing Text
- **App Title**: Max 50 characters
- **Short Description**: Max 80 characters  
- **Full Description**: Max 4000 characters
- **Keywords**: Relevant for ASO (App Store Optimization)

## Apple App Store Assets

### Required Images
1. **App Icon**
   - Size: 1024x1024px
   - Format: PNG (no transparency, no alpha channel)

2. **Screenshots**
   - iPhone 6.7": 1290x2796px or 2796x1290px
   - iPhone 6.5": 1242x2688px or 2688x1242px  
   - iPhone 5.5": 1242x2208px or 2208x1242px
   - iPad Pro (6th gen) 12.9": 2048x2732px or 2732x2048px
   - iPad Pro (2nd gen) 12.9": 2048x2732px or 2732x2048px
   - At least 1 screenshot required, up to 10 allowed per device type

3. **App Preview (Optional)**
   - Video format: .mov, .mp4, or .m4v
   - Length: 15-30 seconds
   - Various resolutions for different devices

### Store Listing Text
- **App Name**: Max 30 characters
- **Subtitle**: Max 30 characters
- **Description**: Max 4000 characters
- **Keywords**: Max 100 characters (comma-separated)
- **What's New**: Max 4000 characters (for updates)

## Asset Organization

```
store-assets/
├── google-play/
│   ├── icon-512x512.png
│   ├── feature-graphic-1024x500.png
│   ├── screenshots/
│   │   ├── phone/
│   │   ├── tablet-7/
│   │   └── tablet-10/
│   └── descriptions/
│       ├── title.txt
│       ├── short-description.txt
│       └── full-description.txt
├── app-store/
│   ├── icon-1024x1024.png
│   ├── screenshots/
│   │   ├── iphone-6.7/
│   │   ├── iphone-6.5/
│   │   ├── iphone-5.5/
│   │   └── ipad-pro/
│   └── descriptions/
│       ├── name.txt
│       ├── subtitle.txt
│       ├── description.txt
│       └── keywords.txt
└── common/
    ├── privacy-policy.md
    └── terms-of-service.md
```

## Content Guidelines

### Screenshots Best Practices
1. Show key app features
2. Use actual app content (not mockups)
3. Include captions/annotations if helpful
4. Show the app in use, not just static screens
5. Maintain consistent branding
6. Test on different device sizes

### Description Writing Tips
1. Start with key benefits
2. Use bullet points for features
3. Include relevant keywords naturally
4. Mention platform-specific features
5. Keep it scannable and engaging
6. Update for each release

## Localization

Consider creating assets for different markets:
- Translate descriptions and keywords
- Adapt screenshots for different languages
- Consider cultural preferences in imagery
- Test text length in different languages

## ASO (App Store Optimization)

### Keywords Research
- Use tools like App Annie, Sensor Tower
- Analyze competitor keywords
- Focus on relevant, high-volume terms
- Monitor and iterate based on performance

### A/B Testing
- Test different screenshots
- Try various descriptions
- Experiment with icons (where possible)
- Monitor conversion rates