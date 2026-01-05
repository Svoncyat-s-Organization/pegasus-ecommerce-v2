# Diseño del Módulo RMA (Devoluciones) - Pegasus E-commerce

**Fecha:** 2026-01-05  
**Versión:** 1.0  
**Migración:** V3__add_rma_module.sql

---

## 📋 Resumen Ejecutivo

El módulo RMA (Return Merchandise Authorization) gestiona el ciclo completo de devoluciones de productos por parte de clientes, desde la solicitud inicial hasta el reembolso final. Está diseñado como un MVP académico con enfoque en:

- ✅ Flujo completo de devoluciones
- ✅ Inspección y aprobación por staff
- ✅ Integración con inventario (restock)
- ✅ Múltiples métodos de reembolso
- ✅ Auditoría completa (historial de estados)
- ✅ Logística inversa (shipments)

---

## 🎯 Casos de Uso Principales

### **Cliente (Storefront):**
1. Solicitar devolución de items de una orden
2. Ver estado de su RMA
3. Recibir notificaciones de cambios de estado
4. Imprimir etiqueta de envío (si aplica)

### **Staff (Backoffice):**
1. Ver lista de RMAs pendientes
2. Aprobar/Rechazar solicitudes
3. Registrar recepción de productos
4. Inspeccionar items devueltos
5. Aprobar restock al inventario
6. Procesar reembolsos
7. Cerrar RMA

---

## 🗄️ Estructura de Tablas

### **1. `rmas` (Tabla Principal)**

**Propósito:** Encabezado de cada devolución. Una RMA puede contener múltiples items devueltos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | bigint | PK, auto-increment |
| `rma_number` | varchar(50) | Identificador único para cliente (ej: RMA-2026-00001) |
| `order_id` | bigint | FK → orders (orden original) |
| `customer_id` | bigint | FK → customers (cliente que devuelve) |
| `status` | rma_status_enum | Estado actual del RMA |
| `reason` | rma_reason_enum | Motivo de devolución |
| `customer_comments` | text | Comentarios del cliente |
| `staff_notes` | text | Notas internas del personal |
| `refund_method` | refund_method_enum | Método de reembolso |
| `refund_amount` | numeric(12,2) | Monto total a reembolsar |
| `restocking_fee` | numeric(12,2) | Cargo por reposición (si aplica) |
| `shipping_cost_refund` | numeric(12,2) | Devolución de costo de envío |
| `approved_by` | bigint | FK → users (quien aprobó) |
| `approved_at` | timestamptz | Fecha de aprobación |
| `received_at` | timestamptz | Fecha de recepción física |
| `refunded_at` | timestamptz | Fecha de reembolso procesado |
| `closed_at` | timestamptz | Fecha de cierre |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última actualización |

**Restricciones:**
- `rma_number` UNIQUE
- Todos los montos ≥ 0

---

### **2. `rma_items` (Items Devueltos)**

**Propósito:** Detalle de cada producto devuelto dentro de una RMA.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | bigint | PK, auto-increment |
| `rma_id` | bigint | FK → rmas |
| `order_item_id` | bigint | FK → order_items (item original de la orden) |
| `variant_id` | bigint | FK → variants (variante devuelta) |
| `quantity` | integer | Cantidad devuelta |
| `item_condition` | item_condition_enum | Condición tras inspección (NULL hasta inspeccionar) |
| `inspection_notes` | text | Notas de inspección |
| `refund_amount` | numeric(12,2) | Monto a reembolsar por este item |
| `restock_approved` | boolean | ¿Se puede revender? (depende de condición) |
| `inspected_by` | bigint | FK → users (inspector) |
| `inspected_at` | timestamptz | Fecha de inspección |
| `created_at` | timestamptz | Fecha de creación |

**Lógica de Negocio:**
- `refund_amount` puede ser < `quantity * unit_price` si item está dañado
- `restock_approved = true` solo si condición permite reventa (UNOPENED, OPENED_UNUSED, USED_LIKE_NEW)

---

### **3. `rma_status_histories` (Historial de Estados)**

**Propósito:** Auditoría completa de cambios de estado. Sigue el patrón de `order_status_histories`.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | bigint | PK, auto-increment |
| `rma_id` | bigint | FK → rmas |
| `status` | rma_status_enum | Estado registrado |
| `comments` | text | Comentarios del cambio |
| `created_by` | bigint | FK → users (quien cambió estado) |
| `created_at` | timestamptz | Fecha del cambio |

