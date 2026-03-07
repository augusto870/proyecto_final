// ============================================
// script.js - Funcionalidades Principales
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

/**
 * FUNCIONES PRINCIPALES DEL SITIO
 * Archivo que maneja la interactividad básica del sitio
 */


/* === navegación móvil ===
   Se utiliza la función `configurarMenuHamburguesa` más abajo, 
   que contiene la lógica completa y accesible para desplegar el
   menú en dispositivos pequeños. Las definiciones anteriores se
   eliminaron para evitar comportamiento errático. */

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
 * Inicializa la validación básica de todos los formularios
 * (se define más abajo para evitar duplicación accidental)
 */

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
}

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
 * Función para habilitar el buscador de la base de conocimientos.
 * Busca texto dentro de tarjetas de categoría, artículos y herramientas,
 * ocultando las que no coincidieron con la consulta.
 */
function inicializarBuscadorBase() {
    const input = document.getElementById('busqueda-input');
    if (!input) return; // no estamos en la página adecuada

    const elementos = document.querySelectorAll('.categoria__card, .articulo__card, .herramienta__card');
    const secciones = [
        {grid: '.articulos__grid', heading: '.articulos__seccion h2'},
        {grid: '.herramientas__grid', heading: '.herramientas__seccion h2'}
    ];

    const mensaje = document.getElementById('busqueda-mensaje');
    const clearBtn = document.getElementById('busqueda-clear');

    // helper para quitar acentos y normalizar texto
    const normalizar = txt => txt
        .normalize('NFD')               // descomponer acentos
        .replace(/\p{Diacritic}/gu, '') // eliminar marcas diacríticas
        .toLowerCase();                 // pasar a minúsculas

    input.addEventListener('input', () => {
        let q = input.value.trim();
        q = normalizar(q);

        // controlar iconos: borrar y lupa
        if (clearBtn) {
            clearBtn.style.display = q ? 'block' : 'none';
        }
        const lupa = document.querySelector('.busqueda__input .fa-search');
        if (lupa) {
            lupa.style.display = q ? 'none' : 'block';
        }

        // eliminar resaltados previos
        elementos.forEach(el => {
            el.querySelectorAll('.busqueda-highlight').forEach(span => {
                span.replaceWith(document.createTextNode(span.textContent));
            });
        });

        elementos.forEach(el => {
            const texto = normalizar(el.textContent);
            const mostrar = q === '' || texto.includes(q);
            el.style.display = mostrar ? '' : 'none';

            // aplicar highlight si se muestra y hay query
            if (mostrar && q) {
                resaltarCoincidencias(el, q);
            }
        });

        // ocultar/mostrar títulos de sección según contenido visible
        secciones.forEach(cfg => {
            const grid = document.querySelector(cfg.grid);
            const header = document.querySelector(cfg.heading);
            if (grid && header) {
                const anyVisible = Array.from(grid.children).some(c => c.style.display !== 'none');
                header.style.display = anyVisible ? '' : 'none';
            }
        });

        // mostrar mensaje si no hay elementos visibles
        if (mensaje) {
            const anyVis = Array.from(elementos).some(el => el.style.display !== 'none');
            mensaje.style.display = anyVis ? 'none' : 'block';
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            input.dispatchEvent(new Event('input'));
            input.focus();
        });
    }
}

/**
 * Añade un <span> con clase de resaltado alrededor de todas las coincidencias
 * dentro del elemento dado.
 *
 * En lugar de usar innerHTML, recorremos los nodos de texto para evitar tocar
 * etiquetas o atributos y así no corromper la estructura HTML.
 */
