import { hasClerkPublishableKey, hasClerkSecretKey } from "@/lib/clerkConfig";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const hasClerkKeys = hasClerkPublishableKey() && hasClerkSecretKey();

const proxy = hasClerkKeys
  ? clerkMiddleware()
  : (_req: NextRequest) => {
      void _req;
      return NextResponse.next();
    };

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

