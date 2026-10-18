# AUREN KA v2.0

Prototipo web instalable con chat, voz del navegador, accesos rápidos y un servidor preparado para conectar una API de IA compatible con Chat Completions.

## Importante antes de usar
- Esta versión **no viene conectada a una IA**. Necesita un proveedor compatible, una clave y un servidor que mantenga esa clave privada.
- GitHub Pages solo publica archivos estáticos; **no puede ejecutar `server.js`**. Para que el chat con IA funcione, hay que desplegar este proyecto completo en un servicio que admita Node.js, o publicar `public/` en un sitio estático y desplegar el servidor por separado.
- Nunca publiques una clave API en el repositorio, en `public/app.js` ni en el navegador.
- El perfil "Kaze" de esta demo solo es un nombre local, **no una verificación de identidad**. La autenticación real del creador requiere una función de servidor, secreto guardado como variable de entorno y una sesión protegida. No se debe confiar en una frase ni en un campo que el usuario rellene en el navegador.
- La voz depende de la compatibilidad del navegador y permisos. No hay palabra de activación en segundo plano.

## Ejecutar localmente
Necesitas Node.js 18 o posterior.

1. Instala Node.js desde https://nodejs.org/
2. Abre una terminal dentro de esta carpeta.
3. Ejecuta `npm install`
4. Configura las variables `AI_API_URL`, `AI_API_KEY` y `AI_MODEL` en el entorno del servidor. No pongas una clave real en `.env` que vayas a subir a GitHub.
5. Ejecuta `npm start`
6. Abre `http://localhost:3000`

## Variables del servidor
- `AI_API_URL`: URL de API compatible con `POST` de chat completions.
- `AI_API_KEY`: clave privada del proveedor.
- `AI_MODEL`: nombre de modelo que admite el proveedor.

El proveedor debe aceptar un cuerpo con `model` y `messages` y devolver `choices[0].message.content`. Algunos proveedores tienen APIs diferentes y requieren adaptar `server.js`.

## Próximos pasos
1. Desplegar el servidor de Node.js.
2. Elegir y configurar proveedor de IA (revisar precios, límites y privacidad).
3. Implementar autenticación segura de creador.
4. Añadir memoria persistente con consentimiento y controles para borrar datos.
5. Probar instalación PWA en Android y accesibilidad.
