-- 1. Drop existing constraint
ALTER TABLE guias DROP CONSTRAINT IF EXISTS guias_categoria_check;

-- 2. Migrate existing data to new categories
UPDATE guias SET categoria = 'sabias_que' WHERE categoria = 'compostaje';
UPDATE guias SET categoria = 'reutilizacion_aprovechamiento' WHERE categoria IN ('reciclaje', 'reutilizacion');
UPDATE guias SET categoria = 'salud_bienestar' WHERE categoria = 'reduccion';
UPDATE guias SET categoria = 'impacto_sostenibilidad' WHERE categoria = 'sostenibilidad';

-- 3. Add new constraint with new categories
ALTER TABLE guias ADD CONSTRAINT guias_categoria_check 
CHECK (categoria IN ('sabias_que', 'reutilizacion_aprovechamiento', 'manuales_tecnicos', 'salud_bienestar', 'impacto_sostenibilidad'));

-- 4. Delete old example guides
DELETE FROM guias WHERE id IN (
  'dd67f9d7-0eeb-4f48-84db-b442e85e06a2',
  '33c8a102-1708-46bf-a450-552bbab5c516',
  'fb1f8896-33a1-4d7a-b336-808db2f8e6d5',
  '140d24d9-0062-4003-b896-46e5b1f31d16',
  'd2b81893-8241-4f11-a7b1-c02188bdc13a',
  'facacee0-b0ef-4349-8bb7-99ca06f8bf34'
);

