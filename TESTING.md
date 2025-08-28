# Testing Documentation - Reviews Libros

## Resumen de Testing

Este proyecto implementa pruebas unitarias completas usando **Vitest** y **Testing Library** para cubrir toda la lógica de negocios de la aplicación de reseñas de libros.

## Tecnologías de Testing

- **Vitest**: Framework de testing rápido y moderno
- **@testing-library/react**: Testing utilities para componentes React
- **@testing-library/jest-dom**: Matchers adicionales para assertions
- **@testing-library/user-event**: Simulación de interacciones de usuario
- **jsdom**: Entorno DOM para testing
- **@vitest/coverage-v8**: Generación de reportes de coverage

## Estructura de Testing

### 1. Configuración Base
- `vitest.config.ts`: Configuración principal de Vitest
- `src/test/setup.ts`: Setup global para mocks y configuración

### 2. Lógica de Negocios (Testeo Directo)
Estas clases contienen la lógica core y se testean directamente:

#### `BookReviewUtils` (`book-review-utils.test.ts`)
- ✅ **getBookReviews**: Manejo de localStorage, JSON parsing, edge cases
- ✅ **getAverageStars**: Cálculos matemáticos, casos límite
- ✅ **getBestAndWorstReviews**: Ordenamiento, comparaciones
- ✅ **getBookCoverUrl**: Priorización de imágenes, conversión HTTP->HTTPS
- ✅ **getPublicationInfo**: Formateo de strings, combinación de datos

#### `client-utils` (`client-utils.test.ts`)
- ✅ **getTopReviewedBooks**: Ordenamiento, filtrado, límites
- ✅ **getCachedBook**: Serialización/deserialización, error handling
- ✅ **setCachedBook**: Persistencia, sobrescritura

### 3. Server Actions (Testeo con Mocks)
Estas funciones hacen llamadas a APIs externas, por lo que se mockean:

#### `server-actions` (`server-actions.test.ts`)
- ✅ **buscarLibros**: Mock de fetch, encoding de URLs, error handling
- ✅ **obtenerLibro**: Llamadas a Google Books API
- ✅ **obtenerLibrosPorIds**: Promise.all, filtrado de errores

#### API Routes (`api/books/route.test.ts`, `api/reviews/route.test.ts`)
- ✅ **POST /api/books**: Proxy a Google Books API
- ✅ **GET /api/reviews**: Obtención de reseñas por libro
- ✅ **PUT /api/reviews**: Agregar nuevas reseñas
- ✅ **PATCH /api/reviews**: Sistema de votación

### 4. Componentes React (Testeo con Mocks Parciales)

#### Componentes Simples (Testeo Directo)
- ✅ **StarRating**: Renderizado, props, edge cases de rating
- ✅ **TruncatedText**: Truncamiento, expansión, callbacks
- ✅ **BookImage**: Tamaños, fallbacks, accesibilidad

#### Componentes Complejos (Testeo con Mocks)
- ✅ **BookCard**: Integración de múltiples componentes, mocks de dependencias
- ✅ **useTopBooks**: Hook personalizado, async operations, error handling

## Estrategia de Mocking

### ¿Qué se Mockea?
1. **APIs Externas**: Google Books API (fetch)
2. **Browser APIs**: localStorage, window objeto
3. **Componentes de UI**: Para tests de integración
4. **Módulos de utilidades**: Cuando se testea integración

### ¿Qué NO se Mockea?
1. **Lógica de negocios pura**: BookReviewUtils
2. **Cálculos matemáticos**: Promedios, ordenamientos
3. **Manipulación de strings**: Formateo, truncamiento
4. **Validaciones**: Edge cases, tipos de datos

## Coverage Objetivo

El proyecto apunta a:
- **90%+ cobertura de líneas** en lógica de negocios
- **85%+ cobertura de branches** para edge cases
- **100% cobertura** en funciones críticas (cálculos, validaciones)

## Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test

# Ejecutar pruebas una sola vez
npm run test:run

# Generar reporte de coverage
npm run test:coverage

# Ejecutar pruebas con UI
npm run test:ui
```

## Edge Cases Cubiertos

### 1. Manejo de Datos
- ✅ JSON inválido en localStorage
- ✅ Valores null/undefined
- ✅ Arrays vacíos
- ✅ Strings vacíos
- ✅ Números negativos/cero

### 2. Errores de Red
- ✅ Fallos de fetch
- ✅ Timeouts
- ✅ Respuestas malformadas
- ✅ Estados 404/500

### 3. Estados de Interfaz
- ✅ Loading states
- ✅ Estados vacíos (sin datos)
- ✅ Estados de error
- ✅ Interacciones de usuario

### 4. Compatibilidad
- ✅ Entorno servidor (SSR)
- ✅ Browser sin localStorage
- ✅ Diferentes tamaños de pantalla

## Mejores Prácticas Implementadas

### 1. Aislamiento de Tests
- Cada test es independiente
- Setup/teardown apropiado
- Mocks limpios entre tests

### 2. Naming Conventions
- Descripciones claras en español
- Estructura AAA (Arrange, Act, Assert)
- Tests organizados por funcionalidad

### 3. Assertions Significativas
- Verificación de comportamiento, no implementación
- Edge cases explícitos
- Error messages descriptivos

### 4. Mock Strategy
- Mocks mínimos necesarios
- Verificación de calls con parámetros correctos
- Simulación realista de errores

## Tests por Archivo

| Archivo | Tests | Coverage Focus |
|---------|-------|----------------|
| `book-review-utils.test.ts` | 30+ | Lógica de negocios crítica |
| `client-utils.test.ts` | 25+ | Manejo de localStorage |
| `server-actions.test.ts` | 20+ | API calls y error handling |
| `StarRating.test.tsx` | 15+ | Renderizado y props |
| `TruncatedText.test.tsx` | 20+ | Interacción y estados |
| `BookImage.test.tsx` | 15+ | Props y fallbacks |
| `BookCard.test.tsx` | 25+ | Integración de componentes |
| `useTopBooks.test.ts` | 15+ | Async operations y hooks |
| `route.test.ts` (books) | 12+ | API endpoints |
| `route.test.ts` (reviews) | 15+ | CRUD operations |

**Total: ~190+ tests** cubriendo todos los aspectos críticos de la aplicación.

## Ejecutar Tests

Para ejecutar las pruebas:

```bash
# Instalar dependencias si no se han instalado
npm install

# Ejecutar todas las pruebas
npm run test

# Ver coverage
npm run test:coverage
```

Las pruebas están diseñadas para ser rápidas, confiables y mantenibles, siguiendo las mejores prácticas de testing moderno.
