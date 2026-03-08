import Input, { type InputProps } from "./Input";

export interface DatePickerProps extends Omit<InputProps, "type"> {
  label?: string;
}

const DatePicker = ({ label, ...props }: DatePickerProps) => <Input type="date" label={label} {...props} />;

export interface DateRangePickerProps {
  start?: string;
  end?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
}

export const DateRangePicker = ({ start, end, onStartChange, onEndChange }: DateRangePickerProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    <DatePicker label="Start date" value={start} onChange={(event) => onStartChange?.(event.target.value)} />
    <DatePicker label="End date" value={end} onChange={(event) => onEndChange?.(event.target.value)} />
  </div>
);

export default DatePicker;
