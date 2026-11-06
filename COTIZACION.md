# Cotización estimada — Zona Astro

**Fecha:** 6 de noviembre de 2026  
**Moneda:** pesos mexicanos (MXN)  
**Vigencia sugerida:** 15 días  
**Tipo de proyecto:** sitio web informativo con catálogo y recepción de preórdenes

## Alcance observado

El proyecto contiene una página de inicio, un menú con tres categorías, carrito y componentes compartidos. El menú obtiene precios, disponibilidad e imágenes de Google Sheets; el carrito se conserva en el navegador y la preorden se envía a un Google Apps Script. Incluye diseño adaptable a móvil, ubicación y horarios.

La cotización contempla una puesta en marcha comercial del alcance actual, con ajustes menores y verificación de la integración. **No es una tienda con pago en línea:** el botón registra una preorden para confirmar por separado. Tampoco hay panel administrativo propio; el catálogo se mantiene en Google Sheets.

## Inversión inicial recomendada

| Concepto | Alcance | Precio |
|---|---|---:|
| Diseño y maquetación adaptable | Inicio, menú, carrito, navegación y pie de página | $6,000 |
| Catálogo y conexión a Google Sheets | Tres categorías, lectura de precios/stock y filtros | $2,500 |
| Carrito y flujo de preorden | Persistencia local, cálculo del resumen y envío a Apps Script | $3,000 |
| Pruebas, publicación y entrega | Verificación funcional, configuración en cuentas del cliente y una ronda de ajustes menores | $2,000 |
| **Total del proyecto** |  | **$13,500 MXN** |

Precios antes de IVA; si corresponde, IVA estimado (16%): **$2,160**. Total estimado con IVA: **$15,660 MXN**. La aplicación de impuestos depende de la situación fiscal de quien facture.

**Plazo sugerido:** 1–2 semanas desde la recepción de textos, imágenes, acceso a las cuentas del cliente y aprobación del alcance. Incluye una ronda de ajustes menores; cambios de alcance se cotizan aparte.

## Planes de mantenimiento mensual

| Plan | Precio mensual | Incluye | Atención |
|---|---:|---|---|
| Esencial | $850 | Revisión mensual del sitio y hasta 1 hora de cambios menores o asistencia con el catálogo | Respuesta en hasta 3 días hábiles |
| Operación | $1,650 | Revisión mensual del flujo de preorden, hasta 3 horas de cambios menores y respaldo de la versión publicada | Respuesta en hasta 2 días hábiles |
| Prioritario | $2,900 | Revisión mensual, hasta 6 horas de soporte/cambios menores y prioridad para incidencias | Respuesta en hasta 1 día hábil |

Las horas incluidas no son acumulables. Trabajo adicional: **$500 MXN/hora**, previa autorización. Los tiempos indicados son de primera respuesta en días hábiles, no una garantía de resolución dentro de ese plazo. Precios mensuales antes de IVA.

## Opcionales para ampliar ingresos

| Mejora | Precio estimado | Observaciones |
|---|---:|---|
| Pago en línea y confirmación de compra | $8,000–$15,000 | Requiere definir proveedor, flujo de pago y tratamiento de pedidos; comisiones del procesador no incluidas |
| Captura de datos de contacto y notificaciones del pedido | $2,000–$4,000 | Requiere acordar los datos a solicitar, canal de notificación y aviso de privacidad |
| Cambios o secciones fuera del mantenimiento | Desde $500/hora | Se cotizan y autorizan antes de iniciar |

## No incluido / condiciones

- Dominio, alojamiento, correo, servicios de terceros y sus renovaciones o comisiones. Se contratan y pagan directamente por el cliente; el alojamiento podría ser gratuito según proveedor y configuración.
- Pago electrónico, inventario sincronizado en tiempo real, panel administrativo, cuentas de clientes, campañas, fotografía, redacción y carga inicial extensa de productos.
- La preorden actual envía artículos y total a un servicio externo; la disponibilidad, operación y permisos de Google Sheets/Apps Script deben confirmarse en las cuentas del cliente antes de publicar.
- El costo de publicación supone que el cliente proporciona los accesos necesarios y conserva la titularidad de sus cuentas. La transferencia/licencia del código y los términos de uso deben quedar definidos en el contrato.
- Los precios son una referencia comercial para un MVP pequeño en Puebla, no un aval de que el proyecto actual esté listo para producción. La publicación debe quedar sujeta a pruebas y aceptación del cliente.

## Base de la estimación

La navegación, las páginas y el catálogo están en [home.html](./home.html), [menu.html](./menu.html) y [carrito.html](./carrito.html). La conexión del catálogo está en [scripts/menu.js](./scripts/menu.js); el carrito y cálculo de preorden en [scripts/carrito.js](./scripts/carrito.js), y el envío a Apps Script en [scripts/enviar_pedido.js](./scripts/enviar_pedido.js). La cotización valora puesta en marcha y soporte de estas funciones; no supone que exista procesamiento de pagos.
