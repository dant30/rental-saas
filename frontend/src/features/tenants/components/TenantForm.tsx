import { FormEvent } from "react";

import { Button, Input } from "../../../components/shared";

const TenantForm = () => {
  const submit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();
  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Resident name" />
      <Input label="Email" />
      <Button type="submit" variant="primary">
        Save tenant
      </Button>
    </form>
  );
};

export default TenantForm;
