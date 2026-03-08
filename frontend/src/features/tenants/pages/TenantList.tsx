import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { routePaths } from "../../../core/constants/routePaths";
import { TenantResident } from "../types";
import { useTenants } from "../hooks/useTenants";

const TenantListPage = () => {
  const { items, status } = useTenants();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) =>
    [item.user?.username, item.user?.email, item.phone_number, item.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const activeCount = items.filter((item) => (item.status || "").toLowerCase() === "active").length;
  const contactCount = items.filter((item) => item.user?.email || item.phone_number).length;

  const columns: TableColumn<TenantResident>[] = [
    {
      key: "resident",
      header: "Resident",
      render: (tenant) => (
        <div>
          <strong>{tenant.user?.username || `Resident ${tenant.id}`}</strong>
          <div className="text-xs text-app-muted">{tenant.user?.email || "No email"}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (tenant) => tenant.phone_number || "--",
    },
    {
      key: "status",
      header: "Status",
      render: (tenant) => tenant.status || "active",
    },
    {
      key: "actions",
      header: "",
      render: (tenant) => (
        <Link
          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          onClick={(event) => event.stopPropagation()}
          to={`/app/tenants/${tenant.id}`}
        >
          Edit
        </Link>
      ),
    },
  ];

  const navigate = useNavigate();

  return (
    <>
      <Header subtitle="Resident list from /api/tenants/residents/." title="Tenants" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Resident overview</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add new residents to manage leases and rent.</p>
        </div>
        <Button onClick={() => navigate(routePaths.tenantsNew)}>Add resident</Button>
      </div>

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Residents</span>
          <span className="theme-stat">{items.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Active</span>
          <span className="theme-stat">{activeCount}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Reachable</span>
          <span className="theme-stat">{contactCount}</span>
        </article>
      </section>

      <section className="theme-surface activity-card" style={{ marginTop: "2rem" }}>
        <h3 className="theme-title">Resident register</h3>
        <p className="theme-subtitle">Search by resident identity, email, phone number, or status.</p>
        <div style={{ marginTop: "1rem" }}>
          <Input
            label="Search residents"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by resident, email, phone, or status"
            value={query}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          {status === "loading" ? (
            <p className="theme-subtitle">Loading residents...</p>
          ) : filteredItems.length ? (
            <Table
              columns={columns}
              data={filteredItems}
              rowKey={(tenant) => String(tenant.id)}
              onRowClick={(tenant) => navigate(`/app/tenants/${tenant.id}`)}
            />
          ) : (
            <EmptyState
              description="Try a broader query or onboard your first resident."
              title="No residents match this view"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default TenantListPage;
