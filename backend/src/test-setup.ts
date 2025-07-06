import { beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { contactsTable, customFieldsTable } from './db/schema';
import * as schema from './db/schema';

process.env.NODE_ENV = 'test';

const testDatabaseUrl = 'file::memory:?cache=shared';

export async function setupTestDatabase() {
    console.log('Setting up in-memory test database...');

    process.env.NODE_ENV = 'test';
    process.env.DB_URL = testDatabaseUrl;

    try {
        const testDb = drizzle({
            connection: { url: testDatabaseUrl },
            schema: schema
        });

        await migrate(testDb, {
            migrationsFolder: './src/db/migrations'
        });

        console.log('In-memory test database created with migrations');

    } catch (error) {
        console.error('Error setting up in-memory test database:', error);
        throw error;
    }
}

export async function cleanupTestData() {
    console.log('Cleaning up test data...');

    try {
        const { default: db } = await import('./db/index');

        await db.delete(customFieldsTable);
        await db.delete(contactsTable);
        console.log('Test data cleaned up');
    } catch (error) {
        console.error('Error cleaning up test data:', error);
    }
}

export async function teardownTestDatabase() {
    console.log('Cleaning up in-memory test database...');
    process.env.NODE_ENV = 'development';
    console.log('In-memory test database will be automatically disposed');
}

beforeAll(async () => {
    await setupTestDatabase();
}, 30000);

afterAll(async () => {
    await teardownTestDatabase();
});
