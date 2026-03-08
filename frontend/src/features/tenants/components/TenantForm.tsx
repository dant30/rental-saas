import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { routePaths } from "../../../core/constants/routePaths";
import { TenantResident } from "../types";
import { tenantApi } from "../services/tenantApi";

interface TenantFormProps {
  initial?: Partial<TenantResident>;
  onSuccess?: (tenant: TenantResident) => void;
}

const TenantForm = ({ initial, onSuccess }: TenantFormProps) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [username, setUsername] = useState(initial?.user?.username ?? "");
  const [email, setEmail] = useState(initial?.user?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone_number ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () =>
      username.trim() !== (initial?.user?.username ?? "") ||
      email.trim() !== (initial?.user?.email ?? "") ||
      phone.trim() !== (initial?.phone_number ?? ""),
    [email, initial?.phone_number, initial?.user?.email, initial?.user?.username, phone, username],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!username.trim()) {
      nextErrors.username = "Resident username is required.";
    }
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      nextErrors.email = "Enter a valid email address.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const payload: Partial<TenantResident> = {
        user: {
          username: username.trim(),
          email: email.trim(),
        } as any,
        phone_number: phone.trim() || undefined,
      };

      const saved = initial?.id
        ? await tenantApi.update(Number(initial.id), payload)
        : await tenantApi.create(payload);

      pushToast(
        `Resident ${initial?.id ? "updated" : "created"} successfully.`,
        "success",
      );

      onSuccess?.(saved);
      if (!initial?.id) {
        navigate(routePaths.tenants);
      }
    } catch (error) {
      pushToast(`Unable to save resident: ${String(error)}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="stack-list" onSubmit={handleSubmit}>
      <Input
        autoFocus
        label="Resident username"
        placeholder="jane.doe"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={errors.username}
      />
      <Input
        label="Email"
        placeholder="jane@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <Input
        label="Phone number"
        placeholder="+254700000000"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
      <div className="inline-actions">
        <Button type="submit" variant="primary" loading={isSaving}>
          {initial?.id ? "Save changes" : "Create resident"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(routePaths.tenants)}>
          Cancel
        </Button>
      </div>
      {!hasChanges && initial?.id ? (
        <p className="theme-help">No changes yet. Update any field and save to apply.</p>
      ) : null}
    </form>
  );
};

export default TenantForm;
