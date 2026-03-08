import { FormEvent } from "react";

import { Button, Input } from "../../../components/shared";

const ExpenseForm = () => {
  const submit = (event: FormEvent) => event.preventDefault();

  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Title" placeholder="Plumbing repair" />
      <Input label="Vendor" placeholder="BuildMart" />
      <Button type="submit" variant="primary">
        Save expense
      </Button>
    </form>
  );
};

export default ExpenseForm;
