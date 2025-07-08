"use server";

import { cookies } from "next/headers";

export const setCookie = async (
  cookieName: string,
  cookieValue: string,
  config?: {
    maxAge?: number;
  }
) => {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, cookieValue, {
    // config maxAge or 6 hours
    maxAge: config?.maxAge || 21600,
  });

  return { cookieName, cookieValue };
};
export const getCookie = async (cookieName: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName);
};

export const deleteCookie = async (cookieName: string) => {
  const cookieStore = await cookies();
  return cookieStore.delete(cookieName);
};
