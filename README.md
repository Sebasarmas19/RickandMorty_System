# Rick and Morty System

Este proyecto es una aplicación web interactiva que consume la API oficial de Rick and Morty. El sistema fue desarrollado cumpliendo estrictamente con los requerimientos técnicos de la Actividad #2, utilizando tecnologías puras (HTML5, CSS3, y Vanilla JavaScript) y garantizando soporte para uso sin conexión (Offline) mediante un Service Worker.

## Funcionamiento del Proyecto

El sistema está dividido en varios módulos ejecutables enteramente en el navegador del cliente:

*   **Autenticación Simulada:** Los flujos de inicio de sesión, registro y recuperación de contraseña se gestionan y guardan localmente utilizando `localStorage`.
*   **Gestión de Personajes y Episodios:** Listados de personajes y episodios extraídos en tiempo real de la API de Rick and Morty (paginados). Permite a los usuarios realizar búsquedas instantáneas, ordenar las tablas ascendentemente y descendentemente, visualizar información detallada y simular la edición de estos datos (almacenando los cambios a nivel local).
*   **Experiencia de Usuario (UX/UI):** Una interfaz de alta calidad estética (Premium) estructurada de manera responsive y adaptable a cualquier dispositivo móvil o de escritorio.
*   **Tematización Dual y Modo Offline:** Implementación nativa con variables CSS de un Modo Claro y Oscuro, además del registro de un Service Worker que permite cachear los recursos estáticos y respuestas de la API para que la aplicación siga funcionando correctamente sin internet.

---

## Uso de Inteligencia Artificial Generativa

Para el desarrollo de este sistema se utilizó la herramienta **Antigravity** impulsada por el modelo **Gemini 3.1 Pro (High)**. 

Se estableció una dinámica de trabajo mediante la cual armé un plan detallado enfocado en garantizar el estricto cumplimiento de los requisitos del proyecto (como evitar cualquier marco de trabajo y garantizar un desarrollo puro). Al mismo tiempo, el agente se encargó del diseño estético, moderno y premium de las interfaces. 

Para este fin, se aprovechó la funcionalidad de **Planning Mode** (Modo Planificación), la cual me permitió evaluar la arquitectura propuesta y tomar decisiones, iterando y debatiendo junto con el agente las diferentes estrategias y opciones disponibles hasta seleccionar la ruta más óptima para construir el sistema.
