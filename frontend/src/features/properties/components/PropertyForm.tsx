import { FormEvent } from "react";

import { Button, Input } from "../../../components/shared";

const PropertyForm = () => {
  const submit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <form className="stack-list" onSubmit={submit}>
      <Input label="Property name" placeholder="Sunset Court" />
      <Input label="Address" placeholder="Nairobi, Kenya" />
      <Button type="submit" variant="primary">
        Save property
      </Button>
    </form>
  );
};

export default PropertyForm;