**Sin columnas de auditoría** (is_active, updated_at) porque es tabla de historial.

---

## 🔄 Enums del Sistema

### **`rma_status_enum`** (9 estados)

| Estado | Descripción | Actor |
|--------|-------------|-------|
| `PENDING` | Solicitud creada por cliente | Cliente |
| `APPROVED` | Aprobada por staff | Staff |
| `REJECTED` | Rechazada (motivo inválido, fuera de plazo) | Staff |
| `IN_TRANSIT` | Cliente envió paquete de vuelta | Sistema/Staff |
| `RECEIVED` | Warehouse recibió el paquete | Staff |
| `INSPECTING` | Staff inspeccionando items | Staff |
| `REFUNDED` | Reembolso procesado | Staff/Sistema |
| `CLOSED` | Completado (reembolso + restock si aplica) | Staff |
| `CANCELLED` | Cliente canceló solicitud | Cliente/Staff |

**Flujo típico exitoso:**  
`PENDING → APPROVED → IN_TRANSIT → RECEIVED → INSPECTING → REFUNDED → CLOSED`

---

### **`rma_reason_enum`** (8 motivos)

| Motivo | Descripción | Responsable |
|--------|-------------|-------------|
| `DEFECTIVE` | Producto defectuoso | Empresa |
| `WRONG_ITEM` | Enviaron producto incorrecto | Empresa |
| `NOT_AS_DESCRIBED` | No coincide con descripción | Empresa |
| `DAMAGED_SHIPPING` | Dañado durante envío | Empresa/Courier |
| `CHANGED_MIND` | Cliente se arrepintió | Cliente |
| `SIZE_COLOR` | Talla/color incorrecto | Cliente |
| `LATE_DELIVERY` | Llegó demasiado tarde | Empresa/Courier |
| `OTHER` | Otro motivo personalizado | Variable |

**Política sugerida:**
- Empresa responsable → NO restocking_fee, SÍ shipping_cost_refund
- Cliente responsable → SÍ restocking_fee (10-20%), NO shipping_cost_refund

---

### **`item_condition_enum`** (6 condiciones)

| Condición | ¿Restock? | % Reembolso Sugerido |
|-----------|-----------|----------------------|
| `UNOPENED` | ✅ Sí | 100% |
| `OPENED_UNUSED` | ✅ Sí | 100% |
| `USED_LIKE_NEW` | ✅ Sí (descuento) | 90-100% |
| `USED_GOOD` | ⚠️ Depende | 70-90% |
| `DAMAGED` | ❌ No | 0-50% |
| `DEFECTIVE` | ❌ No | 100% (culpa empresa) |

---

### **`refund_method_enum`** (4 métodos)

| Método | Descripción | Caso de Uso |
|--------|-------------|-------------|
| `ORIGINAL_PAYMENT` | Mismo método de pago | Por defecto (tarjeta, efectivo) |
| `BANK_TRANSFER` | Transferencia bancaria | Cliente sin tarjeta activa |
| `STORE_CREDIT` | Crédito para futuras compras | Incentivo para retener cliente |
| `EXCHANGE` | Intercambio por otro producto | Cliente quiere cambiar, no devolver |

---

## 🔗 Relaciones con Otros Módulos

### **📦 Orders Module**
```
orders (1) ────< (N) rmas
    ↓
order_items (1) ────< (N) rma_items
```
- Una orden puede tener múltiples RMAs (cliente devuelve parcialmente varias veces)
- RMA vincula a order_items originales para validar:
  - ✅ Item pertenece a la orden
  - ✅ Cantidad no excede lo comprado
  - ✅ Orden está en estado válido (DELIVERED, no CANCELLED)

---

### **👤 Customers Module**
```
customers (1) ────< (N) rmas
```
- Solo el cliente dueño de la orden puede crear RMA
- Historial de devoluciones por cliente (métricas de confiabilidad)

---

### **📦 Catalog Module**
```
variants (1) ────< (N) rma_items
products (1) ────< (N) rma_items (indirecto)
```
- `rma_items.variant_id` identifica el producto exacto devuelto
- Necesario para actualizar stock al hacer restock

