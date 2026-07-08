import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.university.upsert({
    where: { name: "Federal University Otuoke" },
    update: {
      slug: "fuotuoke",
      city: "Otuoke",
      country: "Nigeria",
    },
    create: {
      name: "Federal University Otuoke",
      slug: "fuotuoke",
      city: "Otuoke",
      country: "Nigeria",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
