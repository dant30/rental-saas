import { useDeferredValue, useState } from "react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import PaymentForm from "../components/PaymentForm";
import { PaymentRecord } from "../types";
import { usePayments } from "../hooks/usePayments";

const PaymentListPage = () => {
  const { payments } = usePayments();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredPayments = payments.filter((payment) =>
    [payment.reference, payment.method, payment.status, payment.amount]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const successfulCount = payments.filter((payment) =>
    payment.status.toLowerCase().includes("success") || payment.status.toLowerCase().includes("paid"),
  ).length;
  const mobileMoneyCount = payments.filter((payment) => payment.method.toLowerCase().includes("mpesa")).length;

  const columns: TableColumn<PaymentRecord>[] = [
    { key: "reference", header: "Reference", render: (payment) => payment.reference },
    { key: "amount", header: "Amount", render: (payment) => formatCurrency(payment.amount) },
    { key: "method", header: "Method", render: (payment) => payment.method },
    { key: "status", header: "Status", render: (payment) => payment.status },
    { key: "date", header: "Date", render: (payment) => formatDate(payment.payment_date) },
  ];

  return (
    <>
      <Header subtitle="Payments plus MPesa/bank action wiring." title="Payments" />

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Recorded payments</span>
          <span className="theme-stat">{payments.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Collected value</span>
          <span className="theme-stat">{formatCurrency(totalAmount)}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">MPesa transactions</span>
          <span className="theme-stat">{mobileMoneyCount}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Settled</span>
          <span className="theme-stat">{successfulCount}</span>
        </article>
      </section>

      <section className="report-grid" style={{ marginTop: "2rem" }}>
        <article className="glass-panel activity-card">
          <h3>Recorded Payments</h3>
          <p className="theme-subtitle">Search by reference, method, status, or amount.</p>
          <div style={{ marginTop: "1rem" }}>
            <Input
              label="Search payments"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by reference, method, status, or amount"
              value={query}
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            {filteredPayments.length ? (
              <Table columns={columns} data={filteredPayments} rowKey={(payment) => String(payment.id)} />
            ) : (
              <EmptyState
                description="Try a different query or capture your first payment."
                title="No payments match this view"
              />
            )}
          </div>
        </article>

        <article className="surface-panel activity-card">
          <h3>New Payment</h3>
          <p className="theme-subtitle">Capture bank or MPesa-backed payment activity.</p>
          <div style={{ marginTop: "1rem" }}>
            <PaymentForm />
          </div>
        </article>
      </section>
    </>
  );
};

export default PaymentListPage;
