import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWebView() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();

  const isIos = /iphone|ipad|ipod/.test(ua);

  // Common identifiers for in-app browsers/webviews
  const isMessenger = /messenger|fbav|fbios|fban/.test(ua);
  const isInstagram = /instagram/.test(ua);
  const isSlack = /slack/.test(ua);
  const isLine = /line/.test(ua);
  const isWebview =
    /wv/.test(ua) || (isIos && !/safari/.test(ua) && !/chrome/.test(ua));

  return isMessenger || isInstagram || isSlack || isLine || isWebview;
}
