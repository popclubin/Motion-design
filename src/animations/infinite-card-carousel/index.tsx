import { usePlayback } from '../_core/usePlayback';
import type { AnimationComponentProps } from '../../types/animation';
import { Carousel } from './components/Carousel';

export default function InfiniteCardCarousel({ params }: AnimationComponentProps) {
  const { isPaused } = usePlayback();
  return <Carousel tuning={params} isPaused={isPaused} />;
}
