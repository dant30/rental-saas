import { Link, useNavigate } from "react-router-dom";

import { Alert, Card } from "../../../components/shared";
import { routePaths } from "../../../core/constants/routePaths";
import { useToast } from "../../../core/contexts/ToastContext";
import RegisterForm from "../components/RegisterForm";
import { authApi } from "../services/authApi";
import { useState } from "react";
import { toErrorMessage } from "../../../core/utils/errorHandler";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10" dir="ltr">
      <Card className="stack-list">
        <h3>Register</h3>
        {error ? <Alert variant="danger" title="Registration failed" description={error} /> : null}
        <RegisterForm
          loading={isSubmitting}
          error={error}
          onSubmit={async (payload) => {
            setIsSubmitting(true);
            setError(null);
            try {
              await authApi.register(payload);
              pushToast("Registration submitted. You can now sign in.", "success");
              navigate(routePaths.login);
            } catch (submissionError) {
              const message = toErrorMessage(submissionError, "Unable to register.");
              setError(message);
              pushToast(message, "danger");
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
        <p className="theme-help">
          Already have an account? <Link to={routePaths.login}>Back to login</Link>
        </p>
      </Card>
    </section>
  );
};

export default RegisterPage;
