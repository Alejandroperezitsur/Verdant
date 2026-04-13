# Verdant

**Verdant** es una aplicación de seguimiento de hábitos diseñada para ayudarte a construir rutinas saludables de forma sostenible. Con una interfaz inspirada en la naturaleza y un sistema de "plantas virtuales" que crecen con tu progreso, Verdant convierte el desarrollo de hábitos en una experiencia visual y motivadora.

## Qué es Verdant

Verdant es un rastreador de hábitos que va más allá del simple check diario. Utiliza un sistema de **rachas inteligentes con buffer**, **niveles de riesgo** y **recuperación de rachas** para mantenerte motivado incluso cuando la vida se interpone en tu camino.

### Filosofía
- **Progreso, no perfección**: Un día perdido no reinicia tu progreso
- **Identidad sobre disciplina**: Te ayuda a convertirte en "alguien que..."
- **Sostenibilidad**: Sistema de baja energía para días difíciles

## Qué incluye

### Características principales

- **Sistema de Plantas Vivas**: Cada hábito tiene una planta que crece visualmente según tu racha
- **Rachas Inteligentes con Buffer**: Tienes hasta 4 días de margen antes de perder una racha larga
- **Niveles de Riesgo**: Alertas visuales cuando un hábito está en riesgo de romperse
  - Normal (verde)
  - En riesgo (amarillo) - 2 días sin completar
  - Crítico (naranja) - 3+ días sin completar
- **Sistema de Identidad**: 5 niveles basados en tu consistencia
  - Semilla → Brote → Creciendo → Constante → Imparable
- **Modo de Baja Energía**: Cuando tu consistencia baja, solo muestra 1-2 hábitos esenciales
- **Estadísticas de Momentum**: Puntuación 0-100 basada en consistencia semanal y rachas
- **Mapas de Calor**: Vista de 7 o 14 días de tu progreso
- **Días Perfectos**: Contador de días donde completaste todos los hábitos
- **Insights Semanales**: Análisis de tu mejor día y día más débil
- **Exportar/Importar**: Respalda y restaura tus datos en formato JSON

### Tipos de hábitos soportados

- **Diarios**: Todos los días de la semana
- **Semanales**: Configurable (1-7 veces por semana)

### Iconos disponibles

16 iconos para personalizar tus hábitos: Planta, Corazón, Fuego, Agua, Sol, Luna, Libro, Música, Ejercicio, Mente, Comida, Ahorro, Código, Arte, Viaje, Estrella.

## Qué puedes hacer

### Gestión de hábitos
- Crear nuevos hábitos con nombre, frecuencia e icono personalizado
- Marcar hábitos como completados con un toque
- Eliminar hábitos que ya no necesites
- Ver progreso semanal de cada hábito

### Seguimiento de progreso
- Ver tu puntuación de momentum en tiempo real
- Consultar tu racha actual y total
- Identificar tus días perfectos
- Analizar patrones semanales (mejor/peor día)

### Sistema de recuperación
- **Soft Reset**: Recupera el 70% de tu racha si retomas en 48 horas
- **Retomar manual**: Botón de recuperación para hábitos en riesgo

### Personalización
- Cambiar entre vista de 7 días o 14 días
- Exportar datos para respaldo
- Importar datos desde archivo JSON

## Cómo funciona

### Almacenamiento
- Datos guardados localmente usando **IndexedDB**
- Persistencia entre sesiones
- Migración automática desde localStorage (si existe)

### Cálculo de rachas
1. Cada vez completas un hábito, tu racha aumenta
2. La planta crece visualmente según tu racha (7+ días = brote, 21+ días = planta completa)
3. Si faltas un día, el buffer se consume primero (hasta 4 días de margen)
4. Después del buffer, la racha se considera "rota" pero puedes recuperarla

### Sistema de niveles de riesgo
```
Normal → En riesgo (2 días) → Crítico (3+ días)
  ↓          ↓                      ↓
Todo bien    Alerta amarilla        Alerta naranja + botón de recuperación
```

### Cálculo de Momentum (0-100)
- 50% basado en consistencia semanal
- 30% bonus por rachas largas (máx. 21 días)
- -10/-20 penalización por hábitos en riesgo/críticos

### Modo de baja energía
Se activa automáticamente cuando:
- Consistencia semanal < 40%
- Muestra solo los 2 hábitos más prioritarios
- Oculta el botón de "nuevo hábito" para reducir la carga

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **Radix UI** (componentes de UI)
- **Lucide React** (iconos)
- **idb** (wrapper de IndexedDB)

## Scripts disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Previsualizar build
npm run deploy   # Desplegar a GitHub Pages
```

## Propiedad

**Propiedad de APV Labs** - [soporteapvlabs@gmail.com](mailto:soporteapvlabs@gmail.com)
