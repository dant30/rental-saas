import { APP_NAME } from "../../core/constants/appConstants";

const Header = ({ subtitle, title }: { title: string; subtitle?: string }) => (
  <header className="page-header">
    <div>
      <span className="eyebrow">{APP_NAME}</span>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  </header>
);

export default Header;
