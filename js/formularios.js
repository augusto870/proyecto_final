// ============================================
// formularios.js - Manejo de Formularios
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

/**
 * Clase ManejadorFormularios
 * Maneja la lógica de validación y envío de formularios
 */
class ManejadorFormularios {
    /**
     * Constructor de la clase
     */
    constructor() {
        this.inicializar();
    }

    /**
     * Inicializa los formularios de la página
     */
    inicializar() {
        const formPresupuesto = document.getElementById('formPresupuesto');
        const formContacto = document.getElementById('formContacto');

        // Usar rutas relativas (sin leading slash) para evitar problemas en hospedajes
        // que sirvan el site desde una subcarpeta o desde plataformas estáticas.
        if (formPresupuesto) {
            this.configurarFormulario(formPresupuesto, 'php/presupuesto.php');
        }

        if (formContacto) {
            this.configurarFormulario(formContacto, 'php/enviar.php');
        }
    }

    /**
     * Configura un formulario específico
     * @param {HTMLFormElement} formulario 
     * @param {string} url 
     */
    configurarFormulario(formulario, url) {
        if (!formulario) {
            return;
        }

        // Event listener para el envío
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            // Si el formulario declara un data-formspree, usar ese endpoint
            const formspreeId = formulario.dataset.formspree;
            if (formspreeId) {
                const fsUrl = `https://formspree.io/f/${formspreeId}`;
                this.manejarEnvio(formulario, fsUrl);
            } else {
                this.manejarEnvio(formulario, url);
            }
        });

        // Configurar contador si hay textarea
        const textarea = formulario.querySelector('textarea');
        if (textarea) {
            this.configurarContador(textarea);
        }
    }

    /**
     * Maneja el envío del formulario
     * @param {HTMLFormElement} formulario 
     * @param {string} url 
     */
    async manejarEnvio(formulario, url) {
        if (!this.validarFormulario(formulario)) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const botonSubmit = formulario.querySelector('button[type="submit"]');
        if (botonSubmit) {
            botonSubmit.disabled = true;
        }

        try {
            // Construir FormData y asegurar _replyto (para Formspree)
            const formData = new FormData(formulario);
            if (!formData.get('_replyto')) {
                const correo = formulario.querySelector('input[name="email"]');
                if (correo && correo.value) formData.set('_replyto', correo.value);
            }

            const respuesta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (respuesta.ok) {
                // Intentar leer JSON (Formspree devuelve JSON si Accept es application/json)
                let cuerpo = null;
                try { cuerpo = await respuesta.json(); } catch (e) { /* ignorar */ }
                // Feedback: usar notificación si está disponible, si no usar alert
                if (window.mostrarNotificacion) {
                    window.mostrarNotificacion('Formulario enviado correctamente', 'exito');
                } else {
                    alert('Formulario enviado correctamente');
                }
                formulario.reset();
                // Hook: ejecutar función global si está definida
                if (typeof window.onFormSent === 'function') {
                    try { window.onFormSent(formulario); } catch (e) { console.error(e); }
                }
            } else if (respuesta.status === 404) {
                // 404 frecuente cuando el host no soporta PHP (p.ej. Netlify)
                const mensaje = 'No se encontró el endpoint en el servidor (404). Verificá que el hosting soporte PHP o configurá un endpoint alternativo.';
                if (window.mostrarNotificacion) {
                    window.mostrarNotificacion(mensaje, 'error', 6000);
                } else {
                    alert(mensaje);
                }
                if (typeof window.onFormError === 'function') {
                    try { window.onFormError(formulario, respuesta); } catch (e) { console.error(e); }
                }
            } else {
                if (window.mostrarNotificacion) {
                    window.mostrarNotificacion('Error al enviar el formulario', 'error');
                } else {
                    alert('Error al enviar el formulario');
                }
                if (typeof window.onFormError === 'function') {
                    try { window.onFormError(formulario, respuesta); } catch (e) { console.error(e); }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (window.mostrarNotificacion) {
                window.mostrarNotificacion('Error al enviar el formulario', 'error');
            } else {
                alert('Error al enviar el formulario');
            }
            if (typeof window.onFormError === 'function') {
                try { window.onFormError(formulario, error); } catch (e) { console.error(e); }
            }
        } finally {
            if (botonSubmit) {
                botonSubmit.disabled = false;
            }
        }
    }

    /**
     * Configura el contador de caracteres
     * @param {HTMLTextAreaElement} textarea 
     */
    configurarContador(textarea) {
        if (!textarea) {
            return;
        }

        const contador = document.getElementById('contador-caracteres');
        if (!contador) {
            return;
        }

        // Actualizar contador inicial
        this.actualizarContador(textarea);

        // Actualizar al escribir
        textarea.addEventListener('input', () => {
            this.actualizarContador(textarea);
        });
    }

    /**
     * Actualiza el contador de caracteres
     * @param {HTMLTextAreaElement} textarea 
     */
    actualizarContador(textarea) {
        if (!textarea) {
            return;
        }

        const contador = document.getElementById('contador-caracteres');
        if (contador) {
            const actual = textarea.value.length;
            const maximo = textarea.getAttribute('maxlength') || 2000;
            contador.textContent = `${actual} / ${maximo} caracteres`;
        }
    }

    /**
     * Valida el formulario completo
     * @param {HTMLFormElement} formulario 
     * @returns {boolean}
     */
    validarFormulario(formulario) {
        if (!formulario) {
            return false;
        }

        const camposRequeridos = formulario.querySelectorAll('[required]');
        let esValido = true;

        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('campo--invalido');
                esValido = false;
            } else {
                campo.classList.remove('campo--invalido');
            }
        });

        return esValido;
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    window.manejadorFormularios = new ManejadorFormularios();
});
