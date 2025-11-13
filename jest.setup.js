import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Animated module
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` was not specified
jest.mock('react-native/Libraries/Animated/animations/TimingAnimation');