import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { initializeSecrets } from "@/lib/awsSecretsManager";

// Initialize secrets before creating the NextAuth handler
async function getHandler() {
  await initializeSecrets();
  return NextAuth(authOptions);
}

export const GET = async (req: Request) => {
  const handler = await getHandler();
  return handler(req);
};

export const POST = async (req: Request) => {
  const handler = await getHandler();
  return handler(req);
};
