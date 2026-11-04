import { Heading, Text } from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

/** Frames the three dashboard scenes below it, so a first visit knows why they are here. */
export function ExamplesIntro() {
  const { ref, visible } = useReveal();

  return (
    <DemoScene id="examples" ref={ref}>
      <div className={`nil-demo-examples-intro nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Examples in dense UIs</Heading>
        <Text muted style={{ marginTop: 'var(--nil-spacing-xs)', maxWidth: '64ch' }}>
          Three busy screens built with the same components: a climate console, an instrument panel
          and a lighting control. They came from an early look brief. They are not the point of the
          kit, but they show it holding up when a screen is packed.
        </Text>
      </div>
    </DemoScene>
  );
}
