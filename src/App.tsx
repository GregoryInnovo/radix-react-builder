
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";  
import Lotes from "./pages/Lotes";
import Productos from "./pages/Productos";
import Ordenes from "./pages/Ordenes";
import Admin from "./pages/Admin";
import UserProfile from "./pages/UserProfile";
import UserProducts from "./pages/UserProducts";
import UserLotes from "./pages/UserLotes";
import Guias from "./pages/Guias";
import GuiaDetalle from "./pages/GuiaDetalle";
import GuiaForm from "./pages/GuiaForm";
import LegalInfo from "./pages/LegalInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen pb-16 lg:pb-20 xl:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/lotes" element={<Lotes />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/ordenes" element={<Ordenes />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/guias" element={<Guias />} />
              <Route path="/guias/:id" element={<GuiaDetalle />} />
              <Route path="/guias/nueva" element={<GuiaForm />} />
              <Route path="/perfil/:userId" element={<UserProfile />} />
              <Route path="/perfil/:userId/productos" element={<UserProducts />} />
              <Route path="/perfil/:userId/lotes" element={<UserLotes />} />
              <Route path="/terminos" element={<LegalInfo />} />
              <Route path="/tratamiento-datos" element={<LegalInfo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