-- 5. Create new example guides for each category
INSERT INTO guias (
  titulo, 
  descripcion, 
  contenido, 
  tipo, 
  categoria, 
  nivel, 
  destacada, 
  activa,
  autor_id,
  tags,
  tiempo_lectura
) VALUES
(
  'El Valor Oculto de los Residuos Orgánicos',
  'Descubre cómo los residuos que desechas pueden generar energía limpia y nutrientes para el suelo',
  '# El Valor Oculto de los Residuos Orgánicos

Los residuos orgánicos que generamos diariamente tienen un valor increíble que a menudo desconocemos. Cada cáscara de fruta, resto de comida o residuo vegetal puede transformarse en:

## Beneficios Ambientales

- **Energía Limpia**: A través del biogas, los residuos orgánicos pueden generar electricidad y calor
- **Compost Rico**: Nutrientes esenciales para mejorar la calidad del suelo
- **Reducción de Emisiones**: Menos metano en vertederos significa menos gases de efecto invernadero

## Datos Sorprendentes

¿Sabías que cada colombiano genera aproximadamente 0.5 kg de residuos orgánicos por día? Si todos estos residuos se aprovecharan correctamente, podríamos:

- Reducir un 40% de los residuos en vertederos
- Generar energía para miles de hogares
- Crear empleos verdes en nuestra comunidad

En Natuvital, conectamos a quienes generan estos valiosos residuos con quienes pueden transformarlos en recursos útiles.',
  'articulo',
  'sabias_que',
  'principiante',
  true,
  true,
  '00000000-0000-0000-0000-000000000000',
  ARRAY['residuos organicos', 'biogas', 'compost', 'sostenibilidad'],
  5
),
(
  'Cáscaras de Frutas: De Residuo a Recurso',
  'Aprende a transformar cáscaras de piña, naranja y plátano en productos útiles para tu hogar',
  '# Cáscaras de Frutas: De Residuo a Recurso

Las cáscaras de frutas son mucho más que residuos. Con técnicas simples, puedes transformarlas en productos útiles para tu hogar.

## Cáscaras de Piña

**Vinagre de Piña Casero**
1. Lava bien las cáscaras de 2 piñas
2. Colócalas en un frasco de vidrio con 1 litro de agua y ½ taza de azúcar
3. Cubre con una tela y deja fermentar 7-10 días
4. Cuela y embotella

## Cáscaras de Naranja

**Limpiador Natural Multiusos**
1. Llena un frasco con cáscaras de naranja
2. Cubre con vinagre blanco
3. Deja macerar 2 semanas
4. Cuela y diluye 1:1 con agua

## Cáscaras de Plátano

**Fertilizante Líquido**
1. Corta 3-4 cáscaras en trozos pequeños
2. Hiérvelas en 1 litro de agua por 15 minutos
3. Deja enfriar y cuela
4. Diluye 1:5 con agua para regar tus plantas

¡Cada residuo es una oportunidad!',
  'video',
  'reutilizacion_aprovechamiento',
  'principiante',
  true,
  true,
  '00000000-0000-0000-0000-000000000000',
  ARRAY['reutilizacion', 'cascaras', 'diy', 'reciclaje'],
  8
),
(
  'Cómo Publicar y Gestionar un Lote de R.O.A',
  'Guía paso a paso para generadores: desde crear tu primer lote hasta completar la transacción',
  '# Cómo Publicar y Gestionar un Lote de R.O.A

Esta guía te ayudará a publicar tu primer lote de Residuos Orgánicos Aprovechables en Natuvital.

## Paso 1: Crear tu Lote

1. Accede a **Mis Lotes** desde el menú principal
2. Haz clic en **"Publicar Nuevo Lote"**
3. Completa la información requerida:
   - **Tipo de Residuo**: Selecciona de la lista (frutas, verduras, café, etc.)
   - **Peso Estimado**: Indica la cantidad en kilogramos
   - **Fecha Disponible**: ¿Cuándo puede recogerse?
   - **Ubicación**: Agrega tu dirección o usa el mapa
   - **Fotos**: Sube imágenes claras del lote

## Paso 2: Revisión y Aprobación

- Tu lote será revisado por nuestro equipo (24-48 horas)
- Recibirás una notificación cuando sea aprobado
- El lote aparecerá en el mapa público

## Paso 3: Gestionar Solicitudes

Cuando un transformador esté interesado:
- Recibirás una notificación de solicitud
- Revisa el perfil y calificaciones del solicitante
- **Acepta** para coordinar la recolección
- **Rechaza** si no es conveniente

## Paso 4: Coordinar la Recolección

- Usa el chat integrado para acordar detalles
- Confirma fecha, hora y modalidad de entrega
- Al completarse, califica la experiencia

## Consejos Importantes

✅ Sé preciso con el peso y tipo de residuo
✅ Responde rápido a las solicitudes
✅ Mantén comunicación clara
✅ Califica honestamente para mantener la confianza

¡Bienvenido a la red Natuvital!',
  'articulo',
  'manuales_tecnicos',
  'principiante',
  true,
  true,
  '00000000-0000-0000-0000-000000000000',
  ARRAY['tutorial', 'lotes', 'generadores', 'guia'],
  10
),
(
  'Alimentación Consciente: Reduce el Desperdicio',
  'Consejos prácticos para aprovechar al máximo tus alimentos y reducir residuos en la cocina',
  '# Alimentación Consciente: Reduce el Desperdicio

Reducir el desperdicio de alimentos no solo beneficia al planeta, también mejora tu salud y ahorra dinero.

## Planifica tus Compras

- Haz una lista antes de ir al mercado
- Compra solo lo necesario para la semana
- Revisa tu nevera antes de comprar más

## Almacenamiento Inteligente

**En la Nevera:**
- Verduras de hoja en recipientes herméticos con papel absorbente
- Hierbas frescas en vasos con agua
- Frutas maduras separadas de las verdes

**En la Despensa:**
- Granos en frascos de vidrio herméticos
- Utiliza el método FIFO (primero en entrar, primero en salir)

## Aprovecha Todo

**Tallos de Brócoli**: Pela y usa en sopas o salteados
**Hojas de Zanahoria**: Perfectas para pesto o ensaladas
**Pan Duro**: Tostadas, migas para empanar o pudín
**Frutas Maduras**: Batidos, compotas o postres

## Porciones Conscientes

- Sirve menos y repite si es necesario
- Guarda sobras en porciones individuales
- Congela lo que no vayas a usar pronto

## Compostaje en Casa

Lo que no puedas consumir, transfórmalo:
- Cáscaras de frutas y verduras
- Restos de café y té
- Cáscaras de huevo trituradas

Pequeños cambios, gran impacto 🌿',
  'articulo',
  'salud_bienestar',
  'principiante',
  false,
  true,
  '00000000-0000-0000-0000-000000000000',
  ARRAY['alimentacion', 'desperdicio', 'salud', 'cocina'],
  7
),
(
  'El Impacto de Natuvital en Comunidades Locales',
  'Historias reales de cómo la red está transformando la gestión de residuos en tu región',
  '# El Impacto de Natuvital en Comunidades Locales

Natuvital está generando un impacto real y medible en nuestras comunidades. Aquí te mostramos cómo.

## Cifras que Inspiran

En el último año, nuestra red ha logrado:

📊 **2,500 toneladas** de residuos orgánicos aprovechados
👥 **850 usuarios activos** (generadores y transformadores)
🌱 **180 toneladas** de compost producido
⚡ **45,000 kWh** de energía limpia generada
💼 **120 empleos verdes** creados o fortalecidos

## Historias de Éxito

### María - Restaurante "El Buen Sabor" (Bogotá)

*"Antes pagábamos por la recolección de 200 kg semanales de residuos de frutas y verduras. Ahora, a través de Natuvital, estos residuos generan compost para agricultores locales. Hemos reducido costos y contribuimos al medio ambiente."*

### Carlos - Transformador de Biogas (Medellín)

*"Recolecto residuos orgánicos de 15 restaurantes asociados en Natuvital. Con ellos produzco biogas que uso en mi emprendimiento de panadería. He reducido 70% mis costos de gas convencional."*

### Asociación de Agricultores - Valle del Cauca

*"El compost que obtenemos de la red Natuvital ha mejorado un 40% la calidad de nuestro suelo. Ya no dependemos de fertilizantes químicos costosos."*

## Beneficios Ambientales Locales

✅ **Menos vertederos saturados**: Reducción del 35% en residuos orgánicos
✅ **Aire más limpio**: Menor emisión de metano
✅ **Suelos más sanos**: Compost de calidad para agricultura local
✅ **Economía circular**: Recursos que permanecen en la comunidad

## Únete al Movimiento

Cada usuario de Natuvital contribuye a este impacto. Ya seas generador o transformador, eres parte de una red que está cambiando la forma en que vemos y gestionamos los residuos.

**Juntos construimos un futuro más sostenible** 🌎',
  'infografia',
  'impacto_sostenibilidad',
  'principiante',
  true,
  true,
  '00000000-0000-0000-0000-000000000000',
  ARRAY['impacto', 'comunidad', 'sostenibilidad', 'resultados'],
  6
);