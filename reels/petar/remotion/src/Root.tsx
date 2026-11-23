import {Composition} from 'remotion';
import {Petar, TOTAL} from './Petar';
export const Root = () => (
  <Composition id="Petar" component={Petar} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
