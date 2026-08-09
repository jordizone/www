import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

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
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  // Reset once it leaves the top, invisibly (x isn't in style while behind).
  useEffect(() => {
    if (!isTop) x.set(0);
  }, [isTop, x]);

  return (
    <motion.figure
      initial={false}
      animate={isTop ? { y: 0 } : { x: p.x, y: p.y, rotate: p.rotate }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="absolute inset-x-0 top-0 mx-auto w-full bg-white p-3 pb-4 rounded-sm shadow-md select-none"
      style={{
        zIndex: count - 1 - index,
        x: isTop ? x : undefined,
        rotate: isTop ? rotate : undefined,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      whileDrag={{ cursor: "grabbing", scale: 1.02 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onDismiss();
        else animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      }}
    >
      <img
        src={photo.src}
        alt={photo.caption}
        draggable={false}
        className="aspect-square w-full object-cover pointer-events-none"
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
