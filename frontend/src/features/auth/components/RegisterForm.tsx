import { FormEvent, useState } from "react";

import { Button, Input } from "../../../components/shared";
import { RegisterPayload } from "../types";

interface RegisterFormProps {
  onSubmit: (payload: RegisterPayload) => Promise<void>;
}

const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const [payload, setPayload] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user_type: "landlord",
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(payload);
  };

  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Username" onChange={(event) => setPayload((c) => ({ ...c, username: event.target.value }))} value={payload.username} />
      <Input label="Email" onChange={(event) => setPayload((c) => ({ ...c, email: event.target.value }))} value={payload.email} />
      <Input label="Password" onChange={(event) => setPayload((c) => ({ ...c, password: event.target.value }))} type="password" value={payload.password} />
      <Button type="submit" variant="primary">
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
