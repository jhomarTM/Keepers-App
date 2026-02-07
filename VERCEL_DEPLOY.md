# Guía de despliegue en Vercel

Si ves **404: NOT FOUND** en tu deployment, revisa lo siguiente en el [Dashboard de Vercel](https://vercel.com/dashboard):

## 1. Configuración del proyecto

En **Settings → General**:

| Opción | Valor correcto |
|--------|----------------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | *(vacío o `.`)* — Si el repo tiene el proyecto en la raíz |
| **Build Command** | `npm run build` (o dejar por defecto) |
| **Output Directory** | *(vacío)* — **No establecer** para Next.js |
| **Install Command** | `npm install` (o dejar por defecto) |

## 2. Output Directory

Es la causa más frecuente del 404. **No debes configurar Output Directory** para Next.js. Si está puesto en algo como `out` o `dist`, Vercel servirá una carpeta vacía o incorrecta.

## 3. Revisar los logs del build

En **Deployments → [tu deployment] → Building**:

- El build debe terminar con éxito
- Si falla, aparece el error en los logs

## 4. Re-deploy

Si cambiaste la configuración:

1. Guarda los cambios
2. Ve a **Deployments**
3. Abre el deployment más reciente
4. Haz clic en **"Redeploy"**

## 5. Monorepo

Si el proyecto está dentro de una carpeta (ej: `apps/keepers-app`):

- **Root Directory** debe ser `apps/keepers-app` (o la ruta correcta)
