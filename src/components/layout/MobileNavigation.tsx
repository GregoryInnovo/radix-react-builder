
import { useNavigate, useLocation } from "react-router-dom";
import { Package, Search, ShoppingBag, ClipboardList, Settings } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile || !isAuthenticated) {
    return null;
  }

  const navigationItems = [
    { path: "/search", label: "Buscar", icon: Search },
    { path: "/lotes", label: "Lotes", icon: Package },
    { path: "/productos", label: "Productos", icon: ShoppingBag },
    { path: "/ordenes", label: "Órdenes", icon: ClipboardList },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
