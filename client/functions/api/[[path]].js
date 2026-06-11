const BACKEND_ORIGIN = "https://workcraft-backend.onrender.com";
const ML_ORIGIN = "https://workcraft-2.onrender.com";

const ML_PATHS = new Set(["/api/market-data", "/api/predict"]);

export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);
  const targetOrigin = ML_PATHS.has(incomingUrl.pathname)
    ? ML_ORIGIN
    : BACKEND_ORIGIN;
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, targetOrigin);
  const headers = new Headers(context.request.headers);

  headers.set("host", targetUrl.host);
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("x-forwarded-proto");

  return fetch(targetUrl, {
    method: context.request.method,
    headers,
    body:
      context.request.method === "GET" || context.request.method === "HEAD"
        ? undefined
        : context.request.body,
    redirect: "manual",
  });
}
