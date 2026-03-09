import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Alert, Button, Card, Input } from "../../../components/shared";
import { routePaths } from "../../../core/constants/routePaths";
import { useToast } from "../../../core/contexts/ToastContext";
import { isEmail } from "../../../core/utils/validators";
import { toErrorMessage } from "../../../core/utils/errorHandler";
import { useAuth } from "../hooks/useAuth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pushToast } = useToast();
  const { requestPasswordReset } = useAuth();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset({ email: email.trim() });
      pushToast(response.detail, "success");
    } catch (submissionError) {
      const message = toErrorMessage(submissionError, "Unable to request password reset.");
      setError(message);
      pushToast(message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10" dir="ltr">
      <Card className="stack-list">
        <h3>Forgot Password</h3>
        {error ? <Alert variant="danger" title="Reset request failed" description={error} /> : null}
        <form className="stack-list" onSubmit={submit}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            error={error || undefined}
          />
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
        <p className="theme-help">
          Remembered your password? <Link to={routePaths.login}>Back to login</Link>
        </p>
      </Card>
    </section>
  );
};

export default ForgotPasswordPage;
