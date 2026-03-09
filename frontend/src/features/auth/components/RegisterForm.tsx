import { FormEvent, useState } from "react";

import { Alert, Button, Input, Select } from "../../../components/shared";
import { isEmail } from "../../../core/utils/validators";
import { AuthFormErrors, RegisterPayload } from "../types";

interface RegisterFormProps {
  onSubmit: (payload: RegisterPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const RegisterForm = ({ onSubmit, loading = false, error = null }: RegisterFormProps) => {
  const [payload, setPayload] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    user_type: "landlord",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const validate = () => {
    const nextErrors: AuthFormErrors = {};

    if (!payload.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (!payload.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isEmail(payload.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!payload.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (payload.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!payload.confirm_password?.trim()) {
      nextErrors.confirm_password = "Please confirm your password.";
    } else if (payload.confirm_password !== payload.password) {
      nextErrors.confirm_password = "Passwords do not match.";
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
      {error ? <Alert variant="danger" title="Registration failed" description={error} /> : null}
      <Input
        autoComplete="username"
        label="Username"
        onChange={(event) => setPayload((c) => ({ ...c, username: event.target.value }))}
        value={payload.username}
        error={errors.username}
      />
      <Input
        autoComplete="given-name"
        label="First name"
        onChange={(event) => setPayload((c) => ({ ...c, first_name: event.target.value }))}
        value={payload.first_name}
        error={errors.first_name}
      />
      <Input
        autoComplete="family-name"
        label="Last name"
        onChange={(event) => setPayload((c) => ({ ...c, last_name: event.target.value }))}
        value={payload.last_name}
        error={errors.last_name}
      />
      <Input
        autoComplete="email"
        label="Email"
        type="email"
        onChange={(event) => setPayload((c) => ({ ...c, email: event.target.value }))}
        value={payload.email}
        error={errors.email}
      />
      <Select
        label="Account type"
        value={payload.user_type}
        onValueChange={(value) =>
          setPayload((c) => ({
            ...c,
            user_type: value as RegisterPayload["user_type"],
          }))
        }
        options={[
          { label: "Landlord", value: "landlord" },
          { label: "Owner", value: "owner" },
          { label: "Tenant", value: "tenant" },
          { label: "Caretaker", value: "caretaker" },
        ]}
        error={errors.user_type}
      />
      <Input
        autoComplete="new-password"
        label="Password"
        onChange={(event) => setPayload((c) => ({ ...c, password: event.target.value }))}
        type="password"
        value={payload.password}
        error={errors.password}
      />
      <Input
        autoComplete="new-password"
        label="Confirm password"
        onChange={(event) => setPayload((c) => ({ ...c, confirm_password: event.target.value }))}
        type="password"
        value={payload.confirm_password}
        error={errors.confirm_password}
      />
      <Button type="submit" variant="primary" loading={loading}>
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
