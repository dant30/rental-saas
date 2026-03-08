import { FormEvent, useState } from "react";

import { Button, Input } from "../../../components/shared";
import { useAdmin } from "../hooks/useAdmin";

const TenantManager = () => {
  const admin = useAdmin();
  const [payload, setPayload] = useState({
    schema_name: "",
    name: "",
    domain: "",
    admin_username: "",
    admin_email: "",
    admin_password: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await admin.createTenant(payload);
  };

  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Schema name" onChange={(event) => setPayload((c) => ({ ...c, schema_name: event.target.value }))} value={payload.schema_name} />
      <Input label="Tenant name" onChange={(event) => setPayload((c) => ({ ...c, name: event.target.value }))} value={payload.name} />
      <Input label="Domain" onChange={(event) => setPayload((c) => ({ ...c, domain: event.target.value }))} value={payload.domain} />
      <Input label="Admin username" onChange={(event) => setPayload((c) => ({ ...c, admin_username: event.target.value }))} value={payload.admin_username} />
      <Input label="Admin email" onChange={(event) => setPayload((c) => ({ ...c, admin_email: event.target.value }))} value={payload.admin_email} />
      <Input label="Admin password" onChange={(event) => setPayload((c) => ({ ...c, admin_password: event.target.value }))} type="password" value={payload.admin_password} />
      <Button type="submit" variant="primary">
        Provision tenant
      </Button>
    </form>
  );
};

export default TenantManager;
