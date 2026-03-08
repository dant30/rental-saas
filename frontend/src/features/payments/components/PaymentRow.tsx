import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import { PaymentRecord } from "../types";

const PaymentRow = ({ payment }: { payment: PaymentRecord }) => (
  <tr>
    <td>{payment.reference}</td>
    <td>{formatCurrency(payment.amount)}</td>
    <td>{payment.method}</td>
    <td>{payment.status}</td>
    <td>{formatDate(payment.payment_date)}</td>
  </tr>
);

export default PaymentRow;
