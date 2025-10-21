# App Icons and Assets

## Required Icon Sizes

### Android Icons (res/mipmap-*)
- `mipmap-mdpi/ic_launcher.png` - 48x48px
- `mipmap-hdpi/ic_launcher.png` - 72x72px  
- `mipmap-xhdpi/ic_launcher.png` - 96x96px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192px

### iOS Icons (ios/BlogMobileApp/Images.xcassets/AppIcon.appiconset/)
- `Icon-20.png` - 20x20px (iPhone Notification iOS 7-13)
- `Icon-20@2x.png` - 40x40px (iPhone Notification iOS 7-13)
- `Icon-20@3x.png` - 60x60px (iPhone Notification iOS 7-13)
- `Icon-29.png` - 29x29px (iPhone Settings iOS 5-13)
- `Icon-29@2x.png` - 58x58px (iPhone Settings iOS 5-13)
- `Icon-29@3x.png` - 87x87px (iPhone Settings iOS 5-13)
- `Icon-40.png` - 40x40px (iPhone Spotlight iOS 7-13)
- `Icon-40@2x.png` - 80x80px (iPhone Spotlight iOS 7-13)
- `Icon-40@3x.png` - 120x120px (iPhone Spotlight iOS 7-13)
- `Icon-60@2x.png` - 120x120px (iPhone App iOS 7-13)
- `Icon-60@3x.png` - 180x180px (iPhone App iOS 7-13)
- `Icon-1024.png` - 1024x1024px (App Store)

## Splash Screen Assets

### Android (res/drawable-*)
- `splash_screen.png` - Various densities
- `drawable-mdpi/splash_screen.png` - 320x480px
- `drawable-hdpi/splash_screen.png` - 480x800px
- `drawable-xhdpi/splash_screen.png` - 720x1280px
- `drawable-xxhdpi/splash_screen.png` - 1080x1920px
- `drawable-xxxhdpi/splash_screen.png` - 1440x2560px

### iOS
- `LaunchScreen.storyboard` configuration
- `LaunchImage.png` - Various sizes for different devices

## Tools for Icon Generation

1. **Online Tools:**
   - https://appicon.co/
   - https://makeappicon.com/
   - https://icon.kitchen/

2. **CLI Tools:**
   ```bash
   npm install -g app-icon
   app-icon generate -i icon-1024.png
   ```

## Design Guidelines

- Use a 1024x1024px master icon
- Ensure icon works well at small sizes
- Follow platform-specific design guidelines
- Test icons on different backgrounds
- Avoid text in icons (use symbols/graphics)

## Implementation

After generating icons, place them in the appropriate directories and update:
- `android/app/src/main/res/mipmap-*/` for Android
- `ios/BlogMobileApp/Images.xcassets/AppIcon.appiconset/` for iOS