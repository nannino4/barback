/**
 * Seed script for inventory test data
 * 
 * Creates sample categories and products for testing the inventory page.
 * 
 * Usage:
 *   node scripts/seed-inventory-data.js                     # uses .env
 *   node scripts/seed-inventory-data.js .env.development    # uses .env.development
 * 
 * Prerequisites:
 *   - MongoDB running
 *   - At least one organization in the database
 */

const envFile = process.argv[2] || '.env';
require('dotenv').config({ path: envFile });

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'test';

if (!MONGO_URI) {
  console.error('Error: MONGODB_URI not found in environment variables');
  console.error(`Loaded env file: ${envFile}`);
  process.exit(1);
}

// Change this to your organization ID
const ORG_ID = '696b24936129b742ca2bdf2f';

async function seed() {
  console.log(`Using env file: ${envFile}`);
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const orgId = new ObjectId(ORG_ID);

  console.log(`Seeding data for organization: ${ORG_ID}`);

  // ==========================================================================
  // Categories
  // ==========================================================================

  const categories = [
    {
      _id: new ObjectId(),
      name: 'Spirits',
      description: 'Distilled alcoholic beverages',
      parentId: null,
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      name: 'Wines',
      description: 'Red, white, and sparkling wines',
      parentId: null,
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      name: 'Mixers',
      description: 'Sodas, juices, and other mixers',
      parentId: null,
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId(),
      name: 'Bitters',
      description: 'Cocktail bitters and amari',
      parentId: null,
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Clear existing categories for this org
  await db.collection('categories').deleteMany({ orgId: orgId });
  await db.collection('categories').insertMany(categories);
  console.log(`✓ Created ${categories.length} categories`);

  // ==========================================================================
  // Products
  // ==========================================================================

  const [spirits, wines, mixers, bitters] = categories;

  const products = [
    // Spirits
    {
      name: 'Tanqueray London Dry',
      brand: 'Tanqueray',
      defaultUnit: 'bottles',
      currentQuantity: 4,
      categoryIds: [spirits._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Hendricks Gin',
      brand: 'Hendricks',
      defaultUnit: 'bottles',
      currentQuantity: 2,
      categoryIds: [spirits._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Grey Goose Vodka',
      brand: 'Grey Goose',
      defaultUnit: 'bottles',
      currentQuantity: 6,
      categoryIds: [spirits._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Espolon Blanco Tequila',
      brand: 'Espolon',
      defaultUnit: 'bottles',
      currentQuantity: 3,
      categoryIds: [spirits._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Diplomatico Reserva',
      brand: 'Diplomatico',
      defaultUnit: 'bottles',
      currentQuantity: 2,
      categoryIds: [spirits._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Wines
    {
      name: 'Prosecco DOC',
      brand: 'La Marca',
      defaultUnit: 'bottles',
      currentQuantity: 12,
      categoryIds: [wines._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Pinot Grigio',
      brand: 'Santa Margherita',
      defaultUnit: 'bottles',
      currentQuantity: 8,
      categoryIds: [wines._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Mixers
    {
      name: 'Tonic Water',
      brand: 'Fever-Tree',
      defaultUnit: 'bottles',
      currentQuantity: 24,
      categoryIds: [mixers._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Ginger Beer',
      brand: 'Fever-Tree',
      defaultUnit: 'bottles',
      currentQuantity: 18,
      categoryIds: [mixers._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Fresh Lime Juice',
      defaultUnit: 'liters',
      currentQuantity: 2,
      categoryIds: [mixers._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Bitters
    {
      name: 'Angostura Bitters',
      brand: 'Angostura',
      defaultUnit: 'bottles',
      currentQuantity: 3,
      categoryIds: [bitters._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Orange Bitters',
      brand: 'Fee Brothers',
      defaultUnit: 'bottles',
      currentQuantity: 2,
      categoryIds: [bitters._id],
      orgId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Clear existing products for this org
  await db.collection('products').deleteMany({ orgId: orgId });
  await db.collection('products').insertMany(products);
  console.log(`✓ Created ${products.length} products`);

  // ==========================================================================
  // Done
  // ==========================================================================

  await client.close();
  console.log('\n✅ Seed complete!');
  console.log(`   Database: ${DB_NAME}`);
  console.log(`   Organization: ${ORG_ID}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${products.length}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
