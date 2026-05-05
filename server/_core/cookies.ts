import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some((p) => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = ENV.isProduction ? true : isSecureRequest(req);
  // En production (cross-origin Vercel→Railway), sameSite=none+secure est requis.
  // En développement (même origine), lax suffit et évite les blocages navigateur.
  const sameSite: "none" | "lax" = ENV.isProduction ? "none" : "lax";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
