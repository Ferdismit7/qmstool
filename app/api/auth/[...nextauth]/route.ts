import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

// Create NextAuth handler with configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
