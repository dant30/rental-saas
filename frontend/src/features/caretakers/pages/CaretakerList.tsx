import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

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

  const navigate = useNavigate();

  const columns: TableColumn<CaretakerRecord>[] = [
    {
      key: "caretaker",
      header: "Caretaker",
      render: (item) => item.employee_id || `Caretaker ${item.id}`,
    },
    { key: "phone", header: "Phone", render: (item) => item.phone_number || "--" },
    { key: "skills", header: "Skills", render: (item) => item.skills || "General operations" },
    { key: "status", header: "Status", render: (item) => item.status || "active" },
    {
      key: "actions",
      header: "",
      cellClassName: "px-2 py-2 text-right",
      render: (item) => (
        <Link
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary-600 hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-slate-700"
          onClick={(event) => event.stopPropagation()}
          to={`/app/maintenance/${item.id}`}
          aria-label="Edit caretaker"
          title="Edit caretaker"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

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

      <section className="theme-surface activity-card mt-8">
        <h3 className="theme-title">Operations roster</h3>
        <p className="theme-subtitle">Search by caretaker ID, phone number, skill, or status.</p>
        <div className="mt-4">
          <Input
            label="Search caretakers"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by caretaker ID, phone, skill, or status"
            value={query}
          />
        </div>
        <div className="mt-4">
          {filteredItems.length ? (
            <Table
              columns={columns}
              data={filteredItems}
              rowKey={(item) => String(item.id)}
              onRowClick={(item) => navigate(`/app/maintenance/${item.id}`)}
            />
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
