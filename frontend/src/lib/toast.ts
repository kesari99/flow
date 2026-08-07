import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

export function toastApiError(error: unknown, fallbackTitle = "Request failed") {
  toast.error(fallbackTitle, {
    description: getErrorMessage(error),
  });
}
