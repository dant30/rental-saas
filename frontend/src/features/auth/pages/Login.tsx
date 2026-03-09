import { Link, useLocation, useNavigate } from "react-router-dom";

import { Alert, Card } from "../../../components/shared";
import { routePaths } from "../../../core/constants/routePaths";
import { useToast } from "../../../core/contexts/ToastContext";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { toErrorMessage } from "../../../core/utils/errorHandler";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useToast();
  const auth = useAuth();
  const redirectPath = ((location.state as { from?: string } | null)?.from || routePaths.dashboard);

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-10" dir="ltr">
      <Card className="stack-list">
        <h3>Login</h3>
        {auth.status === "error" && auth.error ? (
          <Alert variant="danger" title="Sign in failed" description={auth.error} />
        ) : null}
        <LoginForm
          loading={auth.status === "loading"}
          error={auth.error}
          onSubmit={async (payload) => {
            try {
              await auth.login(payload);
              pushToast("Authenticated via JWT", "success");
              navigate(redirectPath);
            } catch (error) {
              pushToast(toErrorMessage(error, "Unable to sign in."), "danger");
            }
          }}
        />
        <p className="theme-help">
          <Link to={routePaths.forgotPassword}>Forgot password?</Link>
        </p>
        <p className="theme-help">
          New here? <Link to={routePaths.register}>Create an account</Link>
        </p>
      </Card>
    </section>
  );
};

export default LoginPage;
