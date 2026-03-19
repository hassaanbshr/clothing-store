import * as bcrypt from "bcryptjs";
import { Prisma, PrismaClient, UserRole, CouponType, OrderStatus, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Women", slug: "women", order: 1 },
  { name: "Men", slug: "men", order: 2 },
  { name: "Accessories", slug: "accessories", order: 3 },
];

const products = [
  {
    name: "Tailored Wool Coat",
    slug: "tailored-wool-coat",
    categorySlug: "women",
    description:
      "A minimalist single-breasted coat crafted for crisp city mornings and elevated layering.",
    price: 189.0,
    previousPrice: 229.0,
    modelSizeInfo: "Model is 178cm and wears size M.",
    sizeChartJson: [
      { size: "S", chest: 92, waist: 74, hip: 98, length: 112 },
      { size: "M", chest: 96, waist: 78, hip: 102, length: 114 },
      { size: "L", chest: 100, waist: 82, hip: 106, length: 116 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Tailored_Wool_Coat.png",
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Tailored_Wool_Coat.png",
    ],
    variants: [
      { size: "S", colorName: "Camel", colorHex: "#C7A36A", stockQuantity: 8 },
      { size: "M", colorName: "Camel", colorHex: "#C7A36A", stockQuantity: 12 },
      { size: "L", colorName: "Black", colorHex: "#111111", stockQuantity: 6 },
    ],
  },
  {
    name: "Relaxed Poplin Shirt",
    slug: "relaxed-poplin-shirt",
    categorySlug: "women",
    description: "An oversized wardrobe staple with a clean drape and sharp collar.",
    price: 54.0,
    previousPrice: null,
    modelSizeInfo: "Model is 175cm and wears size S.",
    sizeChartJson: [
      { size: "XS", chest: 84, waist: 68, hip: 92, length: 68 },
      { size: "S", chest: 88, waist: 72, hip: 96, length: 69 },
      { size: "M", chest: 94, waist: 78, hip: 102, length: 71 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Relaxed_Poplin_Shirt.png",
    ],
    variants: [
      { size: "XS", colorName: "White", colorHex: "#F8F8F8", stockQuantity: 14 },
      { size: "S", colorName: "White", colorHex: "#F8F8F8", stockQuantity: 18 },
      { size: "M", colorName: "Blue", colorHex: "#7A8FA6", stockQuantity: 10 },
    ],
  },
  {
    name: "Wide-Leg Pleated Trousers",
    slug: "wide-leg-pleated-trousers",
    categorySlug: "women",
    description: "Fluid high-rise trousers designed to pair with crisp shirting and knitwear.",
    price: 79.0,
    previousPrice: 99.0,
    modelSizeInfo: "Model is 176cm and wears size M.",
    sizeChartJson: [
      { size: "S", waist: 68, hip: 96, length: 104 },
      { size: "M", waist: 72, hip: 100, length: 106 },
      { size: "L", waist: 76, hip: 104, length: 108 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Wide-Legged_Pleated_Trousers.png",
    ],
    variants: [
      { size: "S", colorName: "Stone", colorHex: "#D5CCBE", stockQuantity: 9 },
      { size: "M", colorName: "Stone", colorHex: "#D5CCBE", stockQuantity: 11 },
      { size: "L", colorName: "Navy", colorHex: "#253047", stockQuantity: 7 },
    ],
  },
  {
    name: "Structured Blazer",
    slug: "structured-blazer",
    categorySlug: "women",
    description: "A softly structured blazer cut for a tailored silhouette with modern ease.",
    price: 129.0,
    previousPrice: null,
    modelSizeInfo: "Model is 177cm and wears size M.",
    sizeChartJson: [
      { size: "S", chest: 90, waist: 72, hip: 96, length: 71 },
      { size: "M", chest: 94, waist: 76, hip: 100, length: 72 },
      { size: "L", chest: 98, waist: 80, hip: 104, length: 73 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Structured_Blazer.png",
    ],
    variants: [
      { size: "S", colorName: "Black", colorHex: "#111111", stockQuantity: 7 },
      { size: "M", colorName: "Black", colorHex: "#111111", stockQuantity: 10 },
      { size: "L", colorName: "Taupe", colorHex: "#A89B8F", stockQuantity: 5 },
    ],
  },
  {
    name: "Heavyweight Crewneck Tee",
    slug: "heavyweight-crewneck-tee",
    categorySlug: "men",
    description: "A premium everyday tee with a substantial feel and clean finish.",
    price: 35.0,
    previousPrice: null,
    modelSizeInfo: "Model is 185cm and wears size L.",
    sizeChartJson: [
      { size: "M", chest: 98, waist: 86, length: 69 },
      { size: "L", chest: 104, waist: 92, length: 71 },
      { size: "XL", chest: 110, waist: 98, length: 73 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Heavyweight_Crewneck_Tee.png",
    ],
    variants: [
      { size: "M", colorName: "White", colorHex: "#F5F5F5", stockQuantity: 20 },
      { size: "L", colorName: "White", colorHex: "#F5F5F5", stockQuantity: 18 },
      { size: "XL", colorName: "Black", colorHex: "#0E0E0E", stockQuantity: 12 },
    ],
  },
  {
    name: "Tapered Chino Pants",
    slug: "tapered-chino-pants",
    categorySlug: "men",
    description: "Refined chinos with subtle tapering and stretch for all-day comfort.",
    price: 68.0,
    previousPrice: 85.0,
    modelSizeInfo: "Model is 183cm and wears size M.",
    sizeChartJson: [
      { size: "S", waist: 76, hip: 96, length: 102 },
      { size: "M", waist: 82, hip: 102, length: 104 },
      { size: "L", waist: 88, hip: 108, length: 106 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Tepered_Chino_Pants.png",
    ],
    variants: [
      { size: "S", colorName: "Khaki", colorHex: "#B79B73", stockQuantity: 10 },
      { size: "M", colorName: "Khaki", colorHex: "#B79B73", stockQuantity: 12 },
      { size: "L", colorName: "Olive", colorHex: "#667052", stockQuantity: 9 },
    ],
  },
  {
    name: "Merino Zip Cardigan",
    slug: "merino-zip-cardigan",
    categorySlug: "men",
    description: "Lightweight merino knitwear with a polished zip front and soft hand feel.",
    price: 92.0,
    previousPrice: null,
    modelSizeInfo: "Model is 184cm and wears size L.",
    sizeChartJson: [
      { size: "M", chest: 100, waist: 88, length: 68 },
      { size: "L", chest: 106, waist: 94, length: 70 },
      { size: "XL", chest: 112, waist: 100, length: 72 },
    ],
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Merino_Zip_Cardigan.png",
    ],
    variants: [
      { size: "M", colorName: "Charcoal", colorHex: "#4A4A4A", stockQuantity: 9 },
      { size: "L", colorName: "Charcoal", colorHex: "#4A4A4A", stockQuantity: 11 },
      { size: "XL", colorName: "Navy", colorHex: "#23324A", stockQuantity: 8 },
    ],
  },
  {
    name: "Leather Crossbody Bag",
    slug: "leather-crossbody-bag",
    categorySlug: "accessories",
    description: "A compact leather bag with clean lines, adjustable strap, and soft structure.",
    price: 110.0,
    previousPrice: 140.0,
    modelSizeInfo: null,
    sizeChartJson: null,
    images: [
      "https://ix4rae0uj5sw13tm.public.blob.vercel-storage.com/products/Leather_Crossbody_Bag.png",
    ],
    variants: [
      { size: "One Size", colorName: "Black", colorHex: "#111111", stockQuantity: 15 },
      { size: "One Size", colorName: "Brown", colorHex: "#6C4A33", stockQuantity: 9 },
    ],
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const customerPasswordHash = await bcrypt.hash("Shopper123!", 10);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.abandonedCheckout.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: category,
      })
    )
  );

  const categoryMap = new Map(createdCategories.map((category) => [category.slug, category.id]));

  const createdProducts = [];
  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category ${product.categorySlug}`);
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        previousPrice:
          product.previousPrice != null ? new Prisma.Decimal(product.previousPrice) : null,
        categoryId,
        sizeChartJson: product.sizeChartJson as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
        modelSizeInfo: product.modelSizeInfo,
        images: {
          create: product.images.map((url, index) => ({
            url,
            alt: product.name,
            sortOrder: index,
          })),
        },
        variants: {
          create: product.variants.map((variant) => ({
            size: variant.size,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: 5,
            sku: `${product.slug}-${variant.size}-${variant.colorName.replace(/\s+/g, "")}`
              .replace(/[^a-zA-Z0-9-]/g, "")
              .toUpperCase(),
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    createdProducts.push(createdProduct);
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@margelle.local",
      passwordHash: adminPasswordHash,
      name: "Store Admin",
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@margelle.local",
      passwordHash: customerPasswordHash,
      name: "Ava Shopper",
      role: UserRole.USER,
    },
  });

  const defaultAddress = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      street: "221 Fashion Avenue",
      city: "Lahore",
      state: "Punjab",
      postalCode: "54000",
      country: "Pakistan",
      isDefault: true,
    },
  });

  const welcomeCoupon = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      type: CouponType.PERCENTAGE,
      value: new Prisma.Decimal(10),
      minOrderAmount: new Prisma.Decimal(50),
      maxUses: 100,
      expiresAt: new Date("2027-12-31T23:59:59.000Z"),
      isActive: true,
    },
  });

  const featuredProduct = createdProducts[0];
  const featuredVariant = featuredProduct?.variants[0];

  if (!featuredProduct || !featuredVariant) {
    throw new Error("Seed products were not created correctly.");
  }

  await prisma.review.createMany({
    data: [
      {
        userId: customer.id,
        productId: featuredProduct.id,
        rating: 5,
        comment: "Premium fabric, clean cut, and exactly the kind of minimal styling I wanted.",
      },
      {
        userId: admin.id,
        productId: createdProducts[4].id,
        rating: 4,
        comment: "A reliable everyday essential with a polished fit.",
      },
    ],
  });

  await prisma.wishlistItem.create({
    data: {
      userId: customer.id,
      productId: createdProducts[3].id,
    },
  });

  await prisma.order.create({
    data: {
      userId: customer.id,
      orderNumber: "ORD-DEMO-1001",
      status: OrderStatus.PROCESSING,
      shippingAddressId: defaultAddress.id,
      paymentMethod: PaymentMethod.COD,
      couponId: welcomeCoupon.id,
      discountAmount: new Prisma.Decimal(18.9),
      totalAmount: new Prisma.Decimal(170.1),
      items: {
        create: [
          {
            productId: featuredProduct.id,
            variantId: featuredVariant.id,
            quantity: 1,
            priceAtOrder: new Prisma.Decimal(189),
          },
        ],
      },
    },
  });

  await prisma.abandonedCheckout.create({
    data: {
      email: "guest@example.com",
      sessionId: "demo-session-001",
      cartSnapshot: [
        {
          productId: createdProducts[1].id,
          variantId: createdProducts[1].variants[0]?.id,
          quantity: 2,
        },
      ] as Prisma.InputJsonValue,
      totalValue: new Prisma.Decimal(108),
    },
  });

  console.log("Database seeded successfully.");
  console.log("Admin login: admin@margelle.local / Admin123!");
  console.log("Customer login: customer@margelle.local / Shopper123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
