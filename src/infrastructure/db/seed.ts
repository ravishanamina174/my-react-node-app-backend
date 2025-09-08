import "dotenv/config";
import { connectDB } from "./index";
import Category from "./entities/Category";
import Product from "./entities/Product";
import stripe from "../stripe";
import Color from "./entities/Color";

const CATEGORY_NAMES = ["Socks", "Pants", "T-shirts", "Shoes", "Shorts"];

const ADJECTIVES = [
  "Classic", "Sporty", "Elegant", "Comfy", "Trendy", "Cool", "Premium", "Casual", "Bold", "Vivid",
  "Soft", "Durable", "Lightweight", "Cozy", "Modern", "Vintage", "Chic", "Sleek", "Eco", "Urban"
];
const NOUNS = [
  "Runner", "Style", "Fit", "Wear", "Edition", "Line", "Collection", "Piece", "Design", "Model",
  "Comfort", "Edge", "Wave", "Touch", "Look", "Trend", "Vibe", "Aura", "Motion", "Essence"
];

function getRandomName(categoryName: string) {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${categoryName} ${noun}`;
}

const createProductsForCategory = async (categoryId: any, categoryName: string) => {
  const products = [];
  for (let i = 0; i < 10; i++) {

    const name = getRandomName(categoryName);
    const description = `This is a ${categoryName} that is ${name}`;
    const price = Math.floor(Math.random() * 100) + 10;

    const stripeProduct = await stripe.products.create({
      name: name,
      description: description,
      default_price_data: {
        currency: "usd",
        unit_amount: price * 100,
      },
    });

    const imageUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(categoryName)}`;
    products.push({
      categoryId,
      name: name,
      price: price,
      description: description,
      image: imageUrl,
      images: [imageUrl],
      stock: Math.floor(Math.random() * 50) + 1,
      reviews: [],
      stripePriceId: stripeProduct.default_price
    });
  }
  await Product.insertMany(products);
};

const seed = async () => {
  await connectDB();
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Color.deleteMany({});

  // Seed colors first
  await seedColors();

  for (const name of CATEGORY_NAMES) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await Category.create({ name, slug });
    await createProductsForCategory(category._id, name);
    console.log(`Seeded category: ${name}`);
  }

  console.log("Seeding complete.");
  process.exit(0);
};

// Seed Colors
export const seedColors = async () => {
  try {
    const colors = [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#1e3a8a' },
      { name: 'Gray', hex: '#6b7280' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Red', hex: '#dc2626' },
      { name: 'Blue', hex: '#3b82f6' },
      { name: 'Green', hex: '#10b981' },
      { name: 'Yellow', hex: '#f59e0b' },
      { name: 'Purple', hex: '#8b5cf6' },
      { name: 'Pink', hex: '#ec4899' },
    ];
    
    for (const color of colors) {
      await Color.findOneAndUpdate(
        { name: color.name },
        color,
        { upsert: true, new: true }
      );
    }
    
    console.log('Colors seeded successfully');
  } catch (error) {
    console.error('Error seeding colors:', error);
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 