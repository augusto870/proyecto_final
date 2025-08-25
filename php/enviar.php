<?php
/**
 * MANEJADOR DE ENVÍO DE FORMULARIOS
 * Script que procesa los formularios de contacto y presupuesto
 * 
 * @version 1.0
 * @author Tu Nombre
 */

// Configuración básica
$config = [
    'email_destino' => 'tu@email.com',
    'asunto' => 'Nuevo mensaje del sitio web'
];

/**
 * Procesa el envío del formulario
 * @return void
 */
function procesarFormulario() {
    // Configuración
    $config = [
        'destinatario' => 'contacto@aceingenieria.com', // Cambiar por email real
        'asunto_base' => 'Nuevo Mensaje de Contacto - ACE Ingeniería',
        'max_tamano_mensaje' => 2000,
        'tiempo_limite' => 120 // 2 minutos entre envíos
    ];

    // Función para sanitizar y validar datos
    function sanitizarDatos($dato) {
        $dato = trim($dato);
        $dato = stripslashes($dato);
        $dato = htmlspecialchars($dato, ENT_QUOTES, 'UTF-8');
        return $dato;
    }

    // Función para validar email
    function validarEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    // Función para generar respuesta JSON
    function responderJSON($exito, $mensaje, $datos = null) {
        header('Content-Type: application/json');
        echo json_encode([
            'exito' => $exito,
            'mensaje' => $mensaje,
            'datos' => $datos
        ]);
        exit;
    }

    // Verificar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderJSON(false, 'Método no permitido');
    }

    // Obtener y sanitizar datos
    $nombre = sanitizarDatos($_POST['nombre'] ?? '');
    $email = sanitizarDatos($_POST['email'] ?? '');
    $mensaje = sanitizarDatos($_POST['mensaje'] ?? '');
    $asunto_cliente = sanitizarDatos($_POST['asunto'] ?? 'Consulta General');

    // Validaciones
    $errores = [];

    if (empty($nombre)) {
        $errores[] = 'El nombre es obligatorio';
    }

    if (empty($email) || !validarEmail($email)) {
        $errores[] = 'El email es obligatorio y debe ser válido';
    }

    if (empty($mensaje)) {
        $errores[] = 'El mensaje es obligatorio';
    }

    if (strlen($mensaje) > $config['max_tamano_mensaje']) {
        $errores[] = 'El mensaje es demasiado largo (máximo ' . $config['max_tamano_mensaje'] . ' caracteres)';
    }

    // Si hay errores, devolver respuesta
    if (!empty($errores)) {
        responderJSON(false, 'Errores de validación', $errores);
    }

    // Verificar límite de tiempo (protección anti-spam básica)
    session_start();
    $tiempo_actual = time();
    if (isset($_SESSION['ultimo_contacto']) && 
        ($tiempo_actual - $_SESSION['ultimo_contacto']) < $config['tiempo_limite']) {
        responderJSON(false, 'Por favor, espera unos minutos antes de enviar otro mensaje');
    }
    $_SESSION['ultimo_contacto'] = $tiempo_actual;

    // Preparar contenido del email
    $asunto = $config['asunto_base'] . ' - ' . $asunto_cliente;

    $contenido = "NUEVO MENSAJE DE CONTACTO\n";
    $contenido .= "==========================\n\n";
    $contenido .= "DATOS DEL CLIENTE:\n";
    $contenido .= "Nombre: {$nombre}\n";
    $contenido .= "Email: {$email}\n";
    $contenido .= "Asunto: {$asunto_cliente}\n\n";
    $contenido .= "MENSAJE:\n";
    $contenido .= "{$mensaje}\n\n";
    $contenido .= "INFORMACIÓN TÉCNICA:\n";
    $contenido .= "Fecha y hora: " . date('d/m/Y H:i:s') . "\n";
    $contenido .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $contenido .= "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'No disponible') . "\n\n";
    $contenido .= "INSTRUCCIONES:\n";
    $contenido .= "1. Responder al cliente en las próximas 24 horas\n";
    $contenido .= "2. Agregar a la base de datos de contactos\n";
    $contenido .= "3. Seguimiento según el tipo de consulta\n";

    // Cabeceras del email
    $cabeceras = [
        'From: ' . $config['destinatario'],
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
        'X-Contact-Type: ' . $asunto_cliente
    ];

    // Intentar enviar el email
    $email_enviado = @mail(
        $config['destinatario'],
        $asunto,
        $contenido,
        implode("\r\n", $cabeceras)
    );

    if ($email_enviado) {
        // Email enviado exitosamente
        responderJSON(true, 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
    } else {
        // Error al enviar email
        responderJSON(false, 'Error al enviar el mensaje. Por favor, intenta nuevamente o contacta directamente por teléfono.');
    }
}

/**
 * Valida los campos del formulario
 * @param array $datos Datos del formulario
 * @return bool
 */
function validarCampos($datos) {
    // ...existing validation code...
}

// Llamar a la función principal para procesar el formulario
procesarFormulario();
?>
