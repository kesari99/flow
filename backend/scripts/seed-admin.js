import dotenv from "dotenv";
import { hashPassword } from "../src/auth.ts";
import db from "../src/models/index.ts";
import { UserRole } from "../../shared/schemas/auth.schema.ts";

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || "dev"}` });

const name = "Kesari";
const email = "kesariadmin@gmail.com";
const password = "Admin@1234";

async function seedAdmin() {
  const existing = await db.User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  await db.User.create({
    name,
    email,
    password: hashed,
    role: UserRole.ADMIN,
    is_active: true,
    metadata: {},
  });

  console.log("Admin user created successfully");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("Change the password after first login.");
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
