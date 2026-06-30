import { ReactNode } from "react";
// component
import SvgColor from "../../../components/svg-color";

// ----------------------------------------------------------------------

const icon = (name: string): ReactNode => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: "dashboard",
    path: "/dashboard/app",
    icon: icon("ic_analytics"),
  },
  {
    title: "projects",
    path: "/dashboard/projects",
    icon: icon("ic_cart"),
  },
];

export default navConfig;
