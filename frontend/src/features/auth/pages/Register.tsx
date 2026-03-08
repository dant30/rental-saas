import { Card } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import RegisterForm from "../components/RegisterForm";
import { authApi } from "../services/authApi";

const RegisterPage = () => {
  const { pushToast } = useToast();

  return (
    <Card>
      <h3>Register</h3>
      <RegisterForm
        onSubmit={async (payload) => {
          await authApi.register(payload);
          pushToast("Registration submitted", "success");
        }}
      />
    </Card>
  );
};

export default RegisterPage;
