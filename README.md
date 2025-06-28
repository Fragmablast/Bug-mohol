# Bug Mohol - সাইবার নিরাপত্তার খবর

Bug Mohol is a Bengali cybersecurity news app that provides the latest security news and updates from Bangladesh and around the world.

## Features

- 📱 Real-time RSS feed from bugmohol.com
- 🌙 Dark/Light theme support
- 🔖 Save articles for offline reading
- 🔍 Search and filter articles
- 🌐 Bengali and English language support
- 📤 Share articles with others
- 🔒 Cybersecurity tips and guidelines

## Building APK

To build an APK file for Android distribution:

### Prerequisites

1. Install EAS CLI globally:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

### Build APK

To build an APK file:

```bash
npm run build:android-apk
```

Or directly with EAS:

```bash
eas build --platform android --profile apk
```

### Build AAB (for Google Play Store)

To build an Android App Bundle for Play Store:

```bash
npm run build:android
```

Or directly with EAS:

```bash
eas build --platform android --profile production
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open the app in Expo Go or run on simulator/emulator

## Project Structure

```
app/
├── (tabs)/           # Tab navigation screens
├── article/          # Article detail screens
├── api/             # API routes
├── _layout.tsx      # Root layout
├── about.tsx        # About page
└── privacy-policy.tsx # Privacy policy

components/          # Reusable components
contexts/           # React contexts (Theme, Language)
services/           # API and storage services
types/              # TypeScript type definitions
```

## Configuration

- **Package Name**: com.bugmohol.news
- **Version**: 1.0.0
- **Target SDK**: Android 14 (API 34)
- **Min SDK**: Android 6.0 (API 23)

## Permissions

- `INTERNET` - For fetching news articles
- `ACCESS_NETWORK_STATE` - For checking network connectivity

## License

© 2024 Bug Mohol. All rights reserved.