# 🚀 CLOUDFLARE PAGES - SETUP NATUVITAL

**Cuenta:** Cristiandavidchacon@hotmail.com
**Proyecto:** natuvital
**Estado:** Listo para desplegar ✅

---

## 📋 PASO A PASO

### **PASO 1: Ir a Cloudflare Dashboard**

```
1. Abre https://dash.cloudflare.com
2. Login con cristiandavidchacon@hotmail.com
3. Haz click en "Pages" (lado izquierdo)
```

---

### **PASO 2: Crear Nuevo Proyecto**

```
En la página de Pages:
┌─────────────────────────────────────┐
│ Click: "Create a project"           │
│ o "Create application"              │
└─────────────────────────────────────┘
```

---

### **PASO 3: Conectar GitHub**

```
Verás dos opciones:
┌─────────────────────────────────────┐
│ ✅ Connect to Git (ELEGIR ESTO)     │
│ ☐ Upload assets                     │
└─────────────────────────────────────┘

Click "Connect to Git"
↓
Selecciona "GitHub"
↓
Authorize Cloudflare OAuth (click en popup)
```

---

### **PASO 4: Seleccionar Repositorio**

```
Después de autorizar GitHub:
┌──────────────────────────────────────┐
│ Buscar: "radix-react-builder"       │
│ Resultado: gregson.murcia/radix...  │
│ Click para seleccionar               │
└──────────────────────────────────────┘
```

---

### **PASO 5: Configurar Build Settings**

```
Formulario que aparecerá:

Project name: natuvital
(auto-llena)

Branch to deploy: main
(dejar así - también desplegará "data" automáticamente)

Build command: bun run build
(IMPORTANTE: usar "bun" no "npm")

Build output directory: dist
(ya está correcto)

Root directory: /
(dejar así)

Environment variables:
(ver PASO 6)
```

---

### **PASO 6: Agregar Variables de Entorno** ⚠️ CRÍTICO

En la sección "Environment variables", click "+ Add variable":

**Variable 1:**
```
Name:  VITE_SUPABASE_URL
Value: https://gvegsztwqsaomkuywirl.supabase.co
```

**Variable 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2ZWdzenR3cXNhb21rdXl3aXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzOTUsImV4cCI6MjA2ODgwOTM5NX0.Jaqr6TvSf6EmWCs7FQjiEFP49o8qkkOmmMIU59_EhTk
```

Verifica que ambas estén ahí.

---

### **PASO 7: Crear Proyecto**

```
Click: "Save and Deploy"

Verás:
⏳ Building...
⏳ Deploying...
✅ Deployment successful!

Tu URL temporal:
natuvital-XXXXXXX.pages.dev
```

**COPIAR ESTA URL Y PROBAR EN EL NAVEGADOR** ✅

---

### **PASO 8: Configurar Dominio Personalizado** (Opcional)

Si tienes dominio ya:

```
En el proyecto → Custom domain
↓
Click "Add custom domain"
↓
Ingresa tu dominio (ej: natuvital.com)
↓
Sigue instrucciones para cambiar nameservers
```

Si NO tienes dominio, sáltate este paso.

---

## 🔐 PASO 9: GitHub Secrets (Para CI/CD automático)

Para que cada `git push` despliegue automáticamente:

```
En GitHub:
Settings → Secrets and variables → Actions
↓
Click "New repository secret"
```

**Secret 1: CLOUDFLARE_API_TOKEN**

```
Vuelve a Cloudflare:
1. Haz click en tu avatar (arriba a la derecha)
2. My Profile → API Tokens
3. Click "Create token"
4. Template: "Edit Cloudflare Workers"
5. Click "Use template"
6. Resource: Account → Cloudflare Pages
7. Permissions: Edit Cloudflare Workers + Account.Workers KV Storage
8. Create
9. COPIAR el token

En GitHub, pega en Secret value
```

**Secret 2: CLOUDFLARE_ACCOUNT_ID**

```
En Cloudflare Dashboard:
1. Workers & Pages → Overview
2. Copia tu Account ID (arriba a la derecha)

En GitHub, pega como Secret value
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

```bash
# Local: haz build
bun run build

# Prueba local
bun run preview
# Abre http://localhost:4173

# Haz push a GitHub
git add .
git commit -m "Deploy to Cloudflare"
git push origin main

# Ve a:
# GitHub → Actions → verás el workflow ejecutándose
# Cloudflare → Pages → natuvital → Deployments

# Verifica que se vea:
# ✅ Status: Success
```

---

## 🎯 AHORA SÍ: Despliegue Manual Inmediato

Si quieres desplegar YA sin esperar GitHub Actions:

```bash
# 1. Instala wrangler globalmente
npm install -g wrangler

# 2. Login en Cloudflare
wrangler login
# Se abrirá navegador para autorizar

# 3. Deploy a Pages
wrangler pages deploy dist

# Output:
# ✅ Deployment successful!
# URL: natuvital-XXXXX.pages.dev
```

---

## 🚨 Si hay errores

### **Error: "Build failed - bun not found"**

En Cloudflare Pages → Settings → Build settings:
```
Build command: npm ci && npm run build
```

Cambiar a:
```
Build command: npm run build
```

---

### **Error: "Cannot find module 'vite'"**

En Cloudflare Pages → Settings:
```
Node version: 18 (default)
```

Cambiar a:
```
Node version: 20
```

---

### **Error: "VITE_SUPABASE variables undefined"**

Asegúrate de haber agregado las 2 variables en PASO 6.

Verifica:
```
Settings → Environment variables
└─ VITE_SUPABASE_URL ✅
└─ VITE_SUPABASE_ANON_KEY ✅
```

---

## 📊 Después del Deploy

**URL de tu app:**
```
https://natuvital-XXXXX.pages.dev
```

**Próximos pasos:**
1. ✅ Compra dominio (natuvital.com) en Namecheap o Cloudflare
2. ✅ Apunta DNS a Cloudflare
3. ✅ Agrega custom domain
4. ✅ Gratis HTTPS automático
5. ✅ Gratis WAF + DDoS protection

---

## 🆘 ¿Necesitas ayuda?

Si algo falla:
1. Toma screenshot del error
2. Comparte los logs (Cloudflare → Deployments → Logs)
3. Cuéntame exactamente qué dice el error

---

**STATUS: ✅ LISTO PARA DESPLEGAR**

Todos los archivos están en el repo. Solo sigue los 9 pasos anteriores.

¡Adelante! 🚀
