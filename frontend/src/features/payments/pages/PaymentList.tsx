import Header from "../../../components/layout/Header";
import PaymentForm from "../components/PaymentForm";
import PaymentRow from "../components/PaymentRow";
import { usePayments } from "../hooks/usePayments";

const PaymentListPage = () => {
  const { payments } = usePayments();
  return (
    <>
      <Header subtitle="Payments plus MPesa/bank action wiring." title="Payments" />
      <section className="report-grid">
        <article className="glass-panel activity-card">
          <h3>Recorded Payments</h3>
          <table className="app-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </tbody>
          </table>
        </article>
        <article className="surface-panel activity-card">
          <h3>New Payment</h3>
          <PaymentForm />
        </article>
      </section>
    </>
  );
};

export default PaymentListPage;
