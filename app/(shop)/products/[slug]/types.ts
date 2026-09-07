// app/products/[slug]/types.ts

export type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  image_url: string;
  category: string | null;
  description: string | null;
};

export type ProductImageRow = {
  image_url: string;
};