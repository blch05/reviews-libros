# GitHub Actions - Reviews Libros

Este proyecto incluye tres workflows de GitHub Actions para automatizar el proceso de CI/CD.

## 📁 Workflows Disponibles

### 1. **Build App** (`.github/workflows/build.yml`)
- **Trigger:** Push y Pull Requests a `main` y `Christian-Barreto`
- **Función:** Construye la aplicación Next.js
- **Características:**
  - Prueba en Node.js 18 y 20
  - Ejecuta lint check
  - Genera build de producción
  - Sube artefactos del build
  - Verifica el tamaño del build

### 2. **Run Tests** (`.github/workflows/test.yml`)
- **Trigger:** Push y Pull Requests a `main` y `Christian-Barreto`
- **Función:** Ejecuta todos los tests
- **Características:**
  - Prueba en Node.js 18 y 20
  - Ejecuta tests con Vitest
  - Genera reporte de cobertura
  - Sube resultados como artefactos
  - Comenta cobertura en PRs

### 3. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
- **Trigger:** Push y Pull Requests a `main` y `Christian-Barreto`
- **Función:** Pipeline completo de integración y despliegue
- **Flujo:**
  1. **Test** → Ejecuta linting y tests
  2. **Build** → Construye la app (solo si tests pasan)
  3. **Deploy Preview** → Preview en PRs
  4. **Deploy Production** → Producción en push a main
  5. **Notify** → Notificaciones de resultados

## 🚀 Ejecución Manual

Todos los workflows incluyen `workflow_dispatch` que permite ejecutarlos manualmente desde la interfaz de GitHub:

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Selecciona el workflow que quieres ejecutar
4. Click en **Run workflow**
5. Selecciona la rama y click **Run workflow**

## 📊 Scripts Disponibles

Los workflows utilizan estos scripts del `package.json`:

```bash
npm run build          # Construir aplicación
npm run lint           # Verificar código
npm test              # Ejecutar tests
npm run test:coverage # Tests con cobertura
```

## 🔄 Flujo de Trabajo Típico

### Para Development:
1. Crea una rama desde `Christian-Barreto`
2. Haz commits y push
3. Los workflows **Build** y **Test** se ejecutan automáticamente

### Para Pull Requests:
1. Abre un PR hacia `main` o `Christian-Barreto`
2. Se ejecuta el **CI/CD Pipeline** completo
3. Se genera un preview de deployment
4. Los resultados aparecen en el PR

### Para Production:
1. Merge del PR a `main` o `Christian-Barreto`
2. Se ejecuta deployment automático
3. La app se actualiza en producción

## 📋 Artefactos Generados

Los workflows generan y suben estos artefactos:

- **Build files:** Archivos compilados (`.next/`, `out/`)
- **Test results:** Resultados y cobertura de tests
- **Production build:** Build listo para producción

## ⚙️ Configuración

### Variables de Entorno (si necesarias):
```yaml
# En GitHub Settings > Secrets and Variables > Actions
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Personalización:
- Edita los archivos en `.github/workflows/` para modificar comportamiento
- Cambia las ramas en los triggers según tus necesidades
- Ajusta las versiones de Node.js en la matrix strategy

## 🐛 Troubleshooting

### Si los workflows fallan:
1. Revisa los logs en la pestaña **Actions**
2. Verifica que todos los scripts existan en `package.json`
3. Asegúrate de que las dependencias estén actualizadas
4. Revisa los permisos del repositorio

### Tests fallando:
```bash
# Ejecutar localmente para debuggear
npm test
npm run test:coverage
```

### Build fallando:
```bash
# Verificar build local
npm run build
npm run lint
```

¡Las GitHub Actions están listas para automatizar tu flujo de desarrollo! 🎉
