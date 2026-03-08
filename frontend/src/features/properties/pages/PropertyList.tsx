import { useDeferredValue, useState } from "react";

import Header from "../../../components/layout/Header";
import EmptyState from "../../../components/shared/EmptyState";
import Input from "../../../components/shared/Input";
import Table, { type TableColumn } from "../../../components/shared/Table";
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
  ];

  return (
    <>
      <Header subtitle="Portfolio inventory from /api/properties/." title="Properties" />

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

      <section className="theme-surface activity-card" style={{ marginTop: "2rem" }}>
        <div className="page-header" style={{ marginBottom: "1rem" }}>
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
        <div style={{ marginTop: "1rem" }}>
          {status === "loading" ? (
            <p className="theme-subtitle">Loading properties...</p>
          ) : filteredItems.length ? (
            <Table columns={columns} data={filteredItems} rowKey={(property) => String(property.id)} />
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
