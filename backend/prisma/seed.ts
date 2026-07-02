import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.university.upsert({
    where: { slug: "fuo" },
    update: {},
    create: {
      name: "Federal University Otuoke",
      slug: "fuo",
      city: "Otuoke",
      country: "Nigeria",
    },
  });

  const amenities = ["WiFi", "Water Supply", "24/7 Electricity", "Security", "Parking", "Kitchen", "POP Ceiling", "Fenced Compound"];
  for (const name of amenities) {
    await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
