import Header from "../../../components/layout/Header";
import CaretakerCard from "../components/CaretakerCard";
import { useCaretakers } from "../hooks/useCaretakers";

const CaretakerListPage = () => {
  const { items } = useCaretakers();
  return (
    <>
      <Header subtitle="Caretaker roster from /api/caretakers/." title="Caretakers" />
      <section className="list-grid">
        {items.map((item) => (
          <CaretakerCard caretaker={item} key={item.id} />
        ))}
      </section>
    </>
  );
};

export default CaretakerListPage;
