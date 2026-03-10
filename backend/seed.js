const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const parts = [
    { name: 'Front Brake Pads', sku: 'SKU-BP-001', category: 'Brakes', stock: 3, minStock: 5, maxStock: 20, unit: 'sets' },
    { name: 'Engine Oil 5W-30', sku: 'SKU-OL-030', category: 'Fluids', stock: 7, minStock: 10, maxStock: 40, unit: 'litres' },
    { name: 'Air Filter (Universal)', sku: 'SKU-AF-002', category: 'Filters', stock: 18, minStock: 5, maxStock: 25, unit: 'units' },
    { name: 'Spark Plugs (Set)', sku: 'SKU-SP-011', category: 'Engine', stock: 12, minStock: 10, maxStock: 30, unit: 'sets' }
  ];

  for (const part of parts) {
    let status = 'OK';
    if (part.stock <= part.minStock) status = 'Low';
    if (part.stock <= 2) status = 'Critical';

    await prisma.part.upsert({
      where: { sku: part.sku },
      update: { stock: part.stock, status },
      create: { ...part, status }
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