function resaltarCoincidencias(el, q) {
    const escaped = q.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    // recolectar textos primero (walker evita modificaciones mientras iteramos)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textos = [];
    while (walker.nextNode()) {
        textos.push(walker.currentNode);
    }

    textos.forEach(textNode => {
        const parent = textNode.parentNode;
        const texto = textNode.nodeValue;
        const nuevo = texto.replace(regex, '<span class="busqueda-highlight">$1</span>');
        if (nuevo !== texto) {
            // crear fragmento temporal para interpretar el HTML
            const temp = document.createElement('span');
            temp.innerHTML = nuevo;
            // reemplazar texto original por el contenido enriquecido
            while (temp.firstChild) {
                parent.insertBefore(temp.firstChild, textNode);
            }
            parent.removeChild(textNode);
        }
    });
}


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
    
    // Inicializar menú hamburguesa/navegación móvil
    configurarMenuHamburguesa();
    console.log('✅ Menú móvil configurado');
    
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

    // Resaltar enlace activo y encoger header al hacer scroll
    marcarEnlaceActivo();
    // detectar secciones internas para marcar navegación (scroll spy)
    inicializarSpySecciones();
    inicializarHeaderScroll();
    console.log('✅ Enlaces activos, spy de secciones y scroll del header configurados');

    // buscador de base de conocimientos (si aplica)
    inicializarBuscadorBase();
    console.log('✅ Buscador de base configurado');

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
    inicializarSitio();
});

// Hook por defecto cuando un formulario se envía correctamente
window.onFormSent = function(formulario) {
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion('Gracias — mensaje recibido. Te contactamos pronto.', 'exito', 3500);
    } else {
        alert('Gracias — mensaje recibido.');
    }
};

// Hook por defecto en caso de error
window.onFormError = function(formulario, error) {
    if (window.mostrarNotificacion) {
        window.mostrarNotificacion('No se pudo enviar el formulario. Intentá nuevamente.', 'error', 3500);
    } else {
        alert('Error al enviar el formulario.');
    }
};


// ============================================
// FUNCIONES DE UTILIDAD GLOBAL
// ============================================

/**
 * Marca el enlace de navegación que coincide con la página actual.
 * Añade la clase `active` al <a> correspondiente para resaltar la pestaña.
 */
function marcarEnlaceActivo() {
    const enlaces = document.querySelectorAll('.nav__link');

    // calcular nombre de página actual de forma robusta
    const path = location.pathname;
    const partes = path.split('/');
    let ultimo = partes.pop();
    if (!ultimo) { // ruta terminaba en slash
        ultimo = partes.pop() || '';
    }
    let nombre = (ultimo || 'index.html');
    nombre = nombre.split('?')[0].split('#')[0];

    // también extraer sólo el nombre sin extensión para comparación secundaria
    const nombreBase = nombre.split('.')[0];
    console.log('marcarEnlaceActivo -> nombre:', nombre, 'nombreBase:', nombreBase);

    enlaces.forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        let sinHash = href.split('#')[0].split('?')[0];
        let enlaceBase = sinHash.split('/').pop().split('.')[0];

        // marcar activo si coinciden página o base (sin extensión)
        if (sinHash === nombre || enlaceBase === nombreBase) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });

    actualizarIndicadorHeader();
}

/**
 * Inserta/modifica un pequeño texto en el header con el nombre del enlace activo.
 * Esto asegura que incluso con el menú cerrado (móvil) se note en qué página
 * o sección nos encontramos.
 */
function actualizarIndicadorHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    let indicador = header.querySelector('.header__activo');
    if (!indicador) {
        indicador = document.createElement('span');
        indicador.className = 'header__activo';
        header.appendChild(indicador);
    }
    const enlace = document.querySelector('.nav__link.active');
    indicador.textContent = enlace ? enlace.textContent : '';
}

/**
 * Scroll spy: observa secciones que tienen un id y activa el correspondiente
 * enlace del menú cuyo href termina en "#id". Esto permite que al desplazarse
 * por la página el item del menú se marque claramente.
 */
