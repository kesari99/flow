import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  signupRequest,
} from "@/hooks/auth/auth.api";
import { toastApiError } from "@/lib/toast";

export const authKeys = {
  user: ["auth", "user"] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => loginRequest(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user, user);
      toast.success(`Welcome back, ${user.name}`);
    },
    onError: (error) => toastApiError(error, "Sign in failed"),
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      signupRequest(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user, user);
      toast.success("Account created", {
        description: `Signed in as ${user.email}`,
      });
    },
    onError: (error) => toastApiError(error, "Sign up failed"),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      toast.success("Signed out");
    },
    onError: (error) => toastApiError(error, "Logout failed"),
  });
}