---

### **📊 Inventory Module**
```
rma_items.restock_approved = true
    ↓ Trigger
warehouses/stocks UPDATE (aumentar cantidad)
movements INSERT (operation_type = 'RETURN', reference_table = 'rma_items')
```
**Flujo de Restock:**
1. Staff inspecciona item → marca `item_condition`
2. Si condición permite reventa → `restock_approved = true`
3. Backend crea `movement` con:
   - `operation_type = 'RETURN'`
   - `reference_id = rma_items.id`
   - `reference_table = 'rma_items'`
   - `quantity = +X` (positivo, aumenta stock)
4. Actualiza `stocks.quantity` del warehouse receptor

---

### **🚚 Logistics Module**
```
shipments (N) ────> (1) rmas
```
**Dos tipos de shipments relacionados:**

**A. Envío original (order):**
```sql
shipment_type = 'OUTBOUND'
order_id = X
rma_id = NULL
```

**B. Devolución (return):**
```sql
shipment_type = 'INBOUND'
order_id = NULL  -- o el mismo order_id para referencia
rma_id = Y
shipping_address = warehouse address  -- destino: warehouse
```

**Actualización en V3:**
- `shipments.rma_id` ahora es **NULLABLE** (antes NOT NULL, error)
- FK constraint `shipments_rma_fk` agregado correctamente

---

### **👥 Security Module (Users)**
```
users (1) ────< (N) rmas.approved_by
users (1) ────< (N) rma_items.inspected_by
users (1) ────< (N) rma_status_histories.created_by
```
- Staff aprueba/rechaza RMAs
- Staff inspecciona items devueltos
- Auditoría completa de quién hizo qué

---

## 📊 Índices y Optimización

### **Búsquedas Comunes:**
```sql
-- 1. RMAs por cliente (perfil storefront)
idx_rmas_customer (customer_id)

-- 2. RMAs por orden (detalles de orden)
idx_rmas_order (order_id)

-- 3. RMAs pendientes/en progreso (backoffice dashboard)
idx_rmas_status (status)

-- 4. Buscar por número de RMA
idx_rmas_rma_number (rma_number)

-- 5. RMAs recientes (ordenar por fecha)
idx_rmas_created_at (created_at DESC)

-- 6. Items por RMA
idx_rma_items_rma (rma_id)

-- 7. Validar order_item (evitar duplicados)
idx_rma_items_order_item (order_item_id)

-- 8. Historial de RMA
idx_rma_status_histories_rma (rma_id)
```

---

## 💰 Cálculo de Reembolso

### **Fórmula Final:**
```
refund_amount = (SUM(rma_items.refund_amount)) - restocking_fee + shipping_cost_refund
```

**Ejemplo 1: Producto Defectuoso (Culpa Empresa)**
```
Items devueltos: 1 laptop = S/ 2,500
Motivo: DEFECTIVE
Condición: DEFECTIVE
restocking_fee = S/ 0 (culpa empresa)
shipping_cost_refund = S/ 25 (se devuelve el costo de envío original)
------------------------
refund_amount = 2,500 - 0 + 25 = S/ 2,525
```

**Ejemplo 2: Cliente Cambió de Opinión**
```
Items devueltos: 1 smartphone = S/ 1,200
Motivo: CHANGED_MIND
Condición: OPENED_UNUSED
restocking_fee = S/ 120 (10% penalización)
shipping_cost_refund = S/ 0 (cliente responsable)
------------------------
refund_amount = 1,200 - 120 + 0 = S/ 1,080
```

**Ejemplo 3: Devolución Parcial**
```
Orden original: 3 items = S/ 500 (S/ 150 + S/ 200 + S/ 150)
Devuelve solo: 2 items = S/ 350 (S/ 150 + S/ 200)
Motivo: WRONG_ITEM
Condición: UNOPENED
restocking_fee = S/ 0
shipping_cost_refund = S/ 0 (no hubo costo de envío en orden original)
------------------------
refund_amount = 350 - 0 + 0 = S/ 350
```

---

## 🔒 Validaciones de Negocio (Backend)

