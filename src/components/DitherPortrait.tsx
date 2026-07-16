import { ImageDithering } from '@paper-design/shaders-react';
import { useEffect, useState } from 'react';

// size is in absolute px; Paper's 5.3 was on an 800px node, ours renders at 176px
const FULL_SIZE = 5.3 * (176 / 800);
const START_SIZE = 6; // chunky pixels the image resolves in from

// dither dots start chunky and resolve to full detail on load
export default function DitherPortrait() {
  const [size, setSize] = useState(START_SIZE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSize(FULL_SIZE);
      setReady(true);
      return;
    }
    let raf = 0;
    const img = new Image();
    img.src = '/profile.png';
    // wait for the texture to be decoded so the first frames don't hitch
    img.decode().catch(() => {}).finally(() => {
      setReady(true);
      // shader compile + texture upload freeze the main thread for ~450ms after
      // hydration (profiled); wait for two consecutive smooth frames before animating
      let last = 0;
      let smooth = 0;
      raf = requestAnimationFrame(function warmup(t) {
        smooth = t - last < 20 ? smooth + 1 : 0;
        last = t;
        if (smooth < 2) {
          raf = requestAnimationFrame(warmup);
          return;
        }
        const t0 = t;
        raf = requestAnimationFrame(function tick(now) {
          const p = Math.min((now - t0) / 2500, 1);
          // ease-in-out: coarse dither cells snap visibly, so move slowly through them
          const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          setSize(START_SIZE + (FULL_SIZE - START_SIZE) * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        });
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <ImageDithering
      image="/profile.png"
      fit="cover"
      type="2x2"
      size={size}
      colorSteps={5}
      originalColors={false}
      inverted={false}
      colorFront="#FFFFFF"
      colorBack="#0039F6"
      colorHighlight="#FFFFFF"
      style={{
        width: '100%',
        height: '100%',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.2, 0, 0, 1)',
      }}
    />
  );
}
