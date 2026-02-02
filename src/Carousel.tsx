import { useCarouselAutoPlay } from './useCarouselAutoPlay';
import useCarouselController, { CarouselRef } from './useCarouselController';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  WithTimingConfig,
  SharedValue,
} from 'react-native-reanimated';
import CarouselGesture from './CarouselGesture';

export type CarouselRenderItem<T> = (
  item: T,
  index: number,
) => React.ReactElement;

export type { CarouselRef };

export interface CarouselProps<T> {
  data: T[];
  renderItem: CarouselRenderItem<T>;
  containerWidth: number;
  itemWidth: number;
  height?: number;
  loop?: boolean;
  customAnimation?: WithTimingConfig;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  autoPlayReverse?: boolean;
  onBeginSnap?: () => void;
  onEndSnap?: (index: number) => void;
  onSnapToItem?: (index: number) => void;
  onProgressChange?: SharedValue<number>;
  spacing?: number;
}

interface CarouselItemProps {
  index: number;
  containerWidth: number;
  itemWidth: number;
  height: number;
  loop: boolean;
  dataLength: number;
  translationX: Animated.SharedValue<number>;
  children: React.ReactElement;
  spacing: number;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  index,
  containerWidth,
  itemWidth,
  height,
  loop,
  dataLength,
  translationX,
  children,
  spacing,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';

    const renderDataLength = dataLength === 2 ? dataLength * 2 : dataLength;
    const scrollUnit = itemWidth + spacing;
    const centerOffset = (containerWidth - itemWidth) / 2;

    let position = translationX.value + index * scrollUnit + centerOffset;

    if (loop) {
      const totalWidth = scrollUnit * renderDataLength;
      const halfTotal = totalWidth / 2;

      position = position % totalWidth;

      if (position > halfTotal) {
        position -= totalWidth;
      } else if (position < -halfTotal) {
        position += totalWidth;
      }
    }

    return {
      transform: [{ translateX: position }],
    };
  }, [index, containerWidth, itemWidth, spacing, dataLength, loop]);

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        { width: itemWidth, height },
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const Carousel = <T,>(props: CarouselProps<T>, ref: React.Ref<CarouselRef>) => {
  const {
    data,
    renderItem,
    containerWidth,
    itemWidth,
    height = 200,
    loop = true,
    onSnapToItem,
    onBeginSnap,
    onEndSnap,
    customAnimation,
    autoPlay = false,
    autoPlayInterval = 3000,
    autoPlayReverse = false,
    spacing = 0,
    onProgressChange,
  } = props;

  const translationX = useSharedValue(0);
  const currentX = useSharedValue(0);
  const scrollUnit = itemWidth + spacing;

  const dataLength = data.length;
  const renderData = React.useMemo(() => {
    if (loop && dataLength === 2) {
      return [...data, ...data];
    }
    return data;
  }, [data, loop, dataLength]);

  const carouselController = useCarouselController({
    ref,
    loop,
    dataLength,
    width: scrollUnit,
    translationX,
    customAnimation,
    onProgressChange,
  });

  const shouldAutoPlay = autoPlay && dataLength > 1;
  const { start, pause } = useCarouselAutoPlay({
    autoPlay: shouldAutoPlay,
    autoPlayInterval,
    autoPlayReverse,
    carouselController,
  });

  const gestureEnabled = dataLength > 1;
  const handleSnapToItem = useCallback(
    (index: number) => {
      onSnapToItem?.(index % dataLength);
    },
    [onSnapToItem],
  );
  const handleBeginSnap = useCallback(() => {
    pause();
    onBeginSnap?.();
  }, [onBeginSnap, pause]);
  const handleEndSnap = useCallback(
    (index: number) => {
      start();
      onEndSnap?.(index % dataLength);
    },
    [onEndSnap, start],
  );

  return (
    <CarouselGesture
      onBeginSnap={handleBeginSnap}
      onEndSnap={handleEndSnap}
      onSnapToItem={handleSnapToItem}
      startX={currentX}
      translationX={translationX}
      width={scrollUnit}
      dataLength={dataLength}
      loop={loop}
      customAnimation={customAnimation}
      enabled={gestureEnabled}
    >
      <Animated.View
        style={[styles.container, { width: containerWidth, height }]}
      >
        {renderData.map((item, renderIndex) => (
          <CarouselItem
            key={renderIndex}
            index={renderIndex}
            containerWidth={containerWidth}
            itemWidth={itemWidth}
            height={height}
            loop={loop}
            dataLength={dataLength}
            translationX={translationX}
            spacing={spacing}
          >
            {renderItem(item, renderIndex % dataLength)}
          </CarouselItem>
        ))}
      </Animated.View>
    </CarouselGesture>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default React.forwardRef(Carousel) as <T>(
  props: CarouselProps<T> & { ref?: React.Ref<CarouselRef> },
) => React.ReactElement;
