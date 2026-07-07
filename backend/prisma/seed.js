const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Delete order items, orders, products, categories, users
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding categories...');
  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const apparel = await prisma.category.create({ data: { name: 'Apparel' } });
  const homeKitchen = await prisma.category.create({ data: { name: 'Home & Kitchen' } });
  const fitness = await prisma.category.create({ data: { name: 'Fitness & Outdoors' } });

  console.log('Seeding products...');
  const products = [
    {
      name: 'Quantum Wireless Headphones',
      description: 'Premium noise-cancelling wireless over-ear headphones with 40-hour battery life and high-fidelity spatial audio.',
      price: 149.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      categoryId: electronics.id,
    },
    {
      name: 'Zenith Active Smartwatch',
      description: 'Track your health, monitor sleep patterns, and receive real-time notifications with an elegant, sleek design and 7-day battery.',
      price: 199.99,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      categoryId: electronics.id,
    },
    {
      name: 'Lumina Mechanical Keyboard',
      description: 'RGB customizable mechanical keyboard with ultra-responsive blue switches, premium aluminum framing, and tactile control.',
      price: 89.99,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      categoryId: electronics.id,
    },
    {
      name: 'AeroFit Running Shoes',
      description: 'Lightweight breathable running shoes engineered with high-impact cushioning soles for peak training performance.',
      price: 79.99,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      categoryId: apparel.id,
    },
    {
      name: 'Vanguard Leather Jacket',
      description: 'Handcrafted genuine leather jacket. Weather-resistant, durable, and designed with a modern minimalist aesthetic.',
      price: 249.99,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      categoryId: apparel.id,
    },
    {
      name: 'Eclipse Polarized Sunglasses',
      description: '100% UV protection sunglasses featuring classic aviator shapes, double-bridged metal frames, and anti-glare polarized lenses.',
      price: 45.00,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      categoryId: apparel.id,
    },
    {
      name: 'Aroma Precision Espresso Machine',
      description: '15-bar Italian pump espresso and cappuccino maker. Offers custom temperature and micro-foam steam milk texturing.',
      price: 179.99,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&w=600&q=80',
      categoryId: homeKitchen.id,
    },
    {
      name: 'Titanium Chef Knife Pro',
      description: '8-inch forged high-carbon titanium kitchen knife. Extremely sharp edge retention, ergonomic grip, and perfect balance.',
      price: 59.99,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
      categoryId: homeKitchen.id,
    },
    {
      name: 'Focus Hydration Water Bottle',
      description: 'Double-walled vacuum insulated stainless steel water bottle. Keeps beverages cold for 24 hours or hot for 12 hours.',
      price: 24.99,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      categoryId: fitness.id,
    },
    {
      name: 'Apex Grip Yoga Mat',
      description: '6mm eco-friendly non-slip yoga mat with alignment grid lines, premium cushioning, and a carry strap included.',
      price: 34.99,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80',
      categoryId: fitness.id,
    }
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  console.log('Seeding users...');
  // Create admin
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'System Admin',
      password: hashedAdminPassword,
      role: 'ADMIN'
    }
  });

  // Create user
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
      password: hashedUserPassword,
      role: 'USER'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
