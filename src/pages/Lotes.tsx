
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoteForm } from '@/components/lotes/LoteForm';
import { LotesList } from '@/components/lotes/LotesList';
import { LoteStatusManager } from '@/components/lotes/LoteStatusManager';
import { LoteStatusHistory } from '@/components/lotes/LoteStatusHistory';
import { LotesPublicos } from '@/components/lotes/LotesPublicos';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { useLotes } from '@/hooks/useLotes';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type BatchStatus = Database['public']['Enums']['batch_status'];

const Lotes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [viewingLote, setViewingLote] = useState<Lote | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoteForDetails, setSelectedLoteForDetails] = useState<Lote | null>(null);
  const { lotes, loading, createLote, updateLote, updateLoteStatus, deleteLote } = useLotes();

  // Handle lote_id from URL (from notification redirect)
  useEffect(() => {
    const loteId = searchParams.get('lote_id');
    if (loteId && lotes.length > 0) {
      const lote = lotes.find(l => l.id === loteId);
      if (lote) {
        setSelectedLoteForDetails(lote);
        setShowDetailsModal(true);
        // Remove the query param after opening
        searchParams.delete('lote_id');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, lotes, setSearchParams]);

  const handleCreate = () => {
    setEditingLote(null);
    setViewingLote(null);
    setShowForm(true);
  };

  const handleEdit = (lote: Lote) => {
    setEditingLote(lote);
    setViewingLote(null);
    setShowForm(true);
  };

  const handleView = (lote: Lote) => {
    setViewingLote(lote);
    setShowForm(false);
    setEditingLote(null);
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

  const handleStatusChange = async (loteId: string, newStatus: BatchStatus) => {
    try {
      await updateLoteStatus(loteId, newStatus);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLote(null);
    setViewingLote(null);
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
          ) : viewingLote ? (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a mis lotes
              </Button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LoteStatusManager
                  lote={viewingLote}
                  onStatusChange={async (newStatus) => {
                    await handleStatusChange(viewingLote.id, newStatus);
                    const result = await updateLoteStatus(viewingLote.id, newStatus);
                    if (result) setViewingLote(result);
                  }}
                  loading={loading}
                />
                <LoteStatusHistory loteId={viewingLote.id} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Lotes de R.O.A
                </h1>
                <p className="text-gray-600">
                  Gestiona tus lotes o explora todos los lotes públicos disponibles
                </p>
              </div>

              <Tabs defaultValue="lotes-publicos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lotes-publicos">Lotes Públicos</TabsTrigger>
                  <TabsTrigger value="mis-lotes">Mis Lotes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="lotes-publicos" className="space-y-6">
                  <LotesPublicos />
                </TabsContent>
                
                <TabsContent value="mis-lotes" className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Mis Lotes de R.O.A
                      </h2>
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
                    onView={handleView}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>

        {/* Details Modal for notifications */}
        {selectedLoteForDetails && (
          <LoteDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedLoteForDetails(null);
            }}
            lote={selectedLoteForDetails}
            showReservarButton={false}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Lotes;
