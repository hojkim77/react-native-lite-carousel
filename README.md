# react-native-lite-carousel

A lightweight, performant carousel component for React Native built with Reanimated and Gesture Handler.

## Features

- 🚀 **High Performance** - Built with React Native Reanimated for smooth 60fps animations
- 👆 **Gesture Support** - Swipe gestures powered by react-native-gesture-handler
- 🔄 **Loop Mode** - Infinite loop support
- ⏯️ **Auto Play** - Automatic sliding with customizable interval
- 🎨 **Customizable** - Flexible styling and animation options
- 📱 **TypeScript** - Full TypeScript support

## Installation

```bash
npm install react-native-lite-carousel
# or
yarn add react-native-lite-carousel
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install react react-native react-native-reanimated react-native-gesture-handler
# or
yarn add react react-native react-native-reanimated react-native-gesture-handler
```

Make sure to follow the setup instructions for [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/).

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Array of data items to render |
| `renderItem` | `(item: T, index: number) => React.ReactElement` | **required** | Function to render each item |
| `containerWidth` | `number` | **required** | Width of the carousel container |
| `itemWidth` | `number` | **required** | Width of each carousel item |
| `height` | `number` | `200` | Height of the carousel |
| `loop` | `boolean` | `true` | Enable infinite loop |
| `autoPlay` | `boolean` | `false` | Enable automatic sliding |
| `autoPlayInterval` | `number` | `3000` | Interval between auto-play slides (ms) |
| `autoPlayReverse` | `boolean` | `false` | Auto-play in reverse direction |
| `spacing` | `number` | `0` | Spacing between items |
| `customAnimation` | `WithTimingConfig` | - | Custom animation configuration |
| `onBeginSnap` | `() => void` | - | Callback when snap begins |
| `onEndSnap` | `(index: number) => void` | - | Callback when snap ends |
| `onSnapToItem` | `(index: number) => void` | - | Callback when item is snapped to |
| `onProgressChange` | `SharedValue<number>` | - | Shared value to track scroll progress |

### Ref Methods

```tsx
interface CarouselRef {
  scrollTo: (index: number, animated?: boolean) => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
}
```

#### Example

```tsx
const carouselRef = useRef<CarouselRef>(null);

// Scroll to specific index
carouselRef.current?.scrollTo(2);

// Go to next item
carouselRef.current?.next();

// Go to previous item
carouselRef.current?.prev();

// Get current index
const currentIndex = carouselRef.current?.getCurrentIndex();
```

## Examples

### Basic Carousel

```tsx
<Carousel
  data={items}
  renderItem={(item) => <ItemComponent item={item} />}
  containerWidth={width}
  itemWidth={width * 0.8}
/>
```

### Auto-play Carousel

```tsx
<Carousel
  data={items}
  renderItem={(item) => <ItemComponent item={item} />}
  containerWidth={width}
  itemWidth={width * 0.8}
  autoPlay={true}
  autoPlayInterval={2000}
/>
```

### Non-looping Carousel

```tsx
<Carousel
  data={items}
  renderItem={(item) => <ItemComponent item={item} />}
  containerWidth={width}
  itemWidth={width * 0.8}
  loop={false}
/>
```

### Custom Animation

```tsx
import { Easing } from 'react-native-reanimated';

<Carousel
  data={items}
  renderItem={(item) => <ItemComponent item={item} />}
  containerWidth={width}
  itemWidth={width * 0.8}
  customAnimation={{
    duration: 800,
    easing: Easing.out(Easing.exp),
  }}
/>
```