import { FormEvent, useState } from "react";

import { Button, Card, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { authApi } from "../services/authApi";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { pushToast } = useToast();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await authApi.requestPasswordReset({ email });
    pushToast(response.detail, "success");
  };

  return (
    <Card>
      <h3>Forgot Password</h3>
      <form className="stack-list" onSubmit={submit}>
        <Input label="Email" onChange={(event) => setEmail(event.target.value)} value={email} />
        <Button type="submit" variant="primary">
          Send reset link
        </Button>
      </form>
    </Card>
  );
};

export default ForgotPasswordPage;
