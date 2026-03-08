import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Loading from "../../../components/shared/Loading";
import TenantForm from "../components/TenantForm";
import { useTenant } from "../hooks/useTenant";

const TenantDetailPage = () => {
  const { id } = useParams();
  const isCreateMode = !id;
  const { tenant, status, error } = useTenant(id);

  const title = useMemo(() => {
    if (isCreateMode) return "New resident";
    if (status === "loading") return "Loading resident...";
    if (tenant) return `Resident: ${tenant.user?.username ?? tenant.id}`;
    return "Tenant detail";
  }, [id, isCreateMode, status, tenant]);

  return (
    <>
      <Header
        subtitle={
          isCreateMode
            ? "Add a new resident to the roster."
            : "Edit resident details and lease information."
        }
        title={title}
      />

      {isCreateMode ? (
        <TenantForm />
      ) : status === "loading" ? (
        <Loading label="Loading resident..." />
      ) : error ? (
        <EmptyState description={error} title="Could not load resident" />
      ) : tenant ? (
        <TenantForm initial={tenant} />
      ) : (
        <EmptyState
          description="Select a resident from the list to edit or add a new one."
          title="No resident selected"
        />
      )}
    </>
  );
};

export default TenantDetailPage;
