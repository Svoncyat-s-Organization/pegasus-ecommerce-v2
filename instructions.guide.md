# 📘 Guía Completa: GitHub Copilot Custom Instructions

## 🎯 Introducción

Las **Custom Instructions** permiten darle a Copilot contexto adicional sobre cómo entender tu proyecto y cómo construir, probar y validar cambios.

---

## 📁 Tipos de Custom Instructions

GitHub Copilot soporta **3 tipos** de instrucciones personalizadas:

### 1. **Repository-wide custom instructions** (Instrucciones para todo el repositorio)
- **Archivo:** `.github/copilot-instructions.md`
- **Aplicación:** Se aplican a TODAS las solicitudes hechas en el contexto del repositorio
- **Uso:** Reglas generales del proyecto

### 2. **Path-specific custom instructions** (Instrucciones específicas por ruta)
- **Archivos:** `.github/instructions/NOMBRE.instructions.md`
- **Aplicación:** Se aplican SOLO a archivos que coincidan con un patrón de ruta específico
- **Uso:** Reglas específicas para backend, frontend, tests, etc.
- **Combinación:** Si hay coincidencia con un archivo Y existe el archivo repository-wide, se usan AMBOS

### 3. **Agent instructions** (Instrucciones para agentes de IA)
- **Archivos:** `AGENTS.md` (pueden estar en cualquier parte del repositorio)
- **Aplicación:** Usados por agentes de IA
- **Precedencia:** El archivo `AGENTS.md` más cercano en el árbol de directorios tiene prioridad
- **Estado:** Soporte fuera de workspace root está DESACTIVADO por defecto

---

## 🛠️ Creando Custom Instructions

### Opción 1: Repository-wide (Recomendado para empezar)

**Paso 1:** Crea el archivo
```bash
.github/copilot-instructions.md
```

**Paso 2:** Escribe instrucciones en lenguaje natural (Markdown)
```markdown
# Pegasus E-commerce Instructions

## Architecture
- Use Package-by-Feature (NOT layers)
- Backend: Spring Boot 4.x + PostgreSQL
- Frontend: React 19 + Vite

## Peru-Specific Rules
- DNI: 8 numeric digits
- Phone: 9 digits starting with 9
- Currency: Use BigDecimal, format as S/ 1,234.56

## Code Standards
- NO emojis in code/comments
- English code, Spanish UI
- Code must compile without errors
```

**Nota:** Los espacios en blanco entre instrucciones se ignoran. Puedes escribir todo en un párrafo, cada línea por separado, o con líneas en blanco para legibilidad.

---

### Opción 2: Path-specific (Para proyectos grandes)

**Paso 1:** Crea el directorio
```bash
.github/instructions/
```

**Paso 2:** Crea archivos con el patrón `NOMBRE.instructions.md`

Ejemplo: `.github/instructions/backend.instructions.md`

**Paso 3:** Agrega **frontmatter** con el parámetro `applyTo`
```markdown
---
applyTo: "pegasus-backend/**/*.java"
---

# Backend Instructions

## Tech Stack
- Spring Boot 4.x
- Java 17, jakarta.* imports

## Repository Pattern
Always use @Query for search:
...
```

#### Sintaxis de Glob Patterns

```yaml
# Todos los archivos en directorio actual
applyTo: "*"

# Todos los archivos en todos los directorios (recursivo)
applyTo: "**"
applyTo: "**/*"

# Todos los archivos .py en directorio actual
applyTo: "*.py"

# Todos los archivos .py recursivamente
applyTo: "**/*.py"

# Archivos .py solo en carpeta src
applyTo: "src/*.py"  # ✅ src/foo.py, src/bar.py
                     # ❌ src/foo/bar.py

# Archivos .py en src recursivamente
applyTo: "src/**/*.py"  # ✅ src/foo.py, src/foo/bar.py

# Múltiples patrones (separados por comas)
applyTo: "**/*.ts,**/*.tsx"

# Todos los archivos Java en pegasus-backend
applyTo: "pegasus-backend/**/*.java"

# Solo controladores
applyTo: "pegasus-backend/**/controller/*.java"
```

#### Excluir Agentes Específicos (Opcional)

```markdown
---
applyTo: "**"
excludeAgent: "code-review"
---
```

**Opciones:**
- `"code-review"`: El archivo NO será usado por Copilot code review
- `"coding-agent"`: El archivo NO será usado por Copilot coding agent

Si NO incluyes `excludeAgent`, ambos agentes usarán las instrucciones.

---

## ✅ Verificando que Funciona

### ¿Cómo saber si Copilot está usando mis instrucciones?

