#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Version bump script for React Native app
 * Usage: node scripts/version-bump.js [patch|minor|major]
 */

const versionType = process.argv[2] || 'patch';
const validTypes = ['patch', 'minor', 'major'];

if (!validTypes.includes(versionType)) {
  console.error('Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse current version
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.version = newVersion;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

// Update Android version
const androidManifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(androidManifestPath)) {
  let androidManifest = fs.readFileSync(androidManifestPath, 'utf8');
  
  // Update versionName
  androidManifest = androidManifest.replace(
    /android:versionName="[^"]*"/,
    `android:versionName="${newVersion}"`
  );
  
  // Increment versionCode
  const versionCodeMatch = androidManifest.match(/android:versionCode="(\d+)"/);
  if (versionCodeMatch) {
    const currentVersionCode = parseInt(versionCodeMatch[1]);
    const newVersionCode = currentVersionCode + 1;
    androidManifest = androidManifest.replace(
      /android:versionCode="\d+"/,
      `android:versionCode="${newVersionCode}"`
    );
  }
  
  fs.writeFileSync(androidManifestPath, androidManifest);
}

// Update iOS version
const iosInfoPlistPath = path.join(__dirname, '..', 'ios', 'BlogMobileApp', 'Info.plist');
if (fs.existsSync(iosInfoPlistPath)) {
  let iosInfoPlist = fs.readFileSync(iosInfoPlistPath, 'utf8');
  
  // Update CFBundleShortVersionString
  iosInfoPlist = iosInfoPlist.replace(
    /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]*<\/string>/,
    `<key>CFBundleShortVersionString</key>\n\t<string>${newVersion}</string>`
  );
  
  // Increment CFBundleVersion
  const bundleVersionMatch = iosInfoPlist.match(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/);
  if (bundleVersionMatch) {
    const currentBundleVersion = parseInt(bundleVersionMatch[1]);
    const newBundleVersion = currentBundleVersion + 1;
    iosInfoPlist = iosInfoPlist.replace(
      /<key>CFBundleVersion<\/key>\s*<string>\d+<\/string>/,
      `<key>CFBundleVersion</key>\n\t<string>${newBundleVersion}</string>`
    );
  }
  
  fs.writeFileSync(iosInfoPlistPath, iosInfoPlist);
}

console.log(`✅ Version bumped from ${currentVersion} to ${newVersion}`);
console.log('📱 Updated files:');
console.log('  - package.json');
console.log('  - app.json');
if (fs.existsSync(androidManifestPath)) {
  console.log('  - android/app/src/main/AndroidManifest.xml');
}
if (fs.existsSync(iosInfoPlistPath)) {
  console.log('  - ios/BlogMobileApp/Info.plist');
}

console.log('\n🚀 Next steps:');
console.log('1. Commit the version changes');
console.log('2. Create a git tag: git tag v' + newVersion);
console.log('3. Push changes and tag: git push origin main --tags');
console.log('4. Create a release build');