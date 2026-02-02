import { useCallback, useImperativeHandle } from 'react';
import {
  Easing,
  SharedValue,
  withTiming,
  WithTimingConfig,
  useAnimatedReaction,
} from 'react-native-reanimated';

export interface CarouselRef {
  scrollTo: (index: number, animated?: boolean) => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
}

interface UseCarouselControllerProps {
  ref: React.Ref<CarouselRef>;
  loop: boolean;
  dataLength: number;
  width: number;
  translationX: SharedValue<number>;
  customAnimation?: WithTimingConfig;
  onProgressChange?: SharedValue<number>;
}

export interface ICarouselController {
  scrollTo: (index: number, animated?: boolean, cb?: () => void) => void;
  next: (cb?: () => void) => void;
  prev: (cb?: () => void) => void;
  getCurrentIndex: () => number;
}

// copy from react-native-reanimated-carousel
export const defaultSnapConfig = {
  duration: 500,
  easing: Easing.bezier(0.25, 1, 0.5, 1),
};

const useCarouselController = (
  props: UseCarouselControllerProps,
): ICarouselController => {
  const {
    ref,
    loop,
    dataLength,
    width,
    translationX,
    customAnimation,
    onProgressChange,
  } = props;

  const scrollTo = useCallback(
    (index: number, animated = true, cb?: () => void) => {
      if (dataLength <= 1) {
        cb?.();
        return;
      }

      let targetIndex = ((index % dataLength) + dataLength) % dataLength;

      if (!loop) {
        targetIndex = Math.max(0, Math.min(dataLength - 1, targetIndex));
      }

      const currentOffset = translationX.value;
      const currentPage = Math.round(-currentOffset / width);

      const currentIndex =
        ((currentPage % dataLength) + dataLength) % dataLength;

      let diff = targetIndex - currentIndex;

      if (loop) {
        if (diff > dataLength / 2) {
          diff -= dataLength;
        } else if (diff < -dataLength / 2) {
          diff += dataLength;
        }
      }

      const targetOffset = currentOffset - diff * width;

      if (animated) {
        translationX.value = withTiming(targetOffset, {
          ...(customAnimation || defaultSnapConfig),
          duration: Math.abs(diff) * 250,
        });
      } else {
        translationX.value = targetOffset;
      }

      cb?.();
    },
    [loop, dataLength, dataLength, width, translationX, customAnimation],
  );

  const next = useCallback(
    (cb?: () => void) => {
      if (dataLength <= 1) {
        cb?.();
        return;
      }

      const currentPage = Math.round(-translationX.value / width);
      const nextPage = currentPage + 1;

      if (!loop && nextPage >= dataLength) {
        return;
      }
      translationX.value = withTiming(
        -nextPage * width,
        customAnimation || defaultSnapConfig,
      );

      cb?.();
    },
    [loop, dataLength, width, translationX, customAnimation],
  );

  const prev = useCallback(
    (cb?: () => void) => {
      if (dataLength <= 1) {
        cb?.();
        return;
      }

      const currentPage = Math.round(-translationX.value / width);
      const prevPage = currentPage - 1;

      if (!loop && prevPage < 0) {
        return;
      }
      translationX.value = withTiming(
        -prevPage * width,
        customAnimation || defaultSnapConfig,
      );

      cb?.();
    },
    [loop, dataLength, width, translationX, customAnimation],
  );

  const getCurrentIndex = useCallback(() => {
    const currentPage = Math.round(-translationX.value / width);
    return ((currentPage % dataLength) + dataLength) % dataLength;
  }, [dataLength, width, translationX]);

  useAnimatedReaction(
    () => translationX.value,
    () => {
      if (!onProgressChange) return;

      const progress = -translationX.value / width;

      if (!loop) {
        onProgressChange.value = Math.max(
          0,
          Math.min(dataLength - 1, progress),
        );
      } else {
        onProgressChange.value =
          ((progress % dataLength) + dataLength) % dataLength;
      }
    },
    [width, dataLength, onProgressChange, loop],
  );

  useImperativeHandle(ref, () => ({
    scrollTo,
    next,
    prev,
    getCurrentIndex,
  }));

  return {
    scrollTo,
    next,
    prev,
    getCurrentIndex,
  };
};

export default useCarouselController;
