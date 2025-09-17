/**
 * EJEMPLO DE USO DE COMPONENTES REUTILIZABLES
 * 
 * Este archivo muestra cómo usar todos los nuevos hooks y componentes
 * reutilizables que hemos creado para mejorar la reutilización de código.
 * 
 * NO ELIMINAR - Es documentación de referencia
 */

'use client'

import React, { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from './ui'
import { 
  useLocalStorage, 
  useDebounce, 
  useAsync, 
  useToggle
} from '../hooks'
import { stringUtils, dateUtils } from '../utils'

// Ejemplo 1: Formulario simple con componentes reutilizables
const ExampleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Formulario enviado correctamente')
    setFormData({ name: '', email: '', message: '' })
    setIsSubmitting(false)
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Formulario de Contacto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
          
          <Input
            label="Mensaje"
            value={formData.message}
            onChange={handleChange('message')}
            required
          />
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              loading={isSubmitting}
              disabled={!formData.name || !formData.email || !formData.message}
            >
              Enviar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormData({ name: '', email: '', message: '' })}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Ejemplo 2: Búsqueda con debounce
const ExampleSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useLocalStorage('search-term', '')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const { data, isLoading, error } = useAsync(async () => {
    if (!debouncedSearchTerm) return []
    
    // Simular búsqueda API
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      { id: 1, title: `Resultado para: ${debouncedSearchTerm}` },
      { id: 2, title: `Otro resultado: ${debouncedSearchTerm}` }
    ]
  }, Boolean(debouncedSearchTerm))

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Búsqueda con Debounce</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Escribe para buscar..."
        />
        
        {isLoading && (
          <div className="mt-4 text-center text-gray-500">
            Buscando...
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-center text-red-500">
            Error en la búsqueda
          </div>
        )}
        
        {data && data.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.map((item: any) => (
              <div key={item.id} className="p-2 bg-gray-50 rounded">
                {item.title}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Ejemplo 3: Toggle y utilidades de fecha
const ExampleUtilities: React.FC = () => {
  const [isVisible, toggleVisible] = useToggle(false)
  const [savedDate] = useLocalStorage('last-visit', new Date().toISOString())
  
  const handleShowDate = () => {
    const formatted = dateUtils.format(new Date(savedDate), 'long')
    const relative = dateUtils.getRelativeTime(new Date(savedDate))
    alert(`Última visita: ${formatted} (${relative})`)
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Utilidades y Toggle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Mostrar contenido:</span>
          <Button 
            variant={isVisible ? 'primary' : 'outline'} 
            onClick={toggleVisible}
          >
            {isVisible ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
        
        {isVisible && (
          <div className="p-4 bg-blue-50 rounded">
            <p>¡Contenido visible!</p>
            <p className="text-sm text-gray-600 mt-2">
              Texto truncado: {stringUtils.truncate('Este es un texto muy largo que será truncado', 30)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Capitalizado: {stringUtils.capitalize('texto en minúsculas')}
            </p>
          </div>
        )}
        
        <Button onClick={handleShowDate} variant="outline" className="w-full">
          Ver fecha de última visita
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente principal que muestra todos los ejemplos
export const ReusabilityExamples: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Ejemplos de Componentes Reutilizables
      </h1>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <ExampleForm />
        <ExampleSearch />
        <ExampleUtilities />
      </div>
      
      <div className="text-center text-gray-600 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Mejoras de Reutilización Implementadas:</h2>
        <div className="grid gap-4 md:grid-cols-2 text-left">
          <div>
            <h3 className="font-medium text-gray-800">Hooks Personalizados:</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• useApi - API calls centralizadas</li>
              <li>• useForm - Gestión de formularios</li>
              <li>• useLocalStorage - Persistencia local</li>
              <li>• useDebounce - Optimización de búsquedas</li>
              <li>• useAsync - Estados de carga</li>
              <li>• useToggle - Estados booleanos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Componentes UI:</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Button - Botones con variantes</li>
              <li>• Input - Inputs con validación</li>
              <li>• Card - Tarjetas reutilizables</li>
              <li>• Modal - Modales accesibles</li>
              <li>• Notifications - Sistema de notificaciones</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Utilidades:</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• stringUtils - Manipulación de texto</li>
              <li>• dateUtils - Formateo de fechas</li>
              <li>• storage - localStorage mejorado</li>
              <li>• arrayUtils - Operaciones de arrays</li>
              <li>• validationUtils - Validaciones comunes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Constantes:</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• API_ENDPOINTS - URLs centralizadas</li>
              <li>• ERROR_MESSAGES - Mensajes consistentes</li>
              <li>• UI_CONFIG - Configuración de UI</li>
              <li>• VALIDATION_CONFIG - Reglas de validación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}