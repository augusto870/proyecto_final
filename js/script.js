// ============================================
// script.js - Funcionalidades Principales
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

/**
 * FUNCIONES PRINCIPALES DEL SITIO
 * Archivo que maneja la interactividad básica del sitio
 */

/**
 * Función para manejar el menú móvil
 * @description Controla la visibilidad del menú en dispositivos móviles
 */
function inicializarNavegacionMovil() {
    const botonMenu = document.querySelector('.nav__boton-movil');
    const menu = document.querySelector('.nav__lista');
    
    if (!botonMenu || !menu) return; // Validación defensiva
    
    // Event listener para abrir/cerrar menú
    botonMenu.addEventListener('click', () => {
        // Alternar clase activa para mostrar/ocultar menú
        menu.classList.toggle('nav__lista--activo');
        botonMenu.classList.toggle('nav__boton--activo');
        
        // Cambiar icono del botón
        const icono = botonMenu.querySelector('i');
        if (icono) {
            if (menu.classList.contains('nav__lista--activo')) {
                icono.className = 'fas fa-times'; // Icono X cuando está abierto
            } else {
                icono.className = 'fas fa-bars'; // Icono hamburguesa cuando está cerrado
            }
        }
    });

    // Cerrar menú al hacer clic en un enlace
    const enlaces = menu.querySelectorAll('a');
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', () => {
            menu.classList.remove('nav__lista--activo');
            botonMenu.classList.remove('nav__boton--activo');
            
            const icono = botonMenu.querySelector('i');
            if (icono) {
                icono.className = 'fas fa-bars';
            }
        });
    });
}

/**
 * Inicializa la navegación móvil
 * Maneja el botón de menú y la visualización en móviles
 */
function inicializarNavegacionMovil() {
    const botonMenu = document.querySelector('.nav__boton-movil');
    const menu = document.querySelector('.nav__lista');
    
    if (!botonMenu || !menu) return;
    
    botonMenu.addEventListener('click', () => {
        menu.classList.toggle('nav__lista--activo');
    });
} // Faltaba esta llave de cierre

// ============================================
// SCROLL SUAVE
// ============================================

/**
 * Función para implementar scroll suave
 * Hace que los enlaces internos se desplacen suavemente
 * 
 * FUNCIONALIDADES:
 * - Intercepta clics en enlaces internos (#seccion)
 * - Aplica scroll suave hacia la sección objetivo
 * - Mejora la experiencia de navegación
 */
function inicializarScrollSuave() {
    // Buscar todos los enlaces que apunten a secciones internas
    const enlaces = document.querySelectorAll('a[href^="#"]');
    
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamiento normal del enlace
            
            const objetivo = enlace.getAttribute('href');
            const elemento = document.querySelector(objetivo);
            
            if (elemento) {
                // Scroll suave hacia el elemento
                elemento.scrollIntoView({
                    behavior: 'smooth', // Animación suave
                    block: 'start' // Alinear con la parte superior de la ventana
                });
            }
        });
    });
}

// ============================================
// ANIMACIONES AL SCROLL
// ============================================

/**
 * Función para animar elementos cuando aparecen en pantalla
 * Utiliza la API Intersection Observer para detectar visibilidad
 * 
 * FUNCIONALIDADES:
 * - Detecta cuando elementos entran en la pantalla
 * - Aplica animaciones automáticamente
 * - Mejora el rendimiento vs scroll events
 */
function inicializarAnimacionesScroll() {
    // Verificar si el navegador soporta Intersection Observer
    if (!('IntersectionObserver' in window)) {
        return; // Salir si no hay soporte
    }

    // Configurar el observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Elemento visible: agregar clase de animación
                entry.target.classList.add('animacion--visible');
            }
        });
    }, {
        threshold: 0.1, // Activar cuando 10% del elemento sea visible
        rootMargin: '0px 0px -50px 0px' // Margen adicional
    });

    // Observar elementos con clase de animación
    const elementosAnimados = document.querySelectorAll('.animacion--entrada');
    elementosAnimados.forEach(elemento => {
        observer.observe(elemento);
    });
}

// ============================================
// VALIDACIÓN DE FORMULARIOS BÁSICA
// ============================================

/**
 * Función para validación básica del lado cliente
 * Esta es una validación simple, la principal está en formularios.js
 * 
 * FUNCIONALIDADES:
 * - Validación básica de campos requeridos
 * - Mensajes de error simples
 * - No reemplaza la validación del servidor
 */
function inicializarValidacionBasica() {
    const formularios = document.querySelectorAll('form');
    
    formularios.forEach(formulario => {
        // Prevenir envío si hay errores
        formulario.addEventListener('submit', (e) => {
            if (!validarFormularioBasico(formulario)) {
                e.preventDefault();
                alert('Por favor completa todos los campos requeridos');
            }
        });

        // Validar campos cuando pierden foco
        const campos = formulario.querySelectorAll('input, textarea, select');
        campos.forEach(campo => {
            campo.addEventListener('blur', () => {
                validarCampo(campo);
            });
        });
    });
}

/**
 * Inicializa la validación básica de todos los formularios
 */
function inicializarValidacionBasica() {
    const formularios = document.querySelectorAll('form');
    
    formularios.forEach(formulario => {
        formulario.addEventListener('submit', (e) => {
            if (!validarFormularioBasico(formulario)) {
                e.preventDefault();
                alert('Por favor completa todos los campos requeridos');
            }
        });

        const campos = formulario.querySelectorAll('input, textarea, select');
        campos.forEach(campo => {
            campo.addEventListener('blur', () => {
                validarCampo(campo);
            });
        });
    });
} // Faltaba esta llave de cierre

/**
 * Validación básica de formularios
 * @description Verifica campos requeridos y muestra errores
 * @param {HTMLFormElement} formulario - El formulario a validar
 * @returns {boolean} - True si es válido, False si no
 * 
 * ESTA FUNCIÓN:
 * - Verifica campos requeridos
 * - Marca campos inválidos visualmente
 * - Retorna resultado de la validación
 */
function validarFormularioBasico(formulario) {
    if (!formulario) return false;
    
    const campos = formulario.querySelectorAll('[required]');
    let esValido = true;

    campos.forEach(campo => {
        if (!validarCampo(campo)) {
            esValido = false;
        }
    });

    return esValido;
}

/**
 * Valida un campo individual
 * @param {HTMLElement} campo - Campo a validar
 * @returns {boolean} - true si es válido, false si no
 */
function validarCampo(campo) {
    if (!campo.value.trim()) {
        campo.classList.add('campo--invalido');
        return false;
    }
    
    if (campo.type === 'email' && !validarEmail(campo.value)) {
        campo.classList.add('campo--invalido');
        return false;
    }

    campo.classList.remove('campo--invalido');
    return true;
} // Faltaba esta llave de cierre

/**
 * Validar formato de email
 */
function validarEmail(email) {
    return email.includes('@') && email.includes('.');
}

// ============================================
// FUNCIONALIDADES ADICIONALES
// ============================================

/**
 * Función para manejar enlaces externos
 * Abre enlaces externos en nueva pestaña
 * 
 * FUNCIONALIDADES:
 * - Detecta enlaces que no son del mismo dominio
 * - Agrega target="_blank" automáticamente
 * - Agrega atributos de seguridad
 */
function inicializarEnlacesExternos() {
    const enlaces = document.querySelectorAll('a[href^="http"]');
    
    enlaces.forEach(enlace => {
        // Solo para enlaces que no sean del mismo dominio
        if (enlace.hostname !== window.location.hostname) {
            enlace.target = '_blank'; // Abrir en nueva pestaña
            enlace.rel = 'noopener noreferrer'; // Seguridad
        }
    });
}

/**
 * Función para mostrar/ocultar botón "Volver arriba"
 * Aparece cuando el usuario hace scroll hacia abajo
 * 
 * FUNCIONALIDADES:
 * - Detecta scroll hacia abajo
 * - Muestra/oculta botón automáticamente
 * - Scroll suave hacia arriba al hacer clic
 */
function inicializarBotonVolverArriba() {
    const boton = document.querySelector('.boton-volver-arriba');
    
    if (boton) {
        // Event listener para detectar scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                boton.classList.add('boton--visible'); // Mostrar botón
            } else {
                boton.classList.remove('boton--visible'); // Ocultar botón
            }
        });

        // Event listener para hacer scroll hacia arriba
        boton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Scroll suave
            });
        });
    }
}

/**
 * Función para manejar el modo oscuro (si se implementa)
 * Cambia entre tema claro y oscuro
 * 
 * FUNCIONALIDADES:
 * - Alternar entre temas
 * - Guardar preferencia en localStorage
 * - Restaurar preferencia al cargar la página
 */
function inicializarModoOscuro() {
    const botonModo = document.querySelector('.boton-modo-oscuro');
    
    if (botonModo) {
        botonModo.addEventListener('click', () => {
            document.body.classList.toggle('modo-oscuro');
            
            // Guardar preferencia en localStorage
            const modoOscuro = document.body.classList.contains('modo-oscuro');
            localStorage.setItem('modoOscuro', modoOscuro);
        });

        // Restaurar preferencia guardada
        const modoOscuroGuardado = localStorage.getItem('modoOscuro');
        if (modoOscuroGuardado === 'true') {
            document.body.classList.add('modo-oscuro');
        }
    }
}

// ============================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ============================================

/**
 * Función principal que inicializa todas las funcionalidades
 * Se ejecuta cuando el DOM esté completamente cargado
 * 
 * ESTA FUNCIÓN:
 * - Inicializa navegación móvil
 * - Configura scroll suave
 * - Activa animaciones al scroll
 * - Configura validación básica
 * - Inicializa funcionalidades adicionales
 */
function inicializarSitio() {
    console.log('🚀 Inicializando funcionalidades del sitio...');
    
    // Inicializar navegación móvil
    inicializarNavegacionMovil();
    console.log('✅ Navegación móvil configurada');
    
    // Inicializar scroll suave
    inicializarScrollSuave();
    console.log('✅ Scroll suave configurado');
    
    // Inicializar animaciones al scroll
    inicializarAnimacionesScroll();
    console.log('✅ Animaciones al scroll configuradas');
    
    // Inicializar validación básica
    inicializarValidacionBasica();
    console.log('✅ Validación básica configurada');
    
    // Inicializar enlaces externos
    inicializarEnlacesExternos();
    console.log('✅ Enlaces externos configurados');
    
    // Inicializar botón volver arriba
    inicializarBotonVolverArriba();
    console.log('✅ Botón volver arriba configurado');
    
    // Inicializar modo oscuro
    inicializarModoOscuro();
    console.log('✅ Modo oscuro configurado');
    
    console.log('🎉 Todas las funcionalidades han sido inicializadas correctamente');
}

// ============================================
// INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
// ============================================

/**
 * Event listener que se ejecuta cuando el DOM está completamente cargado
 * Esto asegura que todos los elementos HTML estén disponibles antes de ejecutar JavaScript
 * 
 * FLUJO DE INICIALIZACIÓN:
 * 1. DOM se carga completamente
 * 2. Se ejecuta inicializarSitio()
 * 3. Se configuran todas las funcionalidades
 * 4. El sitio está listo para usar
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sitio inicializado');
    inicializarNavegacionMovil();
    inicializarValidacionBasica();
});

// ============================================
// FUNCIONES DE UTILIDAD GLOBAL
// ============================================

/**
 * Función para mostrar notificaciones toast
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} tipo - El tipo de notificación (exito, error, info)
 * @param {number} duracion - Duración en milisegundos (por defecto 3000)
 * 
 * ESTA FUNCIÓN:
 * - Crea notificaciones temporales
 * - Se auto-ocultan después del tiempo especificado
 * - Son útiles para feedback del usuario
 */
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion--${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'exito' ? 'check-circle' : tipo === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add('notificacion--visible');
    }, 100);
    
    // Ocultar después del tiempo especificado
    setTimeout(() => {
        notificacion.classList.remove('notificacion--visible');
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, duracion);
}

/**
 * Función para formatear números de teléfono
 * @param {string} telefono - El número de teléfono a formatear
 * @returns {string} - El número formateado
 * 
 * ESTA FUNCIÓN:
 * - Elimina caracteres no numéricos
 * - Aplica formato estándar argentino
 * - Mejora la legibilidad
 */
function formatearTelefono(telefono) {
    // Eliminar caracteres no numéricos
    const numero = telefono.replace(/\D/g, '');
    
    // Aplicar formato según longitud
    if (numero.length === 10) {
        return `${numero.slice(0, 2)}-${numero.slice(2, 6)}-${numero.slice(6)}`;
    } else if (numero.length === 11) {
        return `${numero.slice(0, 2)}-${numero.slice(2, 6)}-${numero.slice(6)}`;
    }
    
    return telefono; // Retornar original si no coincide con formato esperado
}

/**
 * Función para detectar dispositivo móvil
 * @returns {boolean} - True si es móvil, False si no
 * 
 * ESTA FUNCIÓN:
 * - Detecta el tipo de dispositivo
 * - Útil para aplicar funcionalidades específicas
 * - Se basa en el User Agent del navegador
 */
function esDispositivoMovil() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Hacer funciones disponibles globalmente
window.mostrarNotificacion = mostrarNotificacion;
window.formatearTelefono = formatearTelefono;
window.esDispositivoMovil = esDispositivoMovil;
