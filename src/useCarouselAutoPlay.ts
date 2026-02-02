import type { ICarouselController } from './useCarouselController';
import { useCallback, useEffect, useRef } from 'react';

export function useCarouselAutoPlay(opts: {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  autoPlayReverse?: boolean;
  carouselController: ICarouselController;
}) {
  const {
    autoPlay = false,
    autoPlayReverse = false,
    autoPlayInterval,
    carouselController,
  } = opts;

  const { prev, next } = carouselController;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const stopped = useRef<boolean>(!autoPlay);

  const play = useCallback(() => {
    if (stopped.current) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      if (autoPlayReverse) {
        prev(play);
      } else {
        next(play);
      }
    }, autoPlayInterval);
  }, [autoPlayReverse, autoPlayInterval, prev, next]);

  const pause = useCallback(() => {
    if (!autoPlay) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }
    stopped.current = true;
  }, [autoPlay]);

  const start = useCallback(() => {
    if (!autoPlay) {
      return;
    }

    stopped.current = false;
    play();
  }, [play, autoPlay]);

  useEffect(() => {
    if (autoPlay) {
      start();
    } else {
      pause();
    }

    return pause;
  }, [pause, start, autoPlay]);

  return {
    pause,
    start,
  };
}
