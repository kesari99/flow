export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load session");
  }

  return (await response.json()) as AuthUser;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = (await response.json()) as AuthUser & { message?: string };

  if (!response.ok) {
    throw new Error(body.message || "Invalid email or password");
  }

  return body;
}

export async function signupRequest(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as AuthUser & { message?: string };

  if (!response.ok) {
    throw new Error(body.message || "Could not create account");
  }

  return body;
}

export async function logoutRequest(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to log out");
  }
}