1. Las instrucciones están disponibles **inmediatamente** después de guardar el archivo
2. En **Copilot Chat**, revisa la lista de **Referencias** en la respuesta
3. Si las instrucciones se agregaron al prompt, verás `.github/copilot-instructions.md` listado como referencia
4. Puedes hacer clic en la referencia para abrir el archivo

**Nota:** Las custom instructions NO son visibles en el Chat view o inline chat, pero SÍ aparecen en las referencias.

---

## ⚙️ Habilitar/Deshabilitar Custom Instructions

### Para Copilot Chat (por usuario)

Las custom instructions están **habilitadas por defecto**, pero puedes deshabilitarlas:

**Paso 1:** Abre Settings
- Mac: `Command + ,`
- Windows/Linux: `Ctrl + ,`

**Paso 2:** Busca `instruction file`

**Paso 3:** Marca/desmarca: **"Code Generation: Use Instruction Files"**

### Para Copilot Code Review (a nivel repositorio)

Las custom instructions están **habilitadas por defecto**, pero puedes configurarlas en GitHub.com:

**Paso 1:** Ve a tu repositorio en GitHub

**Paso 2:** Click en **Settings**

**Paso 3:** Sidebar: **Code & automation** → **Copilot** → **Code review**

**Paso 4:** Activa/desactiva: **"Use custom instructions when reviewing pull requests"**

---

## 📝 Prompt Files (Prompts Reutilizables)

**Estado:** En **public preview** (sujeto a cambios)  
**Disponible en:** VS Code, Visual Studio, JetBrains IDEs

### ¿Qué son los Prompt Files?

Archivos Markdown que definen prompts reutilizables con contexto adicional. Puedes tener múltiples prompt files, cada uno con un propósito diferente.

**Formato:** Similar a escribir prompts en Copilot Chat
```markdown
Rewrite #file:x.ts to use async/await
```

### Habilitando Prompt Files

**Paso 1:** Abre Command Palette
- Windows/Linux: `Ctrl + Shift + P`
- Mac: `Command + Shift + P`

**Paso 2:** Escribe "Open Workspace Settings (JSON)"

**Paso 3:** Agrega a `settings.json`:
```json
{
  "chat.promptFiles": true
}
```

Esto habilitará `.github/prompts/` como ubicación para prompt files (se crea automáticamente si no existe).

### Creando Prompt Files

**Paso 1:** Command Palette → "Chat: Create Prompt"

**Paso 2:** Escribe un nombre (sin la extensión `.prompt.md`)
- Puede contener alfanuméricos y espacios
- Debe describir el propósito del prompt

**Paso 3:** Escribe el prompt usando Markdown

**Puedes referenciar otros archivos:**
```markdown
# Review this API
[index](../../web/index.ts)

Or using syntax:
#file:../../web/index.ts

Paths are relative to the prompt file.
```

### Usando Prompt Files

**Paso 1:** En Copilot Chat, click en el ícono **Attach context** (📎)

**Paso 2:** Click en **"Prompt..."** y elige tu prompt file

**Paso 3:** (Opcional) Adjunta archivos adicionales para más contexto

**Paso 4:** (Opcional) Escribe información adicional en el chat

**Paso 5:** Envía el prompt

---

## 📊 APÉNDICE: Límites de Lectura y Optimización

### 🔍 Comportamiento Real de Lectura

Aunque GitHub Copilot tiene una ventana de contexto de 200,000 tokens, **en la práctica lee incrementalmente:**

| Modo | Líneas Leídas | Uso |
|------|---------------|-----|
| **Primera lectura** | ~200 líneas | Por defecto, automático |
| **Con prompt explícito** | ~600 líneas | Cuando necesita más contexto |
| **Con "lee todo"** | Todo el archivo | Requiere prompt específico |

**Impacto:** Si tu archivo tiene >800 líneas, secciones críticas pueden NO ser leídas automáticamente.

### ⚠️ Ejemplo Real: Pegasus E-commerce

**Antes de optimización:**
```
frontend.instructions.md (1,055 líneas)
├─ Líneas 1-200:   Tech Stack, Architecture ✅ Se lee por defecto
├─ Líneas 200-600: UI Guidelines ⚠️ Se lee con repetición
└─ Líneas 800+:    Testing, Logging, Troubleshooting ❌ NUNCA se lee
```

**Resultado:** Copilot generaba código sin seguir patterns de testing/logging porque nunca leía esas secciones.

### ✅ Meta de Optimización

| Estado | Líneas | Lectura |
|--------|--------|---------|
| 🟢 **Óptimo** | ≤600 | Todo el archivo con 1 prompt normal |
| 🟡 **Aceptable** | 600-800 | Requiere prompt |
| 🔴 **Problemático** | >800 | Secciones nunca se leen automáticamente |