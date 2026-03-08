import Button from "./Button";
import { cn } from "@utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => (
  <nav className={cn("flex items-center justify-end gap-2", className)} aria-label="Pagination">
    <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)} variant="outline">
      Previous
    </Button>
    <span className="text-sm text-app-muted">
      Page {page} of {totalPages}
    </span>
    <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} variant="outline">
      Next
    </Button>
  </nav>
);

export default Pagination;
