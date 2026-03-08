import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from "../../../components/shared";
import { useToast } from "../../../core/contexts/ToastContext";
import { routePaths } from "../../../core/constants/routePaths";
import { paymentApi } from "../services/paymentApi";

const PaymentForm = () => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [leaseId, setLeaseId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useMemo(
    () => leaseId.trim() || invoiceId.trim() || amount.trim(),
    [amount, invoiceId, leaseId],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!leaseId.trim()) {
      nextErrors.leaseId = "Lease ID is required.";
    }
    if (!amount.trim()) {
      nextErrors.amount = "Amount is required.";
    } else if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      nextErrors.amount = "Enter a valid amount.";
    }
    return nextErrors;
  };

  const handleMpesa = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await paymentApi.initiateMpesa({
        lease: Number(leaseId),
        invoice: invoiceId ? Number(invoiceId) : null,
        amount: Number(amount),
        phone_number: "+254700000001",
      });
      pushToast("MPesa payment initiated successfully.", "success");
      navigate(routePaths.payments);
    } catch (error) {
      pushToast(`Unable to initiate MPesa: ${String(error)}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBank = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await paymentApi.recordBankPayment({
        lease: Number(leaseId),
        invoice: invoiceId ? Number(invoiceId) : null,
        amount: Number(amount),
        reference: `BANK-${Date.now()}`,
        bank_name: "KCB",
      });
      pushToast("Bank payment recorded successfully.", "success");
      navigate(routePaths.payments);
    } catch (error) {
      pushToast(`Unable to record bank payment: ${String(error)}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="stack-list" onSubmit={handleMpesa}>
      <Input
        label="Lease ID"
        value={leaseId}
        onChange={(event) => setLeaseId(event.target.value)}
        error={errors.leaseId}
      />
      <Input label="Invoice ID" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} />
      <Input
        label="Amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        error={errors.amount}
      />
      <div className="inline-actions">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Initiate MPesa
        </Button>
        <Button onClick={handleBank} type="button" loading={isSubmitting}>
          Record Bank Payment
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(routePaths.payments)}>
          Cancel
        </Button>
      </div>
      {!hasChanges ? (
        <p className="theme-help">Fill in the lease and amount to capture a payment.</p>
      ) : null}
    </form>
  );
};

export default PaymentForm;
