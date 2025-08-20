import "dotenv/config";
import { connectDB } from "./index";
import Product from "./entities/Product";
import Color from "./entities/Color";

// Utility function to update existing products with color IDs
export const updateProductsWithColors = async () => {
  try {
    await connectDB();
    
    // Get all colors
    const colors = await Color.find();
    if (colors.length === 0) {
      console.log('No colors found. Please seed colors first.');
      return;
    }
    
    // Get all products without colors
    const productsWithoutColors = await Product.find({ colorId: { $exists: false } });
    
    if (productsWithoutColors.length === 0) {
      console.log('All products already have colors assigned.');
      return;
    }
    
    console.log(`Found ${productsWithoutColors.length} products without colors.`);
    
    // Assign random colors to products
    for (const product of productsWithoutColors) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      await Product.findByIdAndUpdate(product._id, { colorId: randomColor._id });
      console.log(`Assigned color ${randomColor.name} to product ${product.name}`);
    }
    
    console.log('Products updated with colors successfully');
  } catch (error) {
    console.error('Error updating products with colors:', error);
  } finally {
    process.exit(0);
  }
};

// Run the update if this file is executed directly
if (require.main === module) {
  updateProductsWithColors();
}
