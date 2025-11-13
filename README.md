# AI-Accelerated Mobile App

A React Native Expo app with secure authentication, biometric login, and form validation.

## Prerequisites

- Node.js 18+ and yarn
- Expo CLI: `yarn global add @expo/cli` or `npm install -g @expo/cli`
- iOS Simulator, Android Emulator, or a physical device

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd "AI-accelerated Mobile"

# Install dependencies
yarn install
```

## Running the App

```bash
# Start the development server
yarn start

# Or use Expo CLI directly
yarn expo start
```

Then:

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your physical device

## Available Scripts

- `yarn start` - Start Expo development server
- `yarn android` - Run on Android device/emulator
- `yarn ios` - Run on iOS device/simulator
- `yarn web` - Run in web browser
- `yarn test` - Run test suite
- `yarn lint` - Run ESLint

## Features

- Secure registration and login
- Biometric authentication (Face ID/Touch ID)
- Form validation with real-time feedback
- Account lockout protection (5 failed attempts)
- Dark/Light theme support
- Form data persistence

## Project Structure

```
app/
├── (auth)/          # Authentication screens (signIn, signUp)
├── (home)/          # Protected home screens
└── _layout.tsx      # Root layout

contexts/            # React Context providers
components/          # Reusable components
utils/               # Validation and utilities
```

---

**Built with React Native Expo and TypeScript**
