import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const user = await db.user.upsert({
    where: { username: "handi" },
    update: {},
    create: {
      email: "handi@example.com",
      username: "handi",
      name: "Handi",
      bio: "Building Tautree 🌳",
      links: {
        create: [
          { title: "GitHub", url: "https://github.com/ByHandi", order: 0 },
          { title: "Website", url: "https://example.com", order: 1 },
          {
            title: "Twitter / X",
            url: "https://x.com/handi",
            order: 2,
            isActive: false,
          },
        ],
      },
    },
    include: { links: true },
  });

  console.log(`Seeded user @${user.username} with ${user.links.length} links.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
