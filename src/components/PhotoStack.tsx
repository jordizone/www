import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
} from "motion/react";

// One spring for every leg of the send-to-back motion so x, y and rotate
// settle together. Slightly underdamped for a hint of life.
const SPRING = { type: "spring", stiffness: 110, damping: 17 } as const;
// Snap-back after an aborted drag: system response, so faster and flat.
const SNAP = { type: "spring", stiffness: 300, damping: 25 } as const;

type Photo = { src: string; caption?: string };

// ponytail: fixed "tossed" poses per stack position — messy but stable across renders
const POSES = [
  { rotate: -3, x: 0, y: 0 },
  { rotate: 5, x: 14, y: 8 },
  { rotate: -7, x: -16, y: 4 },
  { rotate: 3, x: 10, y: -6 },
  { rotate: -4, x: -8, y: 10 },
];
const pose = (i: number) => POSES[i % POSES.length];

function Card({
  photo,
  index,
  count,
  onDismiss,
}: {
  photo: Photo;
  index: number;
  count: number;
  onDismiss: () => void;
}) {
  const isTop = index === 0;
  const p = pose(index);
  // Each card owns its x, so the outgoing card keeps its fling position
  // instead of snapping when a new card takes the top slot.
  const x = useMotionValue(0);
  const dragRotate = useTransform(x, [-200, 200], [-12, 12]);

  const reduceMotion = useReducedMotion();

  // x stays live on every card: the dismissed card springs from its released
  // position into its back pose (passing behind the stack) instead of snapping.
  useEffect(() => {
    const target = isTop ? 0 : p.x;
    if (x.get() === target) return;
    if (reduceMotion) x.set(target);
    else animate(x, target, SPRING);
  }, [isTop, p.x, x, reduceMotion]);

  const ref = useRef<HTMLElement>(null);

  return (
    <motion.figure
      ref={ref}
      initial={false}
      animate={isTop ? { y: 0, rotate: 0 } : { y: p.y, rotate: p.rotate }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      className={`absolute inset-x-0 top-0 mx-auto w-full bg-white p-3 pb-4 rounded-sm shadow-md select-none ${
        isTop ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        zIndex: count - 1 - index,
        x,
        rotate: isTop ? dragRotate : undefined,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      whileDrag={{ scale: 1.02 }}
      onDragEnd={(_, info) => {
        // Distance or a quick flick both dismiss.
        if (info.offset.x > 60 || info.velocity.x > 500) {
          if (reduceMotion) {
            onDismiss();
            return;
          }
          // Sweep out to the right of the pile, inheriting the release
          // velocity (scaled: x moves at 0.25x the pointer via dragElastic).
          // Reorder just before the apex so the return spring (in the
          // effect) retargets mid-flight — one continuous arc behind the
          // stack, no stop at the right.
          const clear = (ref.current?.offsetWidth ?? 320) + 16;
          const sweep = animate(x, clear, {
            ...SPRING,
            velocity: info.velocity.x * 0.25,
          });
          const unsub = x.on("change", (v) => {
            if (v < clear * 0.85) return;
            unsub();
            sweep.stop();
            onDismiss();
          });
        } else {
          animate(x, 0, SNAP);
        }
      }}
    >
      <img
        src={photo.src}
        alt={photo.caption}
        draggable={false}
        className="aspect-square w-full object-cover pointer-events-none outline outline-1 -outline-offset-1 outline-black/10"
      />
      <figcaption className="mt-3 text-sm text-center text-neutral-700 min-h-[1.25rem]">
        {isTop ? photo.caption : ""}
      </figcaption>
    </motion.figure>
  );
}

export default function PhotoStack({ photos }: { photos: Photo[] }) {
  const [order, setOrder] = useState(photos);
  const sendToBack = () => setOrder((prev) => [...prev.slice(1), prev[0]]);

  return (
    <div className="relative mt-8 mb-12 mx-auto max-w-xs h-[23rem]">
      {order.map((photo, i) => (
        <Card
          key={photo.src}
          photo={photo}
          index={i}
          count={order.length}
          onDismiss={sendToBack}
        />
      ))}
    </div>
  );
}
