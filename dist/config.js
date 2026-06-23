import "dotenv/config";
const { BOT_TOKEN, ADMIN_CHAT_ID, PROXY_URL } = process.env;
if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN не задан в .env");
}
const parsedAdminChatId = Number(ADMIN_CHAT_ID);
if (!ADMIN_CHAT_ID || !Number.isFinite(parsedAdminChatId)) {
    throw new Error("ADMIN_CHAT_ID должен быть числом в .env");
}
function encodeCredentialComponent(value) {
    try {
        return encodeURIComponent(decodeURIComponent(value));
    }
    catch {
        return encodeURIComponent(value);
    }
}
function encodeProxyCredentials(proxyUrl) {
    const schemeMatch = proxyUrl.match(/^(socks4|socks4a|socks5|socks5h):\/\//i);
    if (!schemeMatch) {
        throw new Error("PROXY_URL должен быть вида socks5://... или socks4://...");
    }
    const scheme = schemeMatch[0];
    const rest = proxyUrl.slice(scheme.length);
    const authEnd = rest.lastIndexOf("@");
    if (authEnd === -1) {
        return proxyUrl;
    }
    const auth = rest.slice(0, authEnd);
    const host = rest.slice(authEnd + 1);
    const passwordStart = auth.indexOf(":");
    if (passwordStart === -1) {
        return `${scheme}${encodeCredentialComponent(auth)}@${host}`;
    }
    const username = auth.slice(0, passwordStart);
    const password = auth.slice(passwordStart + 1);
    return `${scheme}${encodeCredentialComponent(username)}:${encodeCredentialComponent(password)}@${host}`;
}
function normalizeProxyUrl(proxyUrl) {
    const trimmedProxyUrl = proxyUrl?.trim();
    if (!trimmedProxyUrl) {
        return undefined;
    }
    try {
        const encodedProxyUrl = encodeProxyCredentials(trimmedProxyUrl);
        const url = new URL(encodedProxyUrl);
        if (!url.protocol.startsWith("socks")) {
            throw new Error("PROXY_URL должен быть вида socks5://... или socks4://...");
        }
        if (!url.hostname) {
            throw new Error("PROXY_URL не содержит хоста");
        }
        return url.toString();
    }
    catch (error) {
        if (error instanceof TypeError || error instanceof URIError) {
            throw new Error(`PROXY_URL некорректен: ${error.message}. Используйте формат socks5://user:password@host:port`);
        }
        throw error;
    }
}
export const config = {
    botToken: BOT_TOKEN,
    adminChatId: parsedAdminChatId,
    proxyUrl: normalizeProxyUrl(PROXY_URL),
};
