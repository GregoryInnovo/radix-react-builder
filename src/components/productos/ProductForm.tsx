
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Upload, X, ImagePlus } from 'lucide-react';
import { useProductos } from '@/hooks/useProductos';
import { useTiposResiduo } from '@/hooks/useTiposResiduo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIAS_FUNCIONALIDAD, CATEGORIAS_TIPO } from './ProductsFilter';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    disponible: true,
    origen_roa: '',
    precio_unidad: '',
    incluye_domicilio: false,
    direccion_vendedor: '',
    costo_domicilio: '',
    categoria_funcionalidad: [] as string[],
    categoria_tipo: [] as string[],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createProducto, uploadImage, loading } = useProductos();
  const { tiposResiduos, loading: loadingTipos } = useTiposResiduo();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (selectedFiles.length === 0) {
      newErrors.imagenes = 'Debe subir al menos una imagen';
    }

    if (!formData.precio_unidad || parseInt(formData.precio_unidad) <= 0) {
      newErrors.precio_unidad = 'El precio por unidad es requerido y debe ser mayor a 0';
    }

    if (formData.incluye_domicilio) {
      if (!formData.costo_domicilio || parseInt(formData.costo_domicilio) < 0 || parseInt(formData.costo_domicilio) > 20000) {
        newErrors.costo_domicilio = 'El costo de domicilio debe estar entre 0 y 20,000 COP';
      }
    } else {
      // Cuando NO incluye domicilio, la dirección es obligatoria
      if (!formData.direccion_vendedor.trim()) {
        newErrors.direccion_vendedor = 'La dirección es requerida cuando no se incluye domicilio';
      }
    }

    if (formData.categoria_funcionalidad.length === 0) {
      newErrors.categoria_funcionalidad = 'Debe seleccionar al menos una funcionalidad';
    }

    if (formData.categoria_tipo.length === 0) {
      newErrors.categoria_tipo = 'Debe seleccionar al menos un tipo de producto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        imagenes: 'Algunos archivos no son válidos. Solo se permiten JPG, PNG, WEBP hasta 5MB.'
      }));
    } else {
      setErrors(prev => ({ ...prev, imagenes: '' }));
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setUploading(true);
    try {
      // Upload all images
      const imagePromises = selectedFiles.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(imagePromises);
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length === 0) {
        throw new Error('No se pudieron subir las imágenes');
      }

      // Create product with uploaded image URLs
      const producto = await createProducto({
        ...formData,
        precio_unidad: parseInt(formData.precio_unidad),
        costo_domicilio: formData.incluye_domicilio ? parseInt(formData.costo_domicilio) : 0,
        direccion_vendedor: formData.direccion_vendedor,
        imagenes: validUrls,
        status: 'pendiente', // All products need approval
      });

      if (producto) {
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      setErrors({ general: 'Error al crear el producto. Intenta nuevamente.' });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryToggle = (categoryType: 'categoria_funcionalidad' | 'categoria_tipo', category: string) => {
    const currentCategories = formData[categoryType];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleInputChange(categoryType, newCategories);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="w-5 h-5" />
          Publicar Producto
        </CardTitle>
        <CardDescription>
          Comparte los productos que has creado a partir de residuos orgánicos aprovechables.
          Tu producto será revisado por nuestro equipo antes de ser publicado.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="ej. Compost orgánico premium"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe tu producto, sus beneficios y características..."
              rows={4}
              className={errors.descripcion ? 'border-red-500' : ''}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origen_roa">Origen del R.O.A (Opcional)</Label>
            <Select 
              value={formData.origen_roa} 
              onValueChange={(value) => handleInputChange('origen_roa', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTipos ? "Cargando..." : "Selecciona el tipo de R.O.A (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ninguno</SelectItem>
                {(tiposResiduos || [])
                  .sort((a, b) => {
                    if (a.nombre.toLowerCase().includes('otros')) return 1;
                    if (b.nombre.toLowerCase().includes('otros')) return -1;
                    return a.nombre.localeCompare(b.nombre);
                  })
                  .map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nombre}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio_unidad">Precio por Unidad (COP) *</Label>
            <Input
              id="precio_unidad"
              type="number"
              min="1"
              value={formData.precio_unidad}
              onChange={(e) => handleInputChange('precio_unidad', e.target.value)}
              placeholder="ej. 15000"
              className={errors.precio_unidad ? 'border-red-500' : ''}
            />
            {errors.precio_unidad && (
              <p className="text-sm text-red-600">{errors.precio_unidad}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="incluye_domicilio"
                checked={formData.incluye_domicilio}
                onCheckedChange={(checked) => handleInputChange('incluye_domicilio', checked)}
              />
              <Label htmlFor="incluye_domicilio">Incluye domicilio</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion_vendedor">
                Dirección del Vendedor *
                {!formData.incluye_domicilio && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Requerida para recoger el producto)
                  </span>
                )}
              </Label>
              <Input
                id="direccion_vendedor"
                value={formData.direccion_vendedor}
                onChange={(e) => handleInputChange('direccion_vendedor', e.target.value)}
                placeholder="ej. Calle 59 #1c-125"
                className={errors.direccion_vendedor ? 'border-red-500' : ''}
              />
              {errors.direccion_vendedor && (
                <p className="text-sm text-red-600">{errors.direccion_vendedor}</p>
              )}
            </div>

            {formData.incluye_domicilio && (
              <div className="space-y-2 pl-6 border-l-2 border-green-200">
                <div className="space-y-2">
                  <Label htmlFor="costo_domicilio">Costo de Domicilio (COP) *</Label>
                  <Input
                    id="costo_domicilio"
                    type="number"
                    min="0"
                    max="20000"
                    value={formData.costo_domicilio}
                    onChange={(e) => handleInputChange('costo_domicilio', e.target.value)}
                    placeholder="ej. 5000"
                    className={errors.costo_domicilio ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">Entre 0 y 20,000 COP</p>
                  {errors.costo_domicilio && (
                    <p className="text-sm text-red-600">{errors.costo_domicilio}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Imágenes del Producto *</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra imágenes
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.imagenes && (
              <p className="text-sm text-red-600">{errors.imagenes}</p>
            )}
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Categorías del producto</h3>
            
            {/* Funcionalidad */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Funcionalidad *</Label>
              <p className="text-sm text-muted-foreground">Selecciona una o más funcionalidades que describe tu producto</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CATEGORIAS_FUNCIONALIDAD.map((categoria) => (
                  <div key={categoria} className="flex items-center space-x-2">
                    <Checkbox
                      id={`form-func-${categoria}`}
                      checked={formData.categoria_funcionalidad.includes(categoria)}
                      onCheckedChange={() => handleCategoryToggle('categoria_funcionalidad', categoria)}
                    />
                    <label
                      htmlFor={`form-func-${categoria}`}
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      {categoria}
                    </label>
                  </div>
                ))}
              </div>
              {errors.categoria_funcionalidad && (
                <p className="text-sm text-red-600">{errors.categoria_funcionalidad}</p>
              )}
            </div>

            {/* Tipo de producto */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de producto *</Label>
              <p className="text-sm text-muted-foreground">Selecciona uno o más tipos que describe tu producto</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CATEGORIAS_TIPO.map((categoria) => (
                  <div key={categoria} className="flex items-center space-x-2">
                    <Checkbox
                      id={`form-tipo-${categoria}`}
                      checked={formData.categoria_tipo.includes(categoria)}
                      onCheckedChange={() => handleCategoryToggle('categoria_tipo', categoria)}
                    />
                    <label
                      htmlFor={`form-tipo-${categoria}`}
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      {categoria}
                    </label>
                  </div>
                ))}
              </div>
              {errors.categoria_tipo && (
                <p className="text-sm text-red-600">{errors.categoria_tipo}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="disponible"
              checked={formData.disponible}
              onCheckedChange={(checked) => handleInputChange('disponible', checked)}
            />
            <Label htmlFor="disponible">Producto disponible</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1"
            >
              {uploading ? 'Subiendo imágenes...' : loading ? 'Publicando...' : 'Publicar Producto'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || uploading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
