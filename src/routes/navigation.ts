import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/features/auth";
import { routeAccess } from "@/routes/routeAccess";

export interface NavigationItem {
  allowedRoles: readonly UserRole[];
  icon: SvgIconComponent;
  label: string;
  path: string;
}

export const navigationItems: readonly NavigationItem[] = [
  {
    allowedRoles: routeAccess.dashboard,
    icon: DashboardOutlinedIcon,
    label: "Dashboard",
    path: ROUTES.dashboard,
  },
  {
    allowedRoles: routeAccess.menu,
    icon: MenuBookOutlinedIcon,
    label: "Menu",
    path: ROUTES.menu,
  },
  {
    allowedRoles: routeAccess.orders,
    icon: ReceiptLongOutlinedIcon,
    label: "Orders",
    path: ROUTES.orders,
  },
  {
    allowedRoles: routeAccess.customers,
    icon: PeopleOutlineIcon,
    label: "Customers",
    path: ROUTES.customers,
  },
  {
    allowedRoles: routeAccess.reports,
    icon: AssessmentOutlinedIcon,
    label: "Reports",
    path: ROUTES.reports,
  },
];
