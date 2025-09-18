import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuiaCard } from './GuiaCard';
import { useGuias } from '@/hooks/useGuias';
import { BookOpen, ArrowRight } from 'lucide-react';
export const GuiasPreviewSection = () => {
  const {
    guias,
    isLoading
  } = useGuias({
    destacadas: true
  });
  const previewGuias = guias.slice(0, 4);
  return;
};