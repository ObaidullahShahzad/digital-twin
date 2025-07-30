"use server";

import { cookies } from "next/headers";

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
}

export const setCookie = async (
  cookieName: string,
  cookieValue: string,
  config: CookieOptions = {}
) => {
  try {
    console.log("Setting cookie:", { cookieName, cookieValue, config });
    const cookieStore = await cookies();
    cookieStore.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...config,
    });
    console.log("Cookie set successfully:", cookieName);
    return { cookieName, cookieValue };
  } catch (error) {
    console.error("Failed to set cookie:", error);
    throw new Error("Failed to set cookie");
  }
};

export const getCookie = async (cookieName: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName);
};

export const deleteCookie = async (cookieName: string) => {
  const cookieStore = await cookies();
  return cookieStore.delete(cookieName);
};