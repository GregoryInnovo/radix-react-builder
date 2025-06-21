
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { LogOut, User, Package, Search, ShoppingBag, ClipboardList, Settings, Menu, X } from "lucide-react";
import { NotificacionesDropdown } from "@/components/notificaciones/NotificacionesDropdown";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const navigationItems = [
    { path: "/search", label: "Buscar Lotes", icon: Search },
    { path: "/lotes", label: "Mis Lotes", icon: Package },
    { path: "/productos", label: "Productos", icon: ShoppingBag },
    { path: "/ordenes", label: "Órdenes", icon: ClipboardList },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  // Show mobile layout for mobile and tablet (including iPad)
  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 1024;
  };

  if (isMobileOrTablet()) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl lg:text-2xl font-bold text-green-600">
              NatuVital
            </Link>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && <NotificacionesDropdown />}
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 lg:p-3">
                    <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 lg:w-96">
                  <SheetHeader>
                    <SheetTitle className="text-left text-lg lg:text-xl">Menú</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-4">
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-3 lg:p-4 bg-green-50 rounded-lg">
                          <User className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Navigation Items */}
                        <nav className="space-y-2">
                          {navigationItems.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleNavigation(item.path)}
                              className="w-full flex items-center space-x-3 p-3 lg:p-4 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <item.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                              <span className="text-sm lg:text-base">{item.label}</span>
                            </button>
                          ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 p-3 lg:p-4 text-sm lg:text-base"
                          >
                            <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-3" />
                            Cerrar Sesión
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Button 
                          onClick={() => handleNavigation("/auth")}
                          className="w-full p-3 lg:p-4 text-sm lg:text-base"
                        >
                          Iniciar Sesión
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Desktop version remains the same
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600">
            NatuVital
          </Link>
          
          <nav className="hidden xl:flex items-center space-x-6">
            <Link to="/search" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <Search className="h-4 w-4" />
              Buscar Lotes
            </Link>
            <Link to="/lotes" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <Package className="h-4 w-4" />
              Mis Lotes
            </Link>
            <Link to="/productos" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <ShoppingBag className="h-4 w-4" />
              Productos
            </Link>
            <Link to="/ordenes" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <ClipboardList className="h-4 w-4" />
              Órdenes
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificacionesDropdown />
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Iniciar Sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
