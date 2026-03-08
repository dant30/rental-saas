import Header from "../../../components/layout/Header";
import ArrearsList from "../components/ArrearsList";
import { usePayments } from "../hooks/usePayments";

const ArrearsPage = () => {
  const { arrears } = usePayments();
  return (
    <>
      <Header subtitle="Live arrears from /api/arrears/." title="Arrears" />
      <ArrearsList items={arrears} />
    </>
  );
};

export default ArrearsPage;
