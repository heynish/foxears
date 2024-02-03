// query.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const masks = await prisma.masks.findMany()
    console.log(masks)
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })