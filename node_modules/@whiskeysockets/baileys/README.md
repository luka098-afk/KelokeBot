<div align='center'>Whatsapp Api - Baileys</div>

<div align='center'>

![WhatsApp API](https://iili.io/Fw3Pw7e.jpg)

### Licencia

Este proyecto utiliza la licencia [MIT License](https://github.com/WhiskeySockets/Baileys?tab=readme-ov-file#license), y es una obra derivada de Baileys por Rajeh Taher/WhiskeySockets.

Al utilizar este proyecto, se considera que aceptas los términos de dicha licencia.

## Sobre la Modificación

Este proyecto es el resultado de una **modificación importante de Baileys**, una librería open-source de WhatsApp Web API originalmente escrita en TypeScript y que utilizaba formato ECMAScript Module (ESM).

Esta modificación se centra en crear una versión **completamente basada en JavaScript puro con soporte CommonJS (CJS)**. Con este enfoque, la librería se vuelve **más flexible y fácil de integrar** en diferentes entornos de ejecución Node.js sin necesidad de procesos de transpilación o configuración adicional como `"type": "module"`.

## Instalación

Instalar en package.json:
```json
"dependencies": {
    "baileys": "github:JoseXrl15k/XrlBaileyszzz"
}
```
o instalar en terminal:
```
npm install baileys@github:JoseXrl15k/XrlBaileyszzz
```

Luego importa la función por defecto en tu código:
```ts 
// tipo esm
import makeWASocket from 'baileys'
```

```js
// tipo cjs
const { default: makeWASocket } = require("baileys")
```

### Puntos Clave de la Modificación:

- **Conversión completa de TypeScript a JavaScript**, para simplificar el proceso de desarrollo, depuración y distribución.
- **Uso consistente del formato CommonJS (CJS)** para poder utilizarse en cualquier entorno Node.js, incluyendo proyectos antiguos.
- **Compatible con módulos ESM modernos**, mediante el uso de dynamic import (`await import()`), sin sacrificar la arquitectura principal CJS.
- **Soporte completo para botones interactivos**
- Simplificación de varias estructuras internas como gestión de sesiones, conexiones, catálogo de productos y optimización de formatos de medios.
- Los archivos `proto` (WAProto) han sido compilados estáticamente a JavaScript para evitar dependencias en tiempo de ejecución con parsers `.proto`.

## Información

Este paquete `requiere` Node.js versión **20 o superior** para funcionar.

Este proyecto está explícitamente dirigido a entornos modernos y no soporta versiones antiguas de Node. El soporte siempre seguirá la última versión LTS de Node.js para mantener el rendimiento y compatibilidad con el ecosistema más reciente.

![metadata](https://iili.io/Fw3Zp5P.jpg)

> **Recode Baileys By JoseXrl15k**

[☏ Contacto del Admin ](https://wa.me/51946509137)


> **Copyright © 2024 - 2025 JoseXrl15k**
