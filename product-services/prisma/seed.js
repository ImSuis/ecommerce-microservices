const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  { name: 'iPhone 15 Pro', description: 'Apple flagship smartphone with titanium design', price: 1199.99, category: 'Electronics', stock: 50 },
  { name: 'Samsung Galaxy S24', description: 'Android flagship with AI features', price: 999.99, category: 'Electronics', stock: 40 },
  { name: 'Sony WH-1000XM5', description: 'Industry leading noise cancelling headphones', price: 349.99, category: 'Electronics', stock: 75 },
  { name: 'MacBook Pro 14"', description: 'Apple M3 Pro chip laptop', price: 1999.99, category: 'Electronics', stock: 25 },
  { name: 'iPad Air', description: 'Lightweight tablet with M1 chip', price: 599.99, category: 'Electronics', stock: 60 },
  { name: 'Nike Air Max 270', description: 'Mens running shoes with air cushioning', price: 149.99, category: 'Footwear', stock: 100 },
  { name: 'Adidas Ultraboost 23', description: 'Premium running shoes with boost technology', price: 179.99, category: 'Footwear', stock: 80 },
  { name: 'Levi\'s 501 Jeans', description: 'Classic straight fit denim jeans', price: 69.99, category: 'Clothing', stock: 200 },
  { name: 'The North Face Jacket', description: 'Waterproof outdoor jacket', price: 249.99, category: 'Clothing', stock: 45 },
  { name: 'Uniqlo Fleece Hoodie', description: 'Lightweight and warm fleece hoodie', price: 39.99, category: 'Clothing', stock: 150 },
  { name: 'Dyson V15 Vacuum', description: 'Cordless vacuum with laser dust detection', price: 749.99, category: 'Home', stock: 30 },
  { name: 'Instant Pot Duo', description: '7-in-1 electric pressure cooker', price: 89.99, category: 'Home', stock: 90 },
  { name: 'IKEA MALM Bed Frame', description: 'Queen size bed frame in white', price: 299.99, category: 'Home', stock: 20 },
  { name: 'Kindle Paperwhite', description: 'Waterproof e-reader with 300ppi display', price: 139.99, category: 'Electronics', stock: 110 },
  { name: 'Yoga Mat', description: 'Non-slip exercise mat 6mm thick', price: 29.99, category: 'Sports', stock: 200 },
  { name: 'Whey Protein Powder', description: 'Chocolate flavour 2kg tub', price: 49.99, category: 'Sports', stock: 120 },
  { name: 'Resistance Bands Set', description: 'Set of 5 bands with different resistance levels', price: 19.99, category: 'Sports', stock: 300 },
  { name: 'JavaScript: The Good Parts', description: 'Classic JS book by Douglas Crockford', price: 24.99, category: 'Books', stock: 60 },
  { name: 'Clean Code', description: 'A handbook of agile software craftsmanship', price: 34.99, category: 'Books', stock: 55 },
  { name: 'The Pragmatic Programmer', description: '20th anniversary edition', price: 39.99, category: 'Books', stock: 50 },
];

async function main() {
  console.log('Seeding products...');
  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());