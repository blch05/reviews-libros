# Arquitectura en Capas - Sistema de Reseñas de Libros

## Visión General

Este proyecto implementa una **arquitectura en capas** (Layered Architecture) que separa las responsabilidades en diferentes niveles para mejorar la mantenibilidad, testabilidad y escalabilidad del código.

## Estructura de Capas

### 🎯 **Domain Layer** (Capa de Dominio)
**Ubicación**: `BookDomain`, `ReviewDomain`, `UserDomain`

**Responsabilidades**:
- Lógica de negocio pura sin dependencias externas
- Validaciones de reglas de negocio
- Algoritmos de cálculo específicos del dominio
- Transformaciones de datos del dominio

**Características**:
- ✅ No dependencias externas
- ✅ Funciones puras cuando es posible
- ✅ Fácil de testear
- ✅ Reutilizable

```typescript
// Ejemplo: Validación de dominio
BookDomain.validateSearchQuery(query)
ReviewDomain.validateRating(rating)
UserDomain.validateEmail(email)
```

### 🚀 **Application Layer** (Capa de Aplicación)
**Ubicación**: `BookApplicationService`, `ReviewApplicationService`, `UserApplicationService`

**Responsabilidades**:
- Orquestación de casos de uso
- Coordinación entre servicios
- Manejo de transacciones
- Aplicación de políticas de negocio
- Caché y logging

**Características**:
- ✅ Inyección de dependencias
- ✅ Manejo de errores centralizado
- ✅ Logging y métricas
- ✅ Caché transparente

```typescript
// Ejemplo: Caso de uso completo
const result = await bookService.searchBooks(query, filters)
if (result.success) {
  console.log('Books found:', result.data)
}
```

### 🔧 **Infrastructure Layer** (Capa de Infraestructura)
**Ubicación**: `InMemoryCache`, `ConsoleLogger`, repositorios

**Responsabilidades**:
- Acceso a datos (bases de datos, APIs)
- Servicios de caché
- Logging y monitoreo
- Servicios externos
- Configuración

**Características**:
- ✅ Implementaciones intercambiables
- ✅ Interfaces bien definidas
- ✅ Manejo de conexiones
- ✅ Configuración centralizada

## Ventajas de esta Arquitectura

### 🎯 **Separación de Responsabilidades**
- **Domain**: ¿Qué reglas de negocio aplican?
- **Application**: ¿Cómo orquestamos los casos de uso?
- **Infrastructure**: ¿Cómo accedemos a recursos externos?

### 🧪 **Testabilidad Mejorada**
```typescript
// Tests de dominio (sin mocks)
test('should validate email format', () => {
  expect(UserDomain.validateEmail('test@example.com')).toBe(true)
})

// Tests de aplicación (con mocks)
test('should create review with validation', async () => {
  const mockRepo = { create: jest.fn() }
  const service = new ReviewApplicationService(mockRepo, ...)
  // ...
})
```

### 🔄 **Flexibilidad y Mantenibilidad**
- Cambiar implementaciones sin afectar otras capas
- Agregar nuevas funcionalidades siguiendo patrones establecidos
- Refactoring seguro con interfaces bien definidas

### 🚀 **Escalabilidad**
- Cada capa puede optimizarse independientemente
- Fácil identificación de cuellos de botella
- Posibilidad de microservicios por dominio

## Patrones Implementados

### 🏭 **Dependency Injection**
```typescript
// Container de servicios
const container = ServiceContainer.createDefault()
container.register('cache', () => new InMemoryCache())
container.register('logger', () => new ConsoleLogger())

// Uso
const bookService = container.get('bookService')
```

### 📋 **Repository Pattern**
```typescript
interface IBookRepository {
  findById(id: string): Promise<Book>
  search(query: SearchParams): Promise<SearchResult>
}

// Implementación intercambiable
class MongoBookRepository implements IBookRepository { ... }
class SQLBookRepository implements IBookRepository { ... }
```

### 🎭 **Service Layer Pattern**
```typescript
// Encapsula lógica de aplicación
class BookApplicationService {
  async searchBooks(query: string) {
    // 1. Validación de dominio
    // 2. Lógica de caché
    // 3. Llamada a repositorio
    // 4. Transformación de datos
    // 5. Logging y métricas
  }
}
```

## Comparación: Antes vs Después

### ❌ **Antes** (Arquitectura Monolítica)
```typescript
// Todo mezclado en un solo lugar
export default function handler(req, res) {
  // Validación, lógica de negocio, acceso a DB, logging... todo junto
  if (!req.body.title) return res.status(400).json({error: 'Title required'})
  
  const book = await db.books.create({
    title: req.body.title.trim(),
    // ... más lógica mezclada
  })
  
  console.log('Book created')
  res.json(book)
}
```

### ✅ **Después** (Arquitectura en Capas)
```typescript
// Separación clara de responsabilidades
async function createBook(bookData) {
  // Domain: Validación pura
  BookDomain.validateBookData(bookData)
  
  // Application: Orquestación
  const result = await bookService.createBook(bookData)
  
  // Infrastructure: Manejo automático de caché, logging, etc.
  return result
}
```

## Guía de Implementación

### 1. **Identificar Dominios**
- Libros (Books)
- Reseñas (Reviews) 
- Usuarios (Users)
- Favoritos (Favorites)
- Votos (Votes)

### 2. **Crear Servicios de Dominio**
```typescript
export class BookDomain {
  static validateSearchQuery(query: string): void { ... }
  static calculateAverageRating(ratings: number[]): number { ... }
}
```

### 3. **Implementar Servicios de Aplicación**
```typescript
export class BookApplicationService {
  constructor(
    private bookRepository: IBookRepository,
    private cacheService: ICacheService,
    private logger: ILogger
  ) {}
  
  async searchBooks(query: string) { ... }
}
```

### 4. **Configurar Inyección de Dependencias**
```typescript
const container = ServiceContainer.createDefault()
// Registrar todos los servicios...
```

## Migración Gradual

### Fase 1: **Extraer Lógica de Dominio**
- Mover validaciones a clases de dominio
- Extraer cálculos de negocio
- Crear funciones puras

### Fase 2: **Crear Servicios de Aplicación**
- Envolver lógica existente en servicios
- Agregar caché y logging
- Implementar manejo de errores

### Fase 3: **Separar Infraestructura**
- Extraer acceso a datos
- Crear interfaces de repositorio
- Implementar inyección de dependencias

### Fase 4: **Optimizar y Refinar**
- Mejorar interfaces
- Agregar tests
- Optimizar rendimiento

## Beneficios Medibles

### 📊 **Métricas de Calidad**
- **Complejidad Ciclomática**: Reducida por separación de responsabilidades
- **Acoplamiento**: Menor dependencia entre módulos
- **Cohesión**: Mayor coherencia dentro de cada capa
- **Cobertura de Tests**: Más fácil alcanzar alta cobertura

### 🚀 **Rendimiento**
- **Caché Inteligente**: Automático en capa de aplicación
- **Lazy Loading**: Carga de datos bajo demanda
- **Monitoreo**: Métricas automáticas de rendimiento

### 🔧 **Mantenibilidad**
- **Tiempo de Desarrollo**: Menor para nuevas funcionalidades
- **Debugging**: Más fácil localizar problemas
- **Refactoring**: Más seguro con interfaces bien definidas

## Próximos Pasos

1. **Implementar Repositorios Reales** (MongoDB, PostgreSQL)
2. **Agregar Tests Unitarios** para cada capa
3. **Implementar Middleware** de autenticación
4. **Crear API Gateway** para manejo centralizado
5. **Agregar Monitoreo** y métricas avanzadas

Esta arquitectura establece bases sólidas para el crecimiento futuro del proyecto manteniendo el código organizad and maintainable.