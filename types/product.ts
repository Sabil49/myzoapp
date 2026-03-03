// types/product.ts
export interface Product {
  id: string;
  styleCode: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  images: string[];
  materials: string[];
  dimensions: string;
  careInstructions: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  isWishlisted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
