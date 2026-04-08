const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function runSeed() {
  console.log('🌱 Planting seed data into the database...');

  // 1. CLEAR EXISTING DATA (So we can run this file multiple times without errors)
  await prisma.unrecognizedTerm.deleteMany();
  await prisma.savedList.deleteMany();
  await prisma.aprioriCache.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.masterProduct.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.storeMap.deleteMany();
  await prisma.store.deleteMany();

  // 2. CREATE A MASTER STORE
  const store = await prisma.store.create({
    data: {
      name: 'AI Supermarket (Demo)',
      address: '123 Tech Lane, Bangalore',
      category: 'Grocery',
      entrance_gps_lat: 12.9716,
      entrance_gps_lng: 77.5946
    }
  });
  console.log(`✅ Created Store: ${store.name}`);

  // 3. CREATE THE STORE MAP (For our Indoor Navigation later!)
  await prisma.storeMap.create({
    data: {
      store_id: store.id,
      map_json: JSON.stringify({ width: 100, height: 100 }), // Fake coordinate grid
      aisle_coordinates_json: JSON.stringify([
        { id: 1, x_start: 10, y_start: 10, x_end: 15, y_end: 90 },
        { id: 2, x_start: 25, y_start: 10, x_end: 30, y_end: 90 },
        { id: 3, x_start: 40, y_start: 10, x_end: 45, y_end: 90 },
      ]),
      walkable_paths_json: JSON.stringify([])
    }
  });

  // 4. CREATE GROCERY PRODUCTS
  const dummyData = [
    { name: 'Milk', category: 'Dairy', price: 65, aisle: 2, hindi: '["doodh", "dudh"]' },
    { name: 'Eggs', category: 'Dairy', price: 80, aisle: 2, hindi: '["anda", "egg"]' },
    { name: 'Bread', category: 'Bakery', price: 40, aisle: 1, hindi: '["bread", "pav"]' },
    { name: 'Basmati Rice', category: 'Grains', price: 120, aisle: 3, hindi: '["chawal"]' },
    { name: 'Tomato', category: 'Vegetables', price: 30, aisle: 1, hindi: '["tamatar"]' },
  ];

  for (let item of dummyData) {
    // First create the standard dictionary item
    const master = await prisma.masterProduct.create({
      data: { name: item.name, category: item.category, hindi_names: item.hindi }
    });

    // Next put it physically on the shelf in our specific demo store
    const physical = await prisma.product.create({
      data: {
        store_id: store.id,
        master_product_id: master.id,
        price: item.price,
        aisle: item.aisle,
        shelf_x: item.aisle * 10, // Fake coordinate on the map
        shelf_y: 50
      }
    });

    // Finally add fake inventory stock
    await prisma.inventory.create({
      data: { store_id: store.id, product_id: physical.id, stock_level: 100 }
    });
  }
  console.log(`✅ Created Base Products & Inventory Tables`);

  // 5. CREATE A DEMO CUSTOMER
  const password_hash = await bcrypt.hash('password123', 10);
  await prisma.customer.create({
    data: {
      store_id: store.id,
      name: 'Priya Sharma', // Fictional user from your spec!
      email: 'demo@demo.com',
      phone: '9876543210',
      password_hash
    }
  });
  console.log(`✅ Created Demo Customer User`);

  // 6. CREATE FAKE MACHINE LEARNING RULES
  // (We'll use this later for the Suggestion Engine)
  await prisma.aprioriCache.create({
    data: {
      store_id: store.id,
      rules_json: JSON.stringify([
        { lhs: ['Milk'], rhs: ['Bread'], confidence: 0.72, lift: 1.8 }
      ])
    }
  });

  console.log('🎉 Seeding Complete! The database is now fully populated.');
}

runSeed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
