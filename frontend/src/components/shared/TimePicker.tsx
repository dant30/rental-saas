import Input, { type InputProps } from "./Input";

export interface TimePickerProps extends Omit<InputProps, "type"> {
  label?: string;
}

const TimePicker = ({ label, ...props }: TimePickerProps) => <Input type="time" label={label} {...props} />;

export default TimePicker;
