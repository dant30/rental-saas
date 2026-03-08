import type { ReactNode } from "react";
import Alert from "./Alert";

export interface ErrorProps {
  title?: ReactNode;
  message?: ReactNode;
}

const Error = ({ title = "Something went wrong", message = "Please try again." }: ErrorProps) => (
  <Alert variant="danger" title={title} description={message} />
);

export const ErrorMessage = Error;
export const LoadingError = () => <Error title="Loading failed" message="The requested content could not be loaded." />;
export const NotFoundError = () => <Error title="Not found" message="The resource you requested does not exist." />;
export const NetworkError = () => <Error title="Network error" message="Check your connection and try again." />;

export default Error;
