# Solución Final: Guardar Usuarios en MySQL

## Problema Identificado
El sistema guardaba usuarios en **localStorage** del frontend, no en la base de datos MySQL.

## Cambios Realizados

### 1. Frontend: Conexión a API
**Archivo:** `lib/api-client.ts` (nuevo)
- Cliente API para conectarse al backend Spring Boot
- URL: `http://localhost:8081/api`

**Archivo:** `lib/auth-context.tsx`
- Modificado para usar la API en lugar del controlador local
- Importa `apiClient` y hace llamadas HTTP al backend

### 2. Backend: Configuración
**Archivo:** `api/src/main/resources/application.properties`
- ✅ `spring.jpa.hibernate.ddl-auto=update` (crea/actualiza tablas automáticamente)
- ✅ Logging SQL habilitado para debugging
- ✅ Conexión a MySQL correctamente configurada

**Archivo:** `api/src/main/java/com/integralearn/api/config/SecurityConfig.java`
- ✅ Rutas `/api/auth/**` permitidas sin autenticación
- ✅ CSRF deshabilitado
- ✅ CORS configurado para `http://localhost:3000`

**Archivo:** `api/src/main/java/com/integralearn/api/config/CorsConfig.java`
- ✅ Origen permitido: `http://localhost:3000`
- ✅ Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS
- ✅ Headers permitidos: todos (`*`)

**Archivo:** `api/src/main/java/com/integralearn/api/service/AuthService.java`
- ✅ Usa `saveAndFlush()` en lugar de `save()` para forzar persistencia inmediata
- ✅ Logging añadido para debugging

## Cómo Probar

### Paso 1: Verificar que la API está corriendo
```bash
cd api
mvn clean spring-boot:run
```

Debes ver:
```
Started ApiApplication in X seconds
```

### Paso 2: Registrar un usuario desde el frontend
1. Abre http://localhost:3000/register
2. Llena el formulario
3. Haz clic en "Crear Cuenta"

### Paso 3: Verificar logs en la consola de Spring Boot
Debes ver:
```
=== RECIBIENDO REGISTRO ===
Email: ...
=== DEBUG: Iniciando registro de usuario ===
DEBUG: Persona guardada con ID: 1
DEBUG: Estudiante guardado con ID: 1
DEBUG: User guardado con ID: 1
=== REGISTRO EXITOSO ===
```

Y las queries SQL:
```
Hibernate: insert into Persona ...
Hibernate: insert into Estudiante ...
Hibernate: insert into users ...
```

### Paso 4: Verificar en MySQL
```sql
USE sistema_roles;
SELECT * FROM persona;
SELECT * FROM estudiante;
SELECT * FROM users;
```

Debes ver los datos recién insertados.

## Estado Actual

✅ **Frontend configurado** para usar la API  
✅ **Backend configurado** para permitir registro  
✅ **Base de datos** configurada correctamente  
✅ **CORS** configurado  
✅ **Logging** habilitado  

## Próximos Pasos

1. Reinicia la aplicación Spring Boot
2. Registra un usuario desde el frontend
3. Verifica los logs para confirmar que se ejecutaron las queries SQL
4. Consulta MySQL para confirmar que los datos están guardados

## Notas Importantes

- La aplicación debe estar corriendo en `http://localhost:8081`
- El frontend Next.js debe estar corriendo en `http://localhost:3000`
- La base de datos `sistema_roles` debe existir en MySQL
- Las tablas se crean automáticamente con `ddl-auto=update`
