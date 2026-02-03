import { NextResponse } from "next/server";
import { COOKIE_KEYS } from "@/lib/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: COOKIE_KEYS.AUTH_TOKEN,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: COOKIE_KEYS.USER_DATA,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: COOKIE_KEYS.BACKEND_SESSION,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
