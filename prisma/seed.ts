import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

/**
 * Bootstrap the admin account from the ADMIN_EMAIL env var.
 *
 * Idempotent and safe in production — run on every deploy (see entrypoint.sh).
 * Promotes the matching user to ADMIN if they exist, or pre-creates a bare
 * account (no username) so the role is in place before their first sign-in.
 * A no-op when ADMIN_EMAIL is unset.
 *
 * Note: the seeded account should sign in via the magic link (it matches by
 * email). Google sign-in on a pre-seeded email can hit OAuthAccountNotLinked
 * unless email account-linking is enabled.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log("→ ADMIN_EMAIL not set — skipping admin seed.");
    return;
  }

  const user = await db.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, role: "ADMIN" },
    select: { email: true, username: true },
  });

  const who = user.username ? `@${user.username}` : user.email;
  console.log(`→ Admin role ensured for ${who}.`);
}

/**
 * Demo data for local development. Skipped in production so deploys don't get
 * dummy users (the seed runs on every container start via entrypoint.sh).
 */
async function seedDemo() {
  if (process.env.NODE_ENV === "production") {
    console.log("→ NODE_ENV=production — skipping demo seed.");
    return;
  }

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
          { type: "HEADER", title: "Find me online", order: 0 },
          { title: "GitHub", url: "https://github.com/ByHandi", order: 1 },
          { title: "Website", url: "https://example.com", order: 2 },
          {
            title: "Twitter / X",
            url: "https://x.com/handi",
            order: 3,
            isActive: false,
          },
        ],
      },
    },
    include: { links: true },
  });

  console.log(`Seeded user @${user.username} with ${user.links.length} links.`);
}

async function main() {
  await seedAdmin();
  await seedDemo();
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
