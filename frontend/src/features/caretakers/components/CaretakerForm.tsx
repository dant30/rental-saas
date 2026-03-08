import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { routePaths } from "../../../core/constants/routePaths";
import { CaretakerRecord } from "../types";
import { caretakerApi } from "../services/caretakerApi";

interface CaretakerFormProps {
  initial?: Partial<CaretakerRecord>;
  onSuccess?: (caretaker: CaretakerRecord) => void;
}

const CaretakerForm = ({ initial, onSuccess }: CaretakerFormProps) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [employeeId, setEmployeeId] = useState(initial?.employee_id ?? "");
  const [skills, setSkills] = useState(initial?.skills ?? "");
  const [phone, setPhone] = useState(initial?.phone_number ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () =>
      employeeId.trim() !== (initial?.employee_id ?? "") ||
      skills.trim() !== (initial?.skills ?? "") ||
      phone.trim() !== (initial?.phone_number ?? ""),
    [employeeId, initial?.employee_id, initial?.phone_number, initial?.skills, phone, skills],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!employeeId.trim()) {
      nextErrors.employeeId = "Employee ID is required.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const payload: Partial<CaretakerRecord> = {
        employee_id: employeeId.trim() || undefined,
        skills: skills.trim() || undefined,
        phone_number: phone.trim() || undefined,
      };

      const saved = initial?.id
        ? await caretakerApi.update(Number(initial.id), payload)
        : await caretakerApi.create(payload);

      pushToast(
        `Caretaker ${initial?.id ? "updated" : "created"} successfully.`,
        "success",
      );

      onSuccess?.(saved);
      if (!initial?.id) {
        navigate(routePaths.maintenance);
      }
    } catch (error) {
      pushToast(`Unable to save caretaker: ${String(error)}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="stack-list" onSubmit={handleSubmit}>
      <Input
        autoFocus
        label="Employee ID"
        placeholder="CT-001"
        value={employeeId}
        onChange={(event) => setEmployeeId(event.target.value)}
        error={errors.employeeId}
      />
      <Input
        label="Phone number"
        placeholder="+254700000000"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
      <Input
        label="Skills"
        placeholder="Plumbing, electrical, general maintenance"
        value={skills}
        onChange={(event) => setSkills(event.target.value)}
      />
      <div className="inline-actions">
        <Button type="submit" variant="primary" loading={isSaving}>
          {initial?.id ? "Save changes" : "Create caretaker"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(routePaths.maintenance)}>
          Cancel
        </Button>
      </div>
      {!hasChanges && initial?.id ? (
        <p className="theme-help">No changes yet. Update any field and save to apply.</p>
      ) : null}
    </form>
  );
};

export default CaretakerForm;
