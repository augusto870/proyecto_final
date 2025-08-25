<?php
// ============================================
// soporte.php - Sistema de Tickets de Soporte
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

// Configuración
$config = [
    'destinatario' => 'soporte@aceingenieria.com', // Cambiar por email real
    'asunto_base' => 'Nuevo Ticket de Soporte - ACE Ingeniería',
    'max_tamano_mensaje' => 3000,
    'tiempo_limite' => 180 // 3 minutos entre tickets
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

// Función para validar teléfono
function validarTelefono($telefono) {
    return preg_match('/^[\d\s\-\(\)\+]+$/', $telefono);
}

// Función para generar número de ticket
function generarTicket() {
    return 'TKT-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
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
$telefono = sanitizarDatos($_POST['telefono'] ?? '');
$empresa = sanitizarDatos($_POST['empresa'] ?? '');
$tipo_problema = sanitizarDatos($_POST['tipo_problema'] ?? '');
$prioridad = sanitizarDatos($_POST['prioridad'] ?? 'media');
$equipo_afectado = sanitizarDatos($_POST['equipo_afectado'] ?? '');
$descripcion = sanitizarDatos($_POST['descripcion'] ?? '');
$horario_contacto = sanitizarDatos($_POST['horario_contacto'] ?? '');

// Validaciones
$errores = [];

if (empty($nombre)) {
    $errores[] = 'El nombre es obligatorio';
}

if (empty($email) || !validarEmail($email)) {
    $errores[] = 'El email es obligatorio y debe ser válido';
}

if (empty($telefono) || !validarTelefono($telefono)) {
    $errores[] = 'El teléfono es obligatorio y debe ser válido';
}

if (empty($tipo_problema)) {
    $errores[] = 'Debe seleccionar el tipo de problema';
}

if (empty($descripcion)) {
    $errores[] = 'La descripción del problema es obligatoria';
}

if (strlen($descripcion) > $config['max_tamano_mensaje']) {
    $errores[] = 'La descripción es demasiado larga (máximo ' . $config['max_tamano_mensaje'] . ' caracteres)';
}

// Si hay errores, devolver respuesta
if (!empty($errores)) {
    responderJSON(false, 'Errores de validación', $errores);
}

// Verificar límite de tiempo (protección anti-spam básica)
session_start();
$tiempo_actual = time();
if (isset($_SESSION['ultimo_soporte']) && 
    ($tiempo_actual - $_SESSION['ultimo_soporte']) < $config['tiempo_limite']) {
    responderJSON(false, 'Por favor, espera unos minutos antes de enviar otro ticket de soporte');
}
$_SESSION['ultimo_soporte'] = $tiempo_actual;

// Generar número de ticket
$numero_ticket = generarTicket();

// Preparar contenido del email
$asunto = $config['asunto_base'] . ' - ' . $numero_ticket;

$contenido = "NUEVO TICKET DE SOPORTE TÉCNICO\n";
$contenido .= "==================================\n\n";
$contenido .= "NÚMERO DE TICKET: {$numero_ticket}\n";
$contenido .= "FECHA: " . date('d/m/Y H:i:s') . "\n\n";
$contenido .= "DATOS DEL CLIENTE:\n";
$contenido .= "Nombre: {$nombre}\n";
$contenido .= "Email: {$email}\n";
$contenido .= "Teléfono: {$telefono}\n";
$contenido .= "Empresa: " . ($empresa ?: 'No especificada') . "\n\n";
$contenido .= "DETALLES DEL PROBLEMA:\n";
$contenido .= "Tipo de problema: {$tipo_problema}\n";
$contenido .= "Prioridad: " . ucfirst($prioridad) . "\n";
$contenido .= "Equipo afectado: " . ($equipo_afectado ?: 'No especificado') . "\n";
$contenido .= "Horario preferido de contacto: " . ($horario_contacto ?: 'No especificado') . "\n\n";
$contenido .= "DESCRIPCIÓN DEL PROBLEMA:\n";
$contenido .= "{$descripcion}\n\n";
$contenido .= "INFORMACIÓN TÉCNICA:\n";
$contenido .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
$contenido .= "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'No disponible') . "\n\n";
$contenido .= "INSTRUCCIONES:\n";
$contenido .= "1. Responder al cliente en las próximas 24 horas\n";
$contenido .= "2. Actualizar el estado del ticket\n";
$contenido .= "3. Documentar la solución implementada\n";

// Cabeceras del email
$cabeceras = [
    'From: ' . $config['destinatario'],
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
    'X-Ticket: ' . $numero_ticket
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
    $respuesta = [
        'ticket' => $numero_ticket,
        'mensaje' => 'Ticket de soporte creado correctamente. Número de ticket: ' . $numero_ticket . '. Nos pondremos en contacto contigo pronto.',
        'tiempo_estimado' => '24 horas'
    ];
    responderJSON(true, 'Ticket de soporte creado correctamente', $respuesta);
} else {
    // Error al enviar email
    responderJSON(false, 'Error al crear el ticket. Por favor, intenta nuevamente o contacta directamente por teléfono.');
}
?>



