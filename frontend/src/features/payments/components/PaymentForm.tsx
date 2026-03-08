import { FormEvent, useState } from "react";

import { Button, Input } from "../../../components/shared";
import { paymentApi } from "../services/paymentApi";

const PaymentForm = () => {
  const [leaseId, setLeaseId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");

  const submitMpesa = async (event: FormEvent) => {
    event.preventDefault();
    await paymentApi.initiateMpesa({
      lease: Number(leaseId),
      invoice: invoiceId ? Number(invoiceId) : null,
      amount,
      phone_number: "+254700000001",
    });
  };

  const submitBank = async () => {
    await paymentApi.recordBankPayment({
      lease: Number(leaseId),
      invoice: invoiceId ? Number(invoiceId) : null,
      amount,
      reference: `BANK-${Date.now()}`,
      bank_name: "KCB",
    });
  };

  return (
    <form className="stack-list" onSubmit={submitMpesa}>
      <Input label="Lease ID" onChange={(event) => setLeaseId(event.target.value)} value={leaseId} />
      <Input label="Invoice ID" onChange={(event) => setInvoiceId(event.target.value)} value={invoiceId} />
      <Input label="Amount" onChange={(event) => setAmount(event.target.value)} value={amount} />
      <div className="inline-actions">
        <Button type="submit" variant="primary">
          Initiate MPesa
        </Button>
        <Button onClick={submitBank} type="button">
          Record Bank Payment
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
