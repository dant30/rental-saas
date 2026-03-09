import { FormEvent, useMemo, useState } from "react";

import { Alert, Button, Input } from "../../../components/shared";
import { isEmail } from "../../../core/utils/validators";
import { AuthFormErrors, LoginPayload } from "../types";

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const LoginForm = ({ onSubmit, loading = false, error = null }: LoginFormProps) => {
  const [payload, setPayload] = useState<LoginPayload>({ username: "", password: "" });
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const usernameHint = useMemo(() => {
    if (!payload.username.trim()) {
      return "Use your username or account email.";
    }
    return isEmail(payload.username.trim()) ? "Signing in with email." : "Signing in with username.";
  }, [payload.username]);

  const validate = () => {
    const nextErrors: AuthFormErrors = {};
    if (!payload.username.trim()) {
      nextErrors.username = "Username or email is required.";
    }
    if (!payload.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (payload.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    return nextErrors;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(payload);
  };

  return (
    <form className="stack-list" onSubmit={submit}>
      {error ? <Alert variant="danger" title="Unable to sign in" description={error} /> : null}
      <Input
        autoComplete="username"
        label="Username or Email"
        hint={usernameHint}
        error={errors.username}
        onChange={(event) => setPayload((current) => ({ ...current, username: event.target.value }))}
        value={payload.username}
      />
      <Input
        autoComplete="current-password"
        label="Password"
        error={errors.password}
        onChange={(event) => setPayload((current) => ({ ...current, password: event.target.value }))}
        type="password"
        value={payload.password}
      />
      <Button type="submit" variant="primary" loading={loading}>
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
