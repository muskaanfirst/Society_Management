// Deterministic id -> pastel bento-card color, so the same society (or any
// other id) always gets the same card color everywhere it appears.
// The class names are written out literally (not built via template
// interpolation) so Tailwind's scanner always finds all five, even though
// only one is picked at runtime -- a dynamic `bg-${x}` string would get
// purged from the production build.
const PASTEL_BG_CLASSES = [
  "bg-pastel-lavender",
  "bg-pastel-sky",
  "bg-pastel-amber",
  "bg-pastel-pink",
  "bg-pastel-sage",
];

export function pastelBgFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PASTEL_BG_CLASSES[hash % PASTEL_BG_CLASSES.length];
}
