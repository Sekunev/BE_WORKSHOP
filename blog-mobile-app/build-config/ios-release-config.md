# iOS Release Configuration

## Xcode Project Settings

### Build Settings for Release

1. **Code Signing**
   - Code Signing Identity: "iPhone Distribution"
   - Provisioning Profile: Select your distribution profile
   - Development Team: Your Apple Developer Team ID

2. **Build Configuration**
   - Configuration: Release
   - Optimization Level: Fastest, Smallest [-Os]
   - Strip Debug Symbols During Copy: Yes
   - Strip Linked Product: Yes
   - Dead Code Stripping: Yes

3. **App Transport Security (Info.plist)**
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSExceptionDomains</key>
       <dict>
           <key>your-api-domain.com</key>
           <dict>
               <key>NSExceptionAllowsInsecureHTTPLoads</key>
               <true/>
               <key>NSExceptionMinimumTLSVersion</key>
               <string>TLSv1.0</string>
           </dict>
       </dict>
   </dict>
   ```

4. **Bundle Identifier**
   - Development: `com.blogapp.mobile.dev`
   - Production: `com.blogapp.mobile`

5. **Version and Build Numbers**
   - Version: 1.0.0
   - Build: 1 (increment for each build)

## Required Certificates and Profiles

### Development
- iOS Development Certificate
- Development Provisioning Profile

### Distribution
- iOS Distribution Certificate
- App Store Distribution Provisioning Profile
- Ad Hoc Distribution Provisioning Profile (for testing)

## Archive and Upload Process

1. **Create Archive**
   ```bash
   cd ios
   xcodebuild -workspace BlogMobileApp.xcworkspace \
              -scheme BlogMobileApp \
              -configuration Release \
              -destination generic/platform=iOS \
              -archivePath BlogMobileApp.xcarchive \
              archive
   ```

2. **Export IPA**
   ```bash
   xcodebuild -exportArchive \
              -archivePath BlogMobileApp.xcarchive \
              -exportPath ./build \
              -exportOptionsPlist ExportOptions.plist
   ```

3. **Upload to App Store Connect**
   ```bash
   xcrun altool --upload-app \
                --type ios \
                --file "BlogMobileApp.ipa" \
                --username "your-apple-id@email.com" \
                --password "app-specific-password"
   ```

## ExportOptions.plist Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>manual</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.blogapp.mobile</key>
        <string>Blog Mobile App Distribution Profile</string>
    </dict>
</dict>
</plist>
```

## Info.plist Configuration

Key settings for production:

```xml
<key>CFBundleDisplayName</key>
<string>Blog Mobile App</string>

<key>CFBundleIdentifier</key>
<string>com.blogapp.mobile</string>

<key>CFBundleVersion</key>
<string>1</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>

<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take photos for blog posts.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select images for blog posts.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>This app sends notifications about new blog posts and interactions.</string>
```

## Fastlane Configuration (Optional)

Create `ios/fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to App Store Connect"
  lane :release do
    build_app(
      workspace: "BlogMobileApp.xcworkspace",
      scheme: "BlogMobileApp",
      configuration: "Release",
      export_method: "app-store"
    )
    
    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true,
      force: true
    )
  end
  
  desc "Build for TestFlight"
  lane :beta do
    build_app(
      workspace: "BlogMobileApp.xcworkspace",
      scheme: "BlogMobileApp",
      configuration: "Release",
      export_method: "app-store"
    )
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end
end
```