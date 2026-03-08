import { FormEvent, useState } from "react";

import { Button, Input } from "../../../components/shared";
import { LoginPayload } from "../types";

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => Promise<void>;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [payload, setPayload] = useState<LoginPayload>({ username: "", password: "" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(payload);
  };

  return (
    <form className="stack-list" onSubmit={submit}>
      <Input
        label="Username"
        onChange={(event) => setPayload((current) => ({ ...current, username: event.target.value }))}
        value={payload.username}
      />
      <Input
        label="Password"
        onChange={(event) => setPayload((current) => ({ ...current, password: event.target.value }))}
        type="password"
        value={payload.password}
      />
      <Button type="submit" variant="primary">
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
