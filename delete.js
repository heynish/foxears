// delete_all_records.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deleteAllMasks = await prisma.masks.deleteMany({});
    console.log(`Deleted ${deleteAllMasks.count} records from the masks table.`);
}

main()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });