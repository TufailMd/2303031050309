import { LoggerConfig, LogResponse, Stack, Level, Package } from "./types";
import { validateLogInput } from "./validate";
import { getAuthToken } from "./auth";

const DEFAULT_BASE_URL = "http://4.224.186.213/evaluation-service";

function getBaseUrl(config: LoggerConfig): string {
    return config.baseUrl ?? DEFAULT_BASE_URL;
}

async function sendLog(
    config: LoggerConfig,
    stack: Stack,
    level: Level,
    pkg: Package,
    message: string,
    retry = true
): Promise<LogResponse> {
    const token = await getAuthToken(config);

    const res = await fetch(`${getBaseUrl(config)}/logs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    if (res.status === 401 && retry) {
        await getAuthToken(config, true);
        return sendLog(config, stack, level, pkg, message, false);
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `Log API request failed with status ${res.status}: ${text || res.statusText}`
        );
    }

    return (await res.json()) as LogResponse;
}

export function createLogger(config: LoggerConfig) {
    const silentFailure = config.silentFailure ?? true;

    return async function Log(
        stack: Stack,
        level: Level,
        pkg: Package,
        message: string
    ): Promise<LogResponse | null> {
        try {
            validateLogInput(stack, level, pkg, message);
            return await sendLog(config, stack, level, pkg, message);
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : String(err);
            if (silentFailure) {
                console.warn(`[logging-middleware] Failed to send log: ${errMessage}`);
                return null;
            }
            throw err;
        }
    };
}

export type LogFn = ReturnType<typeof createLogger>;
