import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const envName = process.env.NODE_ENV || "development";
const envFiles = [
  `.env.${envName}.local`,
  `.env.local`,
  `.env.${envName}`,
  ".env",
];

for (const envFile of envFiles) {
  const candidatePaths = [
    path.resolve(process.cwd(), envFile),
    path.resolve(__dirname, "..", "..", envFile),
  ];

  for (const candidatePath of candidatePaths) {
    dotenv.config({ path: candidatePath });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  TRUST_PROXY: z.coerce.number().default(1),
  APP_VERSION: z.string().default("1.0.0"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CORS_ORIGIN: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  FCM_SERVER_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";