const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const CONVERSION_RATE = 130;

    console.log(`Starting price conversion (Factor: ${CONVERSION_RATE})...`);

    // 1. Update Parts
    const parts = await prisma.part.findMany();
    for (const part of parts) {
        await prisma.part.update({
            where: { id: part.id },
            data: { price: part.price * CONVERSION_RATE }
        });
    }
    console.log(`Updated ${parts.length} parts.`);

    // 2. Update JobParts
    const jobParts = await prisma.jobPart.findMany();
    for (const jp of jobParts) {
        if (jp.priceAtTime) {
            await prisma.jobPart.update({
                where: { id: jp.id },
                data: { priceAtTime: jp.priceAtTime * CONVERSION_RATE }
            });
        }
    }
    console.log(`Updated ${jobParts.length} job-specific parts.`);

    // 3. Update Appointments (Base amount)
    const appointments = await prisma.appointment.findMany();
    for (const appt of appointments) {
        if (appt.amount) {
            await prisma.appointment.update({
                where: { id: appt.id },
                data: { amount: appt.amount * CONVERSION_RATE }
            });
        }
    }
    console.log(`Updated ${appointments.length} appointments.`);

    // 4. Update Invoices
    const invoices = await prisma.invoice.findMany();
    for (const inv of invoices) {
        await prisma.invoice.update({
            where: { id: inv.id },
            data: {
                laborCost: inv.laborCost * CONVERSION_RATE,
                partsTotal: inv.partsTotal * CONVERSION_RATE,
                tax: inv.tax * CONVERSION_RATE,
                totalAmount: inv.totalAmount * CONVERSION_RATE
            }
        });
    }
    console.log(`Updated ${invoices.length} invoices.`);

    console.log('✅ Price conversion completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during conversion:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
