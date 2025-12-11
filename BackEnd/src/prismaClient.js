const { PrismaClient } = require('@prisma/client');
// Pass an explicit options object to avoid initialization errors in some environments
const prisma = new PrismaClient({});
module.exports = prisma;
