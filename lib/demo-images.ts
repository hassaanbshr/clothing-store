const PRODUCT_IMAGE_POOL = [
  "/demo/products/look-01.svg",
  "/demo/products/look-02.svg",
  "/demo/products/look-03.svg",
  "/demo/products/look-04.svg",
] as const;

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
  const offset = (hash(key) + index) % PRODUCT_IMAGE_POOL.length;
  return PRODUCT_IMAGE_POOL[offset];
}

export function resolveCategoryImage(slug?: string | null) {
  if (!slug) return CATEGORY_IMAGE_MAP.women;
  return CATEGORY_IMAGE_MAP[slug] ?? CATEGORY_IMAGE_MAP.women;
}
