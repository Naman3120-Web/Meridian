const { PrismaClient } = require('@prisma/client');

// We create a single instance of the PrismaClient to use throughout the entire app.
// If we created a new instance in every file, we would exhaust database connections quickly!
const prisma = new PrismaClient({
  // Only log queries if you want to debug what SQL is actually running
  // log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
