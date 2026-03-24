export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  sizes?: string[];
  customizable: boolean;
  inStock: boolean;
  featured?: boolean;
}

export const categories = [
  { id: "gifts", name: "Gifts", icon: "🎁", description: "Custom sublimation gifts" },
  { id: "frames", name: "Frames", icon: "🖼️", description: "Photo frames in all sizes" },
  { id: "fancy", name: "Fancy Items", icon: "✨", description: "Unique fancy products" },
  { id: "aari", name: "Aari Works", icon: "👗", description: "Beautiful handcrafted designs" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Custom Photo T-Shirt",
    description: "Premium quality sublimation printed t-shirt with your favourite photo. Available in all sizes.",
    price: 499,
    originalPrice: 699,
    category: "gifts",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    customizable: true,
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Photo Printed Mug",
    description: "High quality ceramic mug with your custom photo. Perfect gift for loved ones.",
    price: 299,
    originalPrice: 399,
    category: "gifts",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500"],
    customizable: true,
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Wooden Photo Frame - Large",
    description: "Elegant wooden frame with premium finish. Perfect for your cherished memories.",
    price: 599,
    originalPrice: 799,
    category: "frames",
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500"],
    sizes: ["8x10", "10x12", "12x16", "16x20"],
    customizable: true,
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Custom Keyring",
    description: "Personalized keyring with your photo. Compact and durable.",
    price: 149,
    originalPrice: 199,
    category: "gifts",
    images: ["https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500"],
    customizable: true,
    inStock: true,
  },
  {
    id: "5",
    name: "Photo Pillow Cover",
    description: "Soft satin pillow cover with sublimation print. Custom size available.",
    price: 449,
    originalPrice: 599,
    category: "gifts",
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500"],
    sizes: ["12x12", "16x16", "18x18"],
    customizable: true,
    inStock: true,
    featured: true,
  },
  {
    id: "6",
    name: "Gold Border Frame",
    description: "Premium gold-bordered photo frame. Royal look for your home decor.",
    price: 899,
    originalPrice: 1199,
    category: "frames",
    images: ["https://images.unsplash.com/photo-1582993728648-74ab28640e17?w=500"],
    sizes: ["8x10", "10x12", "12x16"],
    customizable: true,
    inStock: true,
  },
  {
    id: "7",
    name: "Designer Pen Set",
    description: "Premium designer pen set. Perfect for gifting on special occasions.",
    price: 249,
    category: "fancy",
    images: ["https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500"],
    customizable: false,
    inStock: true,
  },
  {
    id: "8",
    name: "Printed Notebook",
    description: "Custom cover printed notebook. Great for personal or office use.",
    price: 199,
    originalPrice: 299,
    category: "fancy",
    images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500"],
    customizable: true,
    inStock: true,
  },
  {
    id: "9",
    name: "Bridal Aari Blouse",
    description: "Exquisite handcrafted aari work blouse for brides. Custom design available.",
    price: 3499,
    originalPrice: 4999,
    category: "aari",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500"],
    sizes: ["S", "M", "L", "XL"],
    customizable: true,
    inStock: true,
    featured: true,
  },
  {
    id: "10",
    name: "Aari Work Saree Border",
    description: "Beautiful aari embroidery work on saree borders. Traditional designs.",
    price: 1999,
    originalPrice: 2499,
    category: "aari",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500"],
    customizable: true,
    inStock: true,
  },
  {
    id: "11",
    name: "Photo Printed Plate",
    description: "Decorative plate with your custom photo. Perfect for wall display.",
    price: 399,
    originalPrice: 499,
    category: "gifts",
    images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500"],
    customizable: true,
    inStock: true,
  },
  {
    id: "12",
    name: "Gift Hamper Box",
    description: "Premium gift hamper with assorted items. Custom packing available.",
    price: 999,
    originalPrice: 1299,
    category: "fancy",
    images: ["https://images.unsplash.com/photo-1549465220-1a8b9238f55b?w=500"],
    customizable: true,
    inStock: true,
    featured: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