function inicializarSpySecciones() {
    const secciones = document.querySelectorAll('section[id]');
    if (!secciones.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const enlace = document.querySelector(`.nav__link[href$="#${id}"]`);
                if (enlace) {
                    document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
                    enlace.classList.add('active');
                    actualizarIndicadorHeader();
                }
            }
        });
    }, {
        rootMargin: '0px 0px -50% 0px'
    });
}

/**
 * Reduce el header al hacer scroll hacia abajo y lo restaura al subir.
 * Añade clase `header--scrolled` al <header> cuando scrollY>50.
 */
function inicializarHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });
}

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

/* ==================================================
   Menu Hamburguesa (nuevo)
*/
// aseguramos que no haya overflow residual en body
document.body.style.overflow = '';

/* ==================================================
   - Esta función agrega la lógica para abrir/cerrar
     el menú de navegación en dispositivos móviles.
   - No modifica el DOM más allá de alternar clases
     y atributos ARIA para accesibilidad.
   - Comentarios: mantener simple y robusto.
================================================== */
function configurarMenuHamburguesa() {
    const boton = document.querySelector('.nav__boton-movil');
    const menu = document.querySelector('#navLista');
    const header = document.querySelector('header');

    if (!boton || !menu) return;

    // limpiar cualquier estilo inline que haya quedado en el markup
    menu.style.overflow = '';
    menu.style.overflowY = '';
    menu.style.maxHeight = '';

    // función que cierra el menú
    function cerrarMenu() {
        menu.classList.remove('nav__lista--activo');
        menu.classList.remove('menu-hamburguesa');
        // retirar cualquier inline overflow leftover
        menu.style.overflow = '';
        menu.style.overflowY = '';
        menu.style.maxHeight = '';
        boton.classList.remove('nav__boton--activo');
        boton.setAttribute('aria-expanded', 'false');
        // restore page scrolling
        document.documentElement.classList.remove('menu-abierto');
        document.body.classList.remove('menu-abierto');

        const icono = boton.querySelector('i');
        if (icono) icono.className = 'fas fa-bars';
    }

    function abrirMenu() {
        if (header) {
            menu.style.top = `${header.offsetHeight}px`;
        }

        menu.classList.add('nav__lista--activo');
        menu.classList.add('menu-hamburguesa');
        // CSS toma responsabilidad del overflow interno
        boton.classList.add('nav__boton--activo');
        boton.setAttribute('aria-expanded', 'true');

        // no bloqueamos el scroll del contenido, solo cerramos el menú cuando se detecta un intento de scroll
        document.documentElement.classList.add('menu-abierto');
        document.body.classList.add('menu-abierto');


        const icono = boton.querySelector('i');
        if (icono) icono.className = 'fas fa-times';
    }

    boton.addEventListener('click', () => {
        const abierto = menu.classList.contains('nav__lista--activo');

        if (abierto) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    // cerrar al hacer click en link
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', cerrarMenu);
    });


    // cerrar al usar la rueda del ratón, trackpad o gestos táctiles
    ['wheel','mousewheel','touchmove'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            if (menu.classList.contains('nav__lista--activo')) {
                e.preventDefault();  // evitar que el page scroll se propague
                console.log('evento', evt, 'capturado, evitando scroll y cerrando menú');
                cerrarMenu();
            }
        }, { passive: false, capture: true });
    });

    // cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !boton.contains(e.target)) {
            cerrarMenu();
        }
    });

    // cerrar al cambiar tamaño de pantalla
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            cerrarMenu();
        }
    });

    // evitar scroll con teclado (flechas, espacio, PgUp/PgDn)
    document.addEventListener('keydown', e => {
        const keys = ['ArrowUp','ArrowDown','PageUp','PageDown',' '];
        if (menu.classList.contains('nav__lista--activo') && keys.includes(e.key)) {
            e.preventDefault();
            cerrarMenu();
        }
    });

    // marcar que ya inicializamos para evitar duplicados
    boton.dataset.hamburguesaInit = 'true';
}