/**
 * Seed script for nested category data
 *
 * Creates nested category trees for inventory testing.
 *
 * Usage:
 *   node scripts/seed-nested-categories.js                     # uses .env
 *   node scripts/seed-nested-categories.js .env.development    # uses .env.development
 *
 * Optional:
 *   ORG_ID=<orgId> node scripts/seed-nested-categories.js
 *   ORG_IDS=<id1,id2> node scripts/seed-nested-categories.js
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

if (!MONGO_URI)
{
    console.error('Error: MONGODB_URI not found in environment variables');
    console.error(`Loaded env file: ${envFile}`);
    process.exit(1);
}

const CATEGORY_TREE = [
    {
        name: 'Spirits',
        description: 'Distilled alcoholic beverages',
        children: [
            { name: 'Whiskey', description: 'Whiskey and whisky varieties' },
            { name: 'Gin', description: 'Classic and craft gin' },
            { name: 'Vodka', description: 'Neutral spirits and flavored vodka' },
            { name: 'Rum', description: 'White, dark, and aged rum' },
            { name: 'Tequila', description: 'Blanco, reposado, and añejo tequila' },
            { name: 'Brandy', description: 'Brandy and cognac' },
        ],
    },
    {
        name: 'Wines',
        description: 'Red, white, and sparkling wines',
        children: [
            { name: 'Red Wine', description: 'Red wine varieties' },
            { name: 'White Wine', description: 'White wine varieties' },
            { name: 'Sparkling Wine', description: 'Sparkling and prosecco' },
            { name: 'Vermouth', description: 'Sweet and dry vermouth' },
        ],
    },
    {
        name: 'Mixers',
        description: 'Sodas, juices, and other mixers',
        children: [
            { name: 'Soda', description: 'Sodas and sparkling mixers' },
            { name: 'Juice', description: 'Citrus and fruit juices' },
            { name: 'Syrups', description: 'Simple and flavored syrups' },
            { name: 'Ginger Beer', description: 'Ginger beer and spice mixers' },
        ],
    },
    {
        name: 'Bitters',
        description: 'Cocktail bitters and amari',
        children: [
            { name: 'Aromatic Bitters', description: 'Aromatic bitters and blends' },
            { name: 'Citrus Bitters', description: 'Citrus-forward bitters' },
            { name: 'Herbal Bitters', description: 'Herbal and floral bitters' },
        ],
    },
];

const getOrgIdsFromEnv = () =>
{
    if (process.env.ORG_IDS)
    {
        return process.env.ORG_IDS.split(',').map((id) => id.trim()).filter(Boolean);
    }

    if (process.env.ORG_ID)
    {
        return [process.env.ORG_ID];
    }

    return [];
};

const ensureCategory = async (collection, orgId, name, description, parentId) =>
{
    const query = {
        orgId,
        name,
        parentId: parentId ?? null,
    };

    const existing = await collection.findOne(query);
    if (existing)
    {
        return existing._id;
    }

    const now = new Date();
    const result = await collection.insertOne({
        name,
        description,
        parentId: parentId ?? null,
        orgId,
        createdAt: now,
        updatedAt: now,
    });

    return result.insertedId;
};

const resolveOrgIds = async (db) =>
{
    const envOrgIds = getOrgIdsFromEnv();
    if (envOrgIds.length > 0)
    {
        return envOrgIds.map((id) => new ObjectId(id));
    }

    const orgs = await db.collection('orgs').find({}, { projection: { _id: 1 } }).toArray();
    if (orgs.length === 0)
    {
        throw new Error('No organizations found in database');
    }

    return orgs.map((org) => org._id);
};

const seedForOrg = async (collection, orgId) =>
{
    console.log(`\nSeeding nested categories for org: ${orgId.toString()}`);

    for (const parent of CATEGORY_TREE)
    {
        const parentId = await ensureCategory(
            collection,
            orgId,
            parent.name,
            parent.description,
            null,
        );

        for (const child of parent.children)
        {
            await ensureCategory(
                collection,
                orgId,
                child.name,
                child.description,
                parentId,
            );
        }
    }

    console.log('✓ Nested categories ensured');
};

const seed = async () =>
{
    console.log(`Using env file: ${envFile}`);
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    try
    {
        const orgIds = await resolveOrgIds(db);
        const collection = db.collection('categories');

        for (const orgId of orgIds)
        {
            await seedForOrg(collection, orgId);
        }

        console.log('\n✅ Nested category seed complete!');
        console.log(`   Database: ${DB_NAME}`);
        console.log(`   Organizations: ${orgIds.length}`);
    }
    finally
    {
        await client.close();
    }
};

seed().catch((err) =>
{
    console.error('Seed failed:', err);
    process.exit(1);
});
