
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoteForm } from '@/components/lotes/LoteForm';
import { LotesList } from '@/components/lotes/LotesList';
import { useLotes } from '@/hooks/useLotes';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

const Lotes = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const { lotes, loading, createLote, updateLote, deleteLote } = useLotes();

  const handleCreate = () => {
    setEditingLote(null);
    setShowForm(true);
  };

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingLote) {
      const result = await updateLote(editingLote.id, data);
      if (result) {
        setShowForm(false);
        setEditingLote(null);
      }
    } else {
      const result = await createLote(data);
      if (result) {
        setShowForm(false);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLote(null);
  };

  const handleDelete = async (id: string) => {
    await deleteLote(id);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {showForm ? (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a mis lotes
              </Button>
              
              <LoteForm
                lote={editingLote}
                onSubmit={handleSubmit}
                loading={loading}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Mis Lotes de ROA
                  </h1>
                  <p className="text-gray-600">
                    Gestiona tus residuos orgánicos aprovechables
                  </p>
                </div>
                
                <Button
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Lote
                </Button>
              </div>

              <LotesList
                lotes={lotes}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Lotes;
