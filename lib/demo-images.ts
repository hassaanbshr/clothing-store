const PRODUCT_IMAGE_POOL = [
  "/demo/products/look-01.svg",
  "/demo/products/look-02.svg",
  "/demo/products/look-03.svg",
  "/demo/products/look-04.svg",
] as const;

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "tailored-wool-coat":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Tailored_Wool_Coat.png",
  "relaxed-poplin-shirt":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Relaxed_Poplin_Shirt.png",
  "wide-leg-pleated-trousers":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Wide-Legged_Pleated_Trousers.png",
  "structured-blazer":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Structured_Blazer.png",
  "heavyweight-crewneck-tee":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Heavyweight_Crewneck_Tee.png",
  "tapered-chino-pants":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Tepered_Chino_Pants.png",
  "merino-zip-cardigan":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Merino_Zip_Cardigan.png",
  "leather-crossbody-bag":
    "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Leather_Crossbody_Bag.png",
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  women: "/demo/categories/women.svg",
  men: "/demo/categories/men.svg",
  accessories: "/demo/categories/accessories.svg",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hash(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) {
    total = (total + value.charCodeAt(i) * (i + 1)) % 100000;
  }
  return total;
}

export function isPlaceholderImage(src?: string | null) {
  if (!src) return true;
  return src === "/placeholder.svg" || src.startsWith("/placeholder");
}

export function resolveProductImage(options: {
  src?: string | null;
  name?: string | null;
  slug?: string | null;
  index?: number;
}) {
  const { src, name, slug, index = 0 } = options;
  if (src && !isPlaceholderImage(src)) return src;

  const key = slugify(slug || name || "product");
  if (PRODUCT_IMAGE_MAP[key]) {
    return PRODUCT_IMAGE_MAP[key];
  }
  const offset = (hash(key) + index) % PRODUCT_IMAGE_POOL.length;
  return PRODUCT_IMAGE_POOL[offset];
}

export function resolveCategoryImage(slug?: string | null) {
  if (!slug) return CATEGORY_IMAGE_MAP.women;
  return CATEGORY_IMAGE_MAP[slug] ?? CATEGORY_IMAGE_MAP.women;
}
