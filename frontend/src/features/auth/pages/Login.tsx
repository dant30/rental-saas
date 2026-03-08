import { useNavigate } from "react-router-dom";

import { Card } from "../../../components/shared";
import { routePaths } from "../../../core/constants/routePaths";
import { useToast } from "../../../core/contexts/ToastContext";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const auth = useAuth();

  return (
    <Card>
      <h3>Login</h3>
      <LoginForm
        onSubmit={async (payload) => {
          await auth.login(payload);
          pushToast("Authenticated via JWT", "success");
          navigate(routePaths.dashboard);
        }}
      />
    </Card>
  );
};

export default LoginPage;
