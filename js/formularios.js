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

        if (formPresupuesto) {
            this.configurarFormulario(formPresupuesto, '/php/presupuesto.php');
        }

        if (formContacto) {
            this.configurarFormulario(formContacto, '/php/enviar.php');
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
            this.manejarEnvio(formulario, url);
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
            const respuesta = await fetch(url, {
                method: 'POST',
                body: new FormData(formulario)
            });

            if (respuesta.ok) {
                alert('Formulario enviado correctamente');
                formulario.reset();
            } else {
                alert('Error al enviar el formulario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar el formulario');
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
