import { Search } from "lucide-react";
import Input, { type InputProps } from "./Input";

export type SearchBarProps = InputProps;

const SearchBar = (props: SearchBarProps) => <Input prefix={<Search className="h-4 w-4" />} placeholder="Search..." {...props} />;

export default SearchBar;
