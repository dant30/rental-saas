import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { routePaths } from "../../../core/constants/routePaths";
import { PropertyRecord } from "../types";
import { propertyApi } from "../services/propertyApi";

interface PropertyFormProps {
  initial?: Partial<PropertyRecord>;
  onSuccess?: (property: PropertyRecord) => void;
}

const PropertyForm = ({ initial, onSuccess }: PropertyFormProps) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [propertyType, setPropertyType] = useState(initial?.property_type ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () => name.trim() !== (initial?.name ?? "") || address.trim() !== (initial?.address ?? ""),
    [address, initial?.address, initial?.name, name],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = "Property name is required.";
    }
    if (!address.trim()) {
      nextErrors.address = "Property address is required.";
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
      const payload = {
        name: name.trim(),
        address: address.trim(),
        property_type: propertyType.trim() || undefined,
      };

      const saved = initial?.id
        ? await propertyApi.update(Number(initial.id), payload)
        : await propertyApi.create(payload);

      pushToast(
        `Property ${initial?.id ? "updated" : "created"} successfully.`,
        "success",
      );

      onSuccess?.(saved);
      if (!initial?.id) {
        navigate(routePaths.properties);
      }
    } catch (error) {
      pushToast(`Unable to save property: ${String(error)}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="stack-list" onSubmit={handleSubmit}>
      <Input
        autoFocus
        label="Property name"
        placeholder="Sunset Court"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <Input
        label="Address"
        placeholder="Nairobi, Kenya"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        error={errors.address}
      />
      <Input
        label="Property type"
        placeholder="Apartment, House, Commercial..."
        value={propertyType}
        onChange={(event) => setPropertyType(event.target.value)}
        hint="Optional, helps with categorization."
      />
      <div className="inline-actions">
        <Button type="submit" variant="primary" loading={isSaving}>
          {initial?.id ? "Save changes" : "Create property"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(routePaths.properties)}>
          Cancel
        </Button>
      </div>
      {!hasChanges && initial?.id ? (
        <p className="theme-help">No changes yet. Update any field and save to apply.</p>
      ) : null}
    </form>
  );
};

export default PropertyForm;
