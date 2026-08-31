const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

p.$connect()
    .then(() => {
        console.log('✅ Prisma connected to database');
    })
    .catch((err) => {
        console.error('❌ Prisma connection error:');
        console.error(err);
    })
    .finally(async () => {
        try { await p.$disconnect(); } catch { };
        process.exit(0);
    });
