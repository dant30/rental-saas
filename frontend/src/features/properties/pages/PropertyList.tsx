import { useDeferredValue, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
import { routePaths } from "../../../core/constants/routePaths";
import { PropertyRecord } from "../types";
import { useProperties } from "../hooks/useProperties";

const PropertyListPage = () => {
  const { items, status } = useProperties();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = items.filter((item) =>
    [item.name, item.property_type, item.address, item.city]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );

  const totalUnits = items.reduce((sum, item) => sum + Number(item.total_units || 0), 0);
  const cityCount = new Set(items.map((item) => item.city).filter(Boolean)).size;

  const columns: TableColumn<PropertyRecord>[] = [
    {
      key: "name",
      header: "Property",
      render: (property) => (
        <div>
          <strong>{property.name}</strong>
          <div className="text-xs text-app-muted">{property.property_type}</div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Location",
      render: (property) => property.address || property.city || "Address pending",
    },
    {
      key: "units",
      header: "Units",
      render: (property) => String(property.total_units || 0),
    },
    {
      key: "actions",
      header: "",
      cellClassName: "px-2 py-2 text-right",
      render: (property) => (
        <Link
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary-600 hover:bg-gray-100 hover:text-primary-700 dark:hover:bg-slate-700"
          onClick={(event) => event.stopPropagation()}
          to={`/app/properties/${property.id}`}
          aria-label="Edit property"
          title="Edit property"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  const navigate = useNavigate();

  return (
    <>
      <Header subtitle="Portfolio inventory from /api/properties/." title="Properties" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Portfolio snapshot</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add a property to start tracking units and leases.</p>
        </div>
        <Button onClick={() => navigate(routePaths.propertiesNew)}>Add property</Button>
      </div>

      <section className="stats-grid">
        <article className="theme-kpi">
          <span className="theme-caption">Properties</span>
          <span className="theme-stat">{items.length}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Units</span>
          <span className="theme-stat">{totalUnits}</span>
        </article>
        <article className="theme-kpi">
          <span className="theme-caption">Cities</span>
          <span className="theme-stat">{cityCount}</span>
        </article>
      </section>

      <section className="theme-surface activity-card mt-8">
        <div className="page-header mb-4">
          <div>
            <h3 className="theme-title">Property register</h3>
            <p className="theme-subtitle">Search and scan your active portfolio inventory.</p>
          </div>
        </div>
        <Input
          label="Search properties"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name, type, address, or city"
          value={query}
        />
        <div className="mt-4">
          {status === "loading" ? (
            <p className="theme-subtitle">Loading properties...</p>
          ) : filteredItems.length ? (
            <Table
              columns={columns}
              data={filteredItems}
              rowKey={(property) => String(property.id)}
              onRowClick={(property) => navigate(`/app/properties/${property.id}`)}
            />
          ) : (
            <EmptyState
              description="Try a different search term or add your first property."
              title="No properties match this view"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default PropertyListPage;
