import { FormEvent } from "react";

import { Button, Input } from "../../../components/shared";

const CaretakerForm = () => {
  const submit = (event: FormEvent) => event.preventDefault();
  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Employee ID" />
      <Input label="Skills" />
      <Button type="submit" variant="primary">
        Save caretaker
      </Button>
    </form>
  );
};

export default CaretakerForm;
