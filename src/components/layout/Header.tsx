
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { LogOut, User, Package, Search, ShoppingBag, ClipboardList, Settings } from "lucide-react";
import { NotificacionesDropdown } from "@/components/notificaciones/NotificacionesDropdown";

export const Header = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-green-600">
            NatuVital
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
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
