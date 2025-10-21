# Blog Mobile App

A React Native mobile application for the blog platform, built with TypeScript and modern React Native ecosystem.

## Features

- Cross-platform support (iOS & Android)
- TypeScript for type safety
- Redux Toolkit for state management
- RTK Query for API calls and caching
- React Navigation for navigation
- Secure storage for authentication
- Offline support with caching
- Modern UI with React Native Elements

## Tech Stack

- **React Native 0.73+**
- **TypeScript**
- **Redux Toolkit & RTK Query**
- **React Navigation 6**
- **React Native Elements**
- **React Native Vector Icons**
- **Axios** for HTTP requests
- **React Native Keychain** for secure storage
- **MMKV** for fast storage
- **AsyncStorage** for legacy support

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── forms/          # Form components
│   └── ui/             # UI kit components
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── blog/           # Blog related screens
│   ├── profile/        # Profile screens
│   └── common/         # Common screens
├── navigation/         # Navigation configuration
├── services/           # API and other services
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices
│   └── api/            # RTK Query API definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # App constants
└── assets/             # Images, fonts, etc.
```

## Getting Started

### Prerequisites

- Node.js (>= 18)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Install iOS dependencies (iOS only):

```bash
cd ios && pod install && cd ..
```

3. Start Metro bundler:

```bash
npm start
```

4. Run on Android:

```bash
npm run android
```

5. Run on iOS:

```bash
npm run ios
```

## Development
set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk & set PATH=%PATH%;%ANDROID_HOME%\platform-tools & adb devices


### Available Scripts

### Development

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run typecheck` - Run TypeScript type checking

### Build & Release

- `npm run build:android` - Build Android APK
- `npm run build:android:bundle` - Build Android App Bundle
- `npm run build:ios` - Build iOS archive

### Quality Assurance

- `npm run polish:performance` - Run performance analysis
- `npm run polish:ui` - Run UI/UX polish check
- `npm run polish:stability` - Run stability analysis
- `npm run polish:all` - Run all polish checks
- `npm run pre-submission` - Complete pre-submission check

### Maintenance

- `npm run clean` - Clean project
- `npm run clean:android` - Clean Android build
- `npm run clean:ios` - Clean iOS build
- `npm run version:patch` - Bump patch version
- `npm run version:minor` - Bump minor version
- `npm run version:major` - Bump major version

### Code Style

This project uses ESLint and Prettier for code formatting. The configuration includes:

- TypeScript rules
- React Native specific rules
- Import/export rules
- Code formatting rules

### State Management

The app uses Redux Toolkit for state management with the following slices:

- **authSlice** - Authentication state
- **blogSlice** - Blog data and UI state
- **userSlice** - User profile and settings

### API Integration

RTK Query is used for API calls with automatic caching and background updates. The API is organized into:

- **baseApi** - Base API configuration with auth interceptors
- **authApi** - Authentication endpoints
- **blogApi** - Blog CRUD operations
- **userApi** - User profile operations

### Storage

The app uses multiple storage solutions:

- **Keychain** - Secure storage for tokens and sensitive data
- **MMKV** - Fast key-value storage for app data
- **AsyncStorage** - Legacy storage for compatibility
- **Cache Storage** - Automatic cache management with expiry

## Testing

The project includes Jest configuration for unit testing:

```bash
npm test
```

Test files should be placed in `__tests__` directories or use `.test.ts` or `.spec.ts` extensions.

## Building for Production

### Android

1. Generate signed APK:

```bash
cd android && ./gradlew assembleRelease
```

### iOS

1. Open `ios/BlogMobileApp.xcworkspace` in Xcode
2. Select your team and provisioning profile
3. Archive and upload to App Store

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

This project is part of the blog platform and follows the same licensing terms.
