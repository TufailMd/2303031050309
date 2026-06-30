import {
    Stack,
    Level,
    Package,
    STACK_VALUES,
    LEVEL_VALUES,
    BACKEND_ONLY_PACKAGES,
    FRONTEND_ONLY_PACKAGES,
    SHARED_PACKAGES,
} from "./types";

export class LogValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LogValidationError";
    }
}

export function validateLogInput(
    stack: string,
    level: string,
    pkg: string,
    message: string
): asserts stack is Stack {
    if (!stack || typeof stack !== "string") {
        throw new LogValidationError("stack is required and must be a string");
    }
    if (!level || typeof level !== "string") {
        throw new LogValidationError("level is required and must be a string");
    }
    if (!pkg || typeof pkg !== "string") {
        throw new LogValidationError("package is required and must be a string");
    }
    if (!message || typeof message !== "string") {
        throw new LogValidationError("message is required and must be a string");
    }

    if (!STACK_VALUES.includes(stack as Stack)) {
        throw new LogValidationError(
            `Invalid stack "${stack}". Must be one of: ${STACK_VALUES.join(", ")}`
        );
    }

    if (!LEVEL_VALUES.includes(level as Level)) {
        throw new LogValidationError(
            `Invalid level "${level}". Must be one of: ${LEVEL_VALUES.join(", ")}`
        );
    }

    const isShared = SHARED_PACKAGES.includes(pkg as any);
    const isBackendOnly = BACKEND_ONLY_PACKAGES.includes(pkg as any);
    const isFrontendOnly = FRONTEND_ONLY_PACKAGES.includes(pkg as any);

    if (!isShared && !isBackendOnly && !isFrontendOnly) {
        throw new LogValidationError(
            `Invalid package "${pkg}". Not a recognized package for either stack.`
        );
    }

    if (stack === "backend" && isFrontendOnly) {
        throw new LogValidationError(
            `Package "${pkg}" is frontend-only and cannot be used with stack "backend".`
        );
    }

    if (stack === "frontend" && isBackendOnly) {
        throw new LogValidationError(
            `Package "${pkg}" is backend-only and cannot be used with stack "frontend".`
        );
    }
}