# 🏨 Microservicio de Hoteles y Sedes (`hotels-service`)

Microservicio central encargado del **catálogo de hoteles, sedes y establecimientos** de la plataforma de reservas cloud-native. Proporciona administración comercial, políticas de estancia, georreferenciación y control de acceso basado en roles (RBAC).

---

## 📌 Responsabilidades

1. **Catálogo Central de Hoteles:**
   - Nombre, slug amigable, descripción comercial y categoría (1 a 5 estrellas).
   - Dirección física, ciudad, país y coordenadas geográficas (`latitude`, `longitude`).
   - Teléfono y correo de contacto/reservas.
   - Galería de imágenes (URLs).
   - Amenidades y comodidades (WiFi, piscina, spa, gimnasio, restaurante, etc.).

2. **Políticas Operativas:**
   - Horarios de Check-in y Check-out.
   - Políticas de cancelación de reservas.
   - Admisión de mascotas (`petFriendly`).

3. **Control de Acceso Basado en Roles (RBAC):**
   - **Lectura Pública (GUEST / Anónimo):** Búsqueda con filtros multicriterio (ciudad, estrellas, mascotas, texto) y consulta del detalle completo del hotel.
   - **Operaciones Restringidas (HOTEL_ADMIN):** Creación, modificación y desactivación lógica (*soft-delete*) de hoteles.

4. **Desacoplamiento e Integración:**
   - Adopta el patrón **Database per Service** con su propia base de datos PostgreSQL (`hotel_hotels_db`).
   - Consume cabeceras limpias inyectadas por el **API Gateway** (`x-user-id`, `x-user-role`, `x-user-email`) sin necesidad de consultar el microservicio de autenticación.
   - Desbloquea `rooms-service`, `availability-service` y `booking-service` asociando inventario al `hotelId`.

---

## 🚀 Endpoints de la API (`/api/hotels`)

| Método | Endpoint | Acceso (RBAC) | Descripción |
|---|---|---|---|
| `GET` | `/api/hotels` | Público | Listar hoteles con paginación y filtros (`city`, `search`, `stars`, `petFriendly`). |
| `GET` | `/api/hotels/:id` | Público | Obtener detalle completo de un hotel por UUID. |
| `GET` | `/api/hotels/slug/:slug` | Público | Obtener detalle de un hotel por su slug amigable. |
| `GET` | `/api/hotels/admin/my-hotels` | `HOTEL_ADMIN` | Listar los hoteles gestionados por el administrador en sesión. |
| `POST` | `/api/hotels` | `HOTEL_ADMIN` | Crear y registrar un nuevo hotel en la plataforma. |
| `PUT` | `/api/hotels/:id` | `HOTEL_ADMIN` | Actualizar completamente los datos de un hotel. |
| `PATCH` | `/api/hotels/:id` | `HOTEL_ADMIN` | Modificar parcialmente campos de un hotel. |
| `DELETE` | `/api/hotels/:id` | `HOTEL_ADMIN` | Desactivar un hotel (*soft delete*, `isActive: false`). |
| `POST` | `/api/hotels/seed` | Desarrollo | Poblar el catálogo con hoteles de demostración. |

---

## 📖 Documentación Swagger / OpenAPI

Cuando el microservicio está en ejecución, la documentación interactiva Swagger UI está disponible en:
```
http://localhost:3002/api/docs
```
O de manera centralizada a través del API Gateway:
```
http://localhost:3000/docs
```

---

## ⚙️ Variables de Entorno

```env
PORT=3002
NODE_ENV=development

# Base de datos PostgreSQL independiente
DB_HOST=hotels-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=hotel_hotels_db

# Seguridad JWT Compartida
JWT_SECRET=super_secret_jwt_key_hotel_2026_dev
```
