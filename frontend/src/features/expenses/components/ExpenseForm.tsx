import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { routePaths } from "../../../core/constants/routePaths";
import { expenseApi } from "../services/expenseApi";

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () => title.trim() || vendor.trim() || amount.trim(),
    [amount, title, vendor],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!amount.trim()) {
      nextErrors.amount = "Amount is required.";
    } else if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      nextErrors.amount = "Enter a valid amount.";
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
      await expenseApi.create({
        title: title.trim(),
        vendor: vendor.trim() || undefined,
        amount: Number(amount),
      });

      pushToast("Expense recorded successfully.", "success");
      navigate(routePaths.expenses);
    } catch (error) {
      pushToast(`Unable to save expense: ${String(error)}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="stack-list" onSubmit={handleSubmit}>
      <Input
        autoFocus
        label="Title"
        placeholder="Plumbing repair"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />
      <Input
        label="Vendor"
        placeholder="BuildMart"
        value={vendor}
        onChange={(event) => setVendor(event.target.value)}
      />
      <Input
        label="Amount"
        placeholder="1200"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        error={errors.amount}
      />
      <div className="inline-actions">
        <Button type="submit" variant="primary" loading={isSaving}>
          Save expense
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(routePaths.expenses)}>
          Cancel
        </Button>
      </div>
      {!hasChanges ? (
        <p className="theme-help">Fill the form to capture a new expenditure.</p>
      ) : null}
    </form>
  );
};

export default ExpenseForm;
