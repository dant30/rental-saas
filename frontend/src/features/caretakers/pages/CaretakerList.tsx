import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { routePaths } from "../../../core/constants/routePaths";
import { CaretakerRecord } from "../types";
import { useCaretakers } from "../hooks/useCaretakers";

const CaretakerListPage = () => {
  const { items } = useCaretakers();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) =>
    [item.employee_id, item.phone_number, item.skills, item.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const activeCount = items.filter((item) => (item.status || "").toLowerCase() === "active").length;
  const skilledCount = items.filter((item) => !!item.skills).length;

  const columns: TableColumn<CaretakerRecord>[] = [
    {
      key: "caretaker",
      header: "Caretaker",
      render: (item) => item.employee_id || `Caretaker ${item.id}`,
    },
    { key: "phone", header: "Phone", render: (item) => item.phone_number || "--" },
    { key: "skills", header: "Skills", render: (item) => item.skills || "General operations" },
    { key: "status", header: "Status", render: (item) => item.status || "active" },
  ];

  const navigate = useNavigate();

  return (
    <>
      <Header subtitle="Caretaker roster from /api/caretakers/." title="Caretakers" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Operations roster</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add or manage caretakers responsible for maintenance.</p>
        </div>
        <Button onClick={() => navigate(routePaths.maintenanceNew)}>Add caretaker</Button>
      </div>

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Caretakers</span>
          <span className="theme-stat">{items.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Active</span>
          <span className="theme-stat">{activeCount}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Skills listed</span>
          <span className="theme-stat">{skilledCount}</span>
        </article>
      </section>

      <section className="theme-surface activity-card" style={{ marginTop: "2rem" }}>
        <h3 className="theme-title">Operations roster</h3>
        <p className="theme-subtitle">Search by caretaker ID, phone number, skill, or status.</p>
        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Search caretakers"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by caretaker ID, phone, skill, or status"
            value={query}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          {filteredItems.length ? (
            <Table columns={columns} data={filteredItems} rowKey={(item) => String(item.id)} />
          ) : (
            <EmptyState
              description="Try a different query or onboard your first caretaker."
              title="No caretakers match this view"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default CaretakerListPage;
