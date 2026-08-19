import qs from "qs";
import { getStrapiURL } from "./api-helpers";

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  // Merge default and user options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options as any).headers || {}),
  };

  // Never send a broken "Bearer undefined" header: Strapi treats any
  // Authorization header as an auth attempt, turning public reads into 401s.
  const auth = headers.Authorization;
  if (!auth || /^Bearer\s*(undefined|null)?$/.test(auth.trim())) {
    delete headers.Authorization;
  }

  const mergedOptions = {
    next: { revalidate: 60 },
    ...options,
    headers,
  };

  try {
    // Build request URL
    const queryString = qs.stringify(urlParamsObject);
    const requestUrl = `${getStrapiURL(
      `/api${path}${queryString ? `?${queryString}` : ""}`
    )}`;

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);
    return await response.json();
  } catch (error) {
    // Fail soft: an unreachable Strapi should degrade to empty content,
    // never a hard 500 on every page.
    console.error(`fetchAPI(${path}) failed:`, error);
    return { data: null, meta: {}, error: true };
  }
}
