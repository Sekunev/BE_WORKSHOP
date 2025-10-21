# Deployment Guide

## Prerequisites

### Development Environment
- Node.js 18+
- React Native CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Git

### Accounts and Certificates
- Google Play Console account
- Apple Developer account
- Firebase project (for push notifications)
- Code signing certificates and provisioning profiles

## Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd blog-mobile-app
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### 3. Android Setup
```bash
# Generate release keystore
cd android/keystore
keytool -genkeypair -v -storetype PKCS12 -keystore blog-mobile-app-release.keystore -alias blog-mobile-app -keyalg RSA -keysize 2048 -validity 10000

# Create keystore.properties
cp keystore.properties.example keystore.properties
# Edit with your keystore information
```

### 4. iOS Setup (macOS only)
```bash
# Install CocoaPods dependencies
cd ios
pod install
```

## Manual Deployment

### Android Deployment

#### 1. Build Release APK
```bash
npm run build:android
```

#### 2. Build Release Bundle (AAB)
```bash
npm run build:android:bundle
```

#### 3. Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to "Release" > "Production"
4. Create new release
5. Upload the AAB file from `android/app/build/outputs/bundle/release/`
6. Fill in release notes
7. Review and rollout

### iOS Deployment

#### 1. Build Archive
```bash
npm run build:ios
```

#### 2. Export IPA
```bash
cd ios
xcodebuild -exportArchive \
           -archivePath BlogMobileApp.xcarchive \
           -exportPath ./build \
           -exportOptionsPlist ExportOptions.plist
```

#### 3. Upload to App Store Connect
```bash
xcrun altool --upload-app \
             --type ios \
             --file "build/BlogMobileApp.ipa" \
             --username "your-apple-id@email.com" \
             --password "app-specific-password"
```

Or use Xcode Organizer:
1. Open Xcode
2. Window > Organizer
3. Select your archive
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Follow the wizard

## Automated Deployment (CI/CD)

### GitHub Actions Setup

#### 1. Repository Secrets
Add these secrets to your GitHub repository:

**Android Secrets:**
- `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore file
- `ANDROID_KEY_ALIAS`: Keystore alias
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: Service account JSON for Play Console

**iOS Secrets:**
- `IOS_DISTRIBUTION_CERTIFICATE_BASE64`: Base64 encoded .p12 certificate
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`: Certificate password
- `APPSTORE_ISSUER_ID`: App Store Connect API issuer ID
- `APPSTORE_KEY_ID`: App Store Connect API key ID
- `APPSTORE_PRIVATE_KEY`: App Store Connect API private key

#### 2. Trigger Deployment
```bash
# Push to main branch triggers production build
git push origin main

# Or create a release tag
git tag v1.0.0
git push origin v1.0.0
```

### Manual CI/CD Trigger
```bash
# Trigger Android build
gh workflow run android-build.yml

# Trigger iOS build
gh workflow run ios-build.yml
```

## Version Management

### Bump Version
```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:major
```

### Release Process
1. **Prepare Release**
   ```bash
   # Update version
   npm run version:minor
   
   # Commit changes
   git add .
   git commit -m "chore: bump version to v1.1.0"
   
   # Create tag
   git tag v1.1.0
   ```

2. **Push and Deploy**
   ```bash
   # Push changes and tags
   git push origin main --tags
   
   # CI/CD will automatically build and deploy
   ```

3. **Monitor Deployment**
   - Check GitHub Actions for build status
   - Verify uploads in Google Play Console / App Store Connect
   - Test the deployed version

## Store Submission

### Google Play Store

#### 1. First Time Setup
1. Create app in Google Play Console
2. Complete store listing (descriptions, screenshots, etc.)
3. Set up content rating
4. Configure pricing and distribution
5. Upload release bundle

#### 2. Updates
1. Upload new AAB file
2. Update release notes
3. Review and rollout to production

### Apple App Store

#### 1. First Time Setup
1. Create app in App Store Connect
2. Complete app information
3. Upload screenshots and metadata
4. Submit for review

#### 2. Updates
1. Upload new build to TestFlight
2. Update version information
3. Submit for review

## Monitoring and Maintenance

### Analytics and Crash Reporting
- Firebase Crashlytics for crash reporting
- Firebase Analytics for user behavior
- App Store Connect analytics
- Google Play Console vitals

### Performance Monitoring
- Monitor app startup time
- Track memory usage
- Monitor network requests
- Check battery usage

### User Feedback
- Monitor app store reviews
- Set up in-app feedback system
- Track support requests

## Troubleshooting

### Common Build Issues

#### Android
```bash
# Clean build
npm run clean:android
cd android && ./gradlew clean

# Reset Metro cache
npx react-native start --reset-cache

# Rebuild
npm run build:android
```

#### iOS
```bash
# Clean build
npm run clean:ios

# Reset CocoaPods
cd ios
rm -rf Pods Podfile.lock
pod install

# Reset Metro cache
npx react-native start --reset-cache

# Rebuild
npm run build:ios
```

### Keystore Issues
- Ensure keystore.properties file exists and has correct paths
- Verify keystore passwords are correct
- Check that keystore file is not corrupted

### Code Signing Issues (iOS)
- Verify certificates are installed in Keychain
- Check provisioning profiles are up to date
- Ensure bundle ID matches provisioning profile
- Verify team ID is correct

## Security Checklist

- [ ] Keystore and certificates are stored securely
- [ ] API keys are not hardcoded in source code
- [ ] Environment variables are properly configured
- [ ] Code obfuscation is enabled for release builds
- [ ] SSL pinning is implemented for API calls
- [ ] App Transport Security is properly configured
- [ ] Sensitive data is encrypted in storage

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review build output for errors
3. Consult platform-specific documentation
4. Contact team lead or DevOps engineer