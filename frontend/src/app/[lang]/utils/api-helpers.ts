export function getStrapiURL(path = '') {
    // In the browser, Strapi is not directly reachable (it listens on an
    // internal port inside the container). Use a same-origin relative URL;
    // Next.js rewrites proxy /api/* and /uploads/* to Strapi server-side.
    if (typeof window !== 'undefined') {
        return path;
    }
    return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${path}`;
}

export function getStrapiMedia(url: string | null) {
    if (url == null) {
        return null;
    }

    // Media uploaded to the bundled Strapi instance is stored with a relative
    // "/uploads/..." path. Keep it relative so the browser requests it from
    // this app's own origin; Next.js rewrites proxy /uploads/* to Strapi.
    // (Strapi itself runs on an internal port the browser cannot reach.)
    if (url.startsWith('/')) {
        return url;
    }

    // Absolute URLs that point at the internal Strapi host would be
    // unreachable from the browser; rewrite them to a relative path too.
    const internalHost = /^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:\d+)?(\/.*)?$/;
    const match = url.match(internalHost);
    if (match) {
        return match[3] || '/';
    }

    // Media hosted on a real external provider: use it as-is.
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }

    return `${getStrapiURL()}/${url}`;
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ADDS DELAY TO SIMULATE SLOW API REMOVE FOR PRODUCTION
export const delay = (time: number) => new Promise((resolve) => setTimeout(() => resolve(1), time));
