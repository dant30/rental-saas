import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Loading from "../../../components/shared/Loading";
import CaretakerForm from "../components/CaretakerForm";
import { useCaretaker } from "../hooks/useCaretaker";

const CaretakerDetailPage = () => {
  const { id } = useParams();
  const { caretaker, status, error } = useCaretaker(id);

  const title = useMemo(() => {
    if (status === "loading") return "Loading caretaker...";
    if (caretaker) return `Caretaker: ${caretaker.employee_id || caretaker.id}`;
    return "Caretaker detail";
  }, [caretaker, status]);

  return (
    <>
      <Header subtitle="Detail/edit shell for a selected caretaker." title={title} />

      {status === "loading" ? (
        <Loading label="Loading caretaker details..." />
      ) : error ? (
        <EmptyState description={error} title="Could not load caretaker" />
      ) : caretaker ? (
        <CaretakerForm initial={caretaker} />
      ) : (
        <EmptyState
          description="Select a caretaker from the roster to edit or add a new one."
          title="No caretaker selected"
        />
      )}
    </>
  );
};

export default CaretakerDetailPage;
