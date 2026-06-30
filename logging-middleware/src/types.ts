export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export type BackendPackage =
    | "cache"
    | "controller"
    | "cron_job"
    | "db"
    | "domain"
    | "handler"
    | "repository"
    | "route"
    | "service";

export type FrontendPackage =
    | "api"
    | "component"
    | "hook"
    | "page"
    | "state"
    | "style";

export type SharedPackage = "auth" | "config" | "middleware" | "utils";

export type Package = BackendPackage | FrontendPackage | SharedPackage;

export const STACK_VALUES: readonly Stack[] = ["backend", "frontend"];

export const LEVEL_VALUES: readonly Level[] = [
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
];

export const BACKEND_ONLY_PACKAGES: readonly BackendPackage[] = [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",
];

export const FRONTEND_ONLY_PACKAGES: readonly FrontendPackage[] = [
    "api",
    "component",
    "hook",
    "page",
    "state",
    "style",
];

export const SHARED_PACKAGES: readonly SharedPackage[] = [
    "auth",
    "config",
    "middleware",
    "utils",
];

export interface LogResponse {
    logID: string;
    message: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    mobileNo: string;
    githubUsername: string;
    rollNo: string;
    accessCode: string;
}

export interface RegisterResponse {
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
}

export interface AuthRequest {
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
}

export interface AuthResponse {
    token_type: string;
    access_token: string;
    expires_in: number;
}

export interface LoggerConfig {
    baseUrl?: string;
    email: string;
    name: string;
    rollNo: string;
    accessCode: string;
    clientID: string;
    clientSecret: string;
    silentFailure?: boolean;
}
