import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignupMutation } from "@/hooks/auth";

type SignUpFormProps = {
  onSuccess: () => void;
};

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const signupMutation = useSignupMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await signupMutation.mutateAsync({ name, email, password });
    onSuccess();
  };

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ada Lovelace"
          required
          minLength={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Min 8 chars, mixed case, number, symbol"
          required
          minLength={8}
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Use at least 8 characters with upper, lower, number, and a special
          character.
        </p>
      </div>
      <Button
        type="submit"
        className="h-10 w-full"
        disabled={signupMutation.isPending}
      >
        {signupMutation.isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
