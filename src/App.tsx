import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./components/AppLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MisRecetas from "./pages/MisRecetas";
import RecipeDetail from "./pages/RecipeDetail";
import Crear from "./pages/Crear";
import Editar from "./pages/Editar";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/mis-recetas" element={<MisRecetas />} />
              <Route path="/receta/:id" element={<RecipeDetail />} />
              <Route path="/crear" element={<Crear />} />
              <Route path="/editar/:id" element={<Editar />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
