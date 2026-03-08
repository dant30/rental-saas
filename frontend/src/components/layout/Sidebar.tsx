import { NavLink } from "react-router-dom";

const Sidebar = ({ items }: { items: Array<{ to: string; label: string }> }) => (
  <nav className="nav-list">
    {items.map((item) => (
      <NavLink className="nav-link" key={item.to} to={item.to}>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export default Sidebar;
