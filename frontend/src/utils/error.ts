export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
    if (typeof error === "string") return error;

    const message = (error as { response?: { data?: { message?: string } }; message?: string } | undefined)?.response?.data?.message
        ?? (error as { message?: string } | undefined)?.message
        ?? fallback;

    if (message.includes("ECONN") || message.includes("network")) return "We couldn’t reach the server. Please check your connection and try again.";
    if (message.includes("Unauthorized") || message.includes("authorization")) return "Your session has expired. Please sign in again.";
    if (message.includes("Validation") || message.includes("invalid")) return "Some details look invalid. Please review the form and try again.";
    if (message.includes("already exists")) return "That email is already in use. Please use a different one.";
    return message;
}
