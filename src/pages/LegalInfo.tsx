import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowLeft } from 'lucide-react';

export default function LegalInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTerminos = location.pathname === '/terminos';

  const title = isTerminos ? 'Términos y Condiciones' : 'Tratamiento de Datos Personales';
  const lastUpdated = '1 de Enero de 2025';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/auth?mode=register')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Última actualización: {lastUpdated}
              </p>
            </div>

            {isTerminos ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>1. Aceptación de los Términos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Al acceder y utilizar esta plataforma, usted acepta estar sujeto a estos términos y condiciones de uso. 
                      Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>2. Uso del Servicio</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      La plataforma facilita el intercambio de residuos aprovechables entre usuarios. Los usuarios se comprometen a:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Proporcionar información veraz y actualizada sobre los residuos y productos</li>
                      <li>Cumplir con todas las regulaciones ambientales aplicables</li>
                      <li>No publicar contenido ilegal, ofensivo o fraudulento</li>
                      <li>Respetar los derechos de propiedad intelectual de terceros</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>3. Registro y Cuentas de Usuario</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Para utilizar ciertos servicios, debe crear una cuenta. Usted es responsable de:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                      <li>Todas las actividades que ocurran bajo su cuenta</li>
                      <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>4. Responsabilidades del Usuario</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Los usuarios son únicos responsables de las transacciones realizadas a través de la plataforma. 
                      Esto incluye la calidad, seguridad y legalidad de los residuos intercambiados. 
                      La plataforma actúa únicamente como intermediario facilitador.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>5. Propiedad Intelectual</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Todo el contenido de la plataforma, incluyendo texto, gráficos, logos, y software, 
                      es propiedad de la plataforma o sus licenciantes y está protegido por las leyes de propiedad intelectual. 
                      El uso no autorizado puede resultar en acciones legales.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>6. Limitación de Responsabilidad</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      La plataforma no será responsable por:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Daños directos, indirectos, incidentales o consecuentes derivados del uso del servicio</li>
                      <li>La calidad, seguridad o legalidad de los residuos intercambiados</li>
                      <li>Interrupciones del servicio o pérdida de datos</li>
                      <li>Acciones u omisiones de los usuarios de la plataforma</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>7. Modificaciones a los Términos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                      Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. 
                      Es su responsabilidad revisar periódicamente estos términos.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>8. Jurisdicción y Ley Aplicable</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Estos términos se regirán e interpretarán de acuerdo con las leyes vigentes. 
                      Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva 
                      de los tribunales competentes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>1. Responsable del Tratamiento</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      El responsable del tratamiento de sus datos personales es esta plataforma de intercambio de residuos aprovechables. 
                      Nos comprometemos a proteger su privacidad y a tratar sus datos de manera responsable y conforme a la ley.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>2. Datos que Recopilamos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Recopilamos los siguientes tipos de datos personales:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Datos de identificación: nombre, correo electrónico</li>
                      <li>Datos de perfil: tipo de usuario, ubicación, información de contacto</li>
                      <li>Datos de transacciones: información sobre residuos, productos y órdenes</li>
                      <li>Datos técnicos: dirección IP, tipo de navegador, datos de uso de la plataforma</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>3. Finalidad del Tratamiento</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Utilizamos sus datos personales para:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Facilitar el intercambio de residuos aprovechables entre usuarios</li>
                      <li>Gestionar su cuenta y autenticación en la plataforma</li>
                      <li>Comunicarnos con usted sobre transacciones y actualizaciones del servicio</li>
                      <li>Mejorar nuestros servicios y experiencia de usuario</li>
                      <li>Cumplir con obligaciones legales y regulatorias</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>4. Base Legal del Tratamiento</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      El tratamiento de sus datos se basa en:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Su consentimiento explícito al registrarse en la plataforma</li>
                      <li>La ejecución del contrato de prestación de servicios</li>
                      <li>El cumplimiento de obligaciones legales</li>
                      <li>Nuestro interés legítimo en mejorar y proteger nuestros servicios</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>5. Derechos de los Titulares</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Usted tiene derecho a:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Acceder a sus datos personales</li>
                      <li>Rectificar datos inexactos o incompletos</li>
                      <li>Solicitar la eliminación de sus datos</li>
                      <li>Oponerse al tratamiento de sus datos</li>
                      <li>Solicitar la limitación del tratamiento</li>
                      <li>Portabilidad de sus datos</li>
                      <li>Retirar su consentimiento en cualquier momento</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>6. Seguridad de los Datos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
                      contra acceso no autorizado, pérdida, destrucción o alteración. Esto incluye encriptación, 
                      controles de acceso y monitoreo de seguridad continuo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>7. Conservación de Datos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Conservamos sus datos personales únicamente durante el tiempo necesario para cumplir con las 
                      finalidades para las que fueron recopilados, incluyendo requisitos legales, contables o de 
                      informes. Cuando ya no sean necesarios, los eliminaremos de forma segura.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>8. Transferencia de Datos</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      No transferimos sus datos personales a terceros excepto cuando sea necesario para la prestación 
                      del servicio, cumplimiento de obligaciones legales, o con su consentimiento explícito. 
                      Cualquier transferencia se realizará con las garantías adecuadas de protección.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Si tiene alguna pregunta sobre estos {isTerminos ? 'términos' : 'políticas de datos'}, 
                por favor contáctenos a través de los canales oficiales de la plataforma.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
