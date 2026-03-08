import { PropsWithChildren } from "react";

const Card = ({ children }: PropsWithChildren) => <article className="glass-panel route-card">{children}</article>;

export default Card;