### **Al crear RMA:**
1. ✅ Orden existe y pertenece al customer
2. ✅ Orden está en estado válido (≥ DELIVERED, ≠ CANCELLED/REFUNDED)
3. ✅ Items pertenecen a la orden
4. ✅ Cantidad devuelta ≤ cantidad comprada
5. ✅ No exceder ventana de devolución (ej: 30 días desde delivered_at)
6. ✅ No hay RMA pendiente/aprobada para los mismos order_items

### **Al aprobar RMA:**
1. ✅ Solo staff con permiso `rma:approve`
2. ✅ RMA en estado PENDING
3. ✅ Validar motivo (si es DEFECTIVE, requiere evidencia?)

### **Al recibir items:**
1. ✅ RMA en estado IN_TRANSIT
2. ✅ Registrar warehouse receptor
3. ✅ Crear shipment (si aún no existe)

### **Al inspeccionar:**
1. ✅ RMA en estado RECEIVED o INSPECTING
2. ✅ Cada rma_item debe tener:
   - `item_condition` evaluado
   - `inspection_notes` (si está dañado)
   - `restock_approved` decidido

### **Al reembolsar:**
1. ✅ Todos los items inspeccionados
2. ✅ `refund_amount` calculado
3. ✅ `refund_method` definido
4. ✅ Integración con pasarela de pago (mock en MVP)

### **Al cerrar RMA:**
1. ✅ Reembolso procesado (refunded_at != NULL)
2. ✅ Si `restock_approved = true`:
   - Crear movement en inventory
   - Actualizar stocks
3. ✅ Marcar como CLOSED

---

## 📈 Métricas Sugeridas (Dashboard)

### **KPIs Operativos:**
- Total RMAs por estado (PENDING, APPROVED, etc.)
- Tiempo promedio de procesamiento (created_at → closed_at)
- Tasa de aprobación (APPROVED / TOTAL)
- Tasa de restock (restock_approved / total items)

### **KPIs de Negocio:**
- Monto total reembolsado por periodo
- Motivos de devolución más comunes (reason)
- Productos con más devoluciones (variant_id)
- Clientes con más devoluciones (customer_id)

### **KPIs de Calidad:**
- % de items DEFECTIVE vs total
- % de devoluciones por culpa empresa vs cliente
- Condición promedio de items devueltos

---

## 🚀 Próximos Pasos de Implementación

### **Fase 1: Base de Datos ✅ COMPLETADO**
- [x] Migración V3 creada
- [x] Schema reference actualizado (pegasus_v2_db.sql)
- [x] Fix: shipments.rma_id ahora nullable con FK constraint

### **Fase 2: Backend (Java/Spring Boot)**
1. Entities (Rma, RmaItem, RmaStatusHistory)
2. Enums (RmaStatus, RmaReason, ItemCondition, RefundMethod)
3. Repositories (JPA)
4. Services:
   - RmaService (CRUD, estado transitions, cálculos)
   - RmaApprovalService (lógica de aprobación/rechazo)
   - RmaInspectionService (inspección items)
   - RmaRefundService (procesamiento reembolsos)
5. Controllers (REST API)
6. DTOs y Mappers (MapStruct)
7. Validaciones custom (@RmaValid, @OrderItemsValid, etc.)

### **Fase 3: Frontend (React + TypeScript)**
1. **Storefront:**
   - Formulario "Solicitar Devolución" (select items, reason, comments)
   - Lista "Mis Devoluciones" (status tracking)
   - Detalle de RMA (timeline de estados)
2. **Backoffice:**
   - Dashboard de RMAs (filtros por estado, fecha, cliente)
   - Detalle de RMA (aprobar/rechazar, inspeccionar)
   - Formulario de inspección (condition, notes, restock decision)
   - Procesamiento de reembolso

### **Fase 4: Integraciones**
1. Inventory: Auto-restock cuando restock_approved = true
2. Logistics: Generar etiquetas de devolución (shipments INBOUND)
3. Notifications: Emails/WhatsApp en cambios de estado
4. Payment Gateway: Reembolsos (mock en MVP, real en producción)

---

## 🔗 Referencias

- **Migración:** [V3__add_rma_module.sql](../migration/V3__add_rma_module.sql)
- **Schema:** [pegasus_v2_db.sql](../pegasus_v2_db.sql)
- **Convenciones:** [database.instructions.md](../../../../.github/instructions/database.instructions.md)

---

**Última actualización:** 2026-01-05  
**Autor:** Pegasus Development Team
