import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  SharedValue,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import { defaultSnapConfig } from './useCarouselController';

type CarouselGestureType = {
  onBeginSnap?: () => void;
  onEndSnap?: (index: number) => void;
  onSnapToItem?: (index: number) => void;
  customAnimation?: WithTimingConfig;
  startX: SharedValue<number>;
  translationX: SharedValue<number>;
  width: number;
  dataLength: number;
  loop: boolean;
  enabled?: boolean;
};

const CarouselGesture: React.FC<PropsWithChildren<CarouselGestureType>> = ({
  onBeginSnap,
  onEndSnap,
  onSnapToItem,
  customAnimation,
  startX,
  translationX,
  width,
  dataLength,
  loop,
  enabled = true,
  children,
}) => {
  const gesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(enabled)
      .onBegin(() => {
        startX.value = translationX.value;
        if (onBeginSnap) {
          runOnJS(onBeginSnap)();
        }
      })
      .onChange(event => {
        let newValue = startX.value + event.translationX;

        if (!loop) {
          const minX = -(dataLength - 1) * width;
          const maxX = 0;
          const rubberBandFactor = 0.3;

          if (newValue > maxX) {
            const overScroll = newValue - maxX;
            newValue = maxX + overScroll * rubberBandFactor;
          } else if (newValue < minX) {
            const overScroll = newValue - minX;
            newValue = minX + overScroll * rubberBandFactor;
          }
        }

        translationX.value = newValue;
      })
      .onEnd(event => {
        const velocity = event.velocityX;
        const currentPage = Math.round(-startX.value / width);

        let nextPage = currentPage;
        if (Math.abs(velocity) > 500) {
          nextPage = velocity > 0 ? currentPage - 1 : currentPage + 1;
        } else {
          const progress = (Math.abs(event.translationX) % width) / width;

          if (progress > 0.5) {
            nextPage =
              event.translationX > 0 ? currentPage - 1 : currentPage + 1;
          }
        }

        if (!loop) {
          nextPage = Math.max(0, Math.min(dataLength - 1, nextPage));
        }

        translationX.value = withTiming(
          -nextPage * width,
          customAnimation || defaultSnapConfig,
        );

        if (onEndSnap) {
          const realIndex = ((nextPage % dataLength) + dataLength) % dataLength;
          runOnJS(onEndSnap)(realIndex);
        }

        if (onSnapToItem && nextPage !== currentPage) {
          const realIndex = ((nextPage % dataLength) + dataLength) % dataLength;
          runOnJS(onSnapToItem)(realIndex);
        }
      });
  }, [
    onBeginSnap,
    onEndSnap,
    onSnapToItem,
    startX,
    translationX,
    width,
    dataLength,
    loop,
    enabled,
  ]);
  return <GestureDetector gesture={gesture}>{children}</GestureDetector>;
};

export default CarouselGesture;
