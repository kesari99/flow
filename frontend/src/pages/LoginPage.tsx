import { useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthHero } from "@/components/auth/AuthHero";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUserQuery } from "@/hooks/auth";

const AUTH_HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userQuery = useCurrentUserQuery();

  const mode = useMemo(() => {
    return searchParams.get("mode") === "signup" ? "signup" : "signin";
  }, [searchParams]);

  if (userQuery.data) {
    return <Navigate to="/flows" replace />;
  }

  const handleSuccess = () => {
    navigate("/flows", { replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero imageUrl={AUTH_HERO_IMAGE} />

      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="auth-panel w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <p className="text-2xl font-semibold tracking-tight">Promptflow</p>
            <p className="text-sm text-muted-foreground">
              Sign in to build and version AI chat flows.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start building flows in a few seconds."
                : "Sign in to continue to your workspace."}
            </p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(value) => {
              setSearchParams(value === "signup" ? { mode: "signup" } : {});
            }}
            className="w-full"
          >
            <TabsList className="grid h-11 w-full grid-cols-2 gap-1.5 bg-muted p-1">
              <TabsTrigger
                value="signin"
                className="px-3 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="px-3 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
              >
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm onSuccess={handleSuccess} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
