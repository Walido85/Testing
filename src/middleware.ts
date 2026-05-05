import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search, hash } = context.url;

  // 1. Professional Trailing Slash Redirect
  // Avoid redirecting for files (containing .) and the root path
  if (pathname.length > 1 && !pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
    return context.redirect(`${pathname}/${search}${hash}`, 301);
  }

  return next();
});
