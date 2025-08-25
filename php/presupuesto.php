<?php
// ============================================
// presupuesto.php - Sistema de Presupuestos
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

// Configuración
$config = [
    'destinatario' => 'presupuestos@aceingenieria.com', // Cambiar por email real
    'asunto_base' => 'Nueva Solicitud de Presupuesto - ACE Ingeniería',
    'max_tamano_mensaje' => 2000,
    'tiempo_limite' => 300 // 5 minutos entre envíos
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
    // Permite números, espacios, guiones y paréntesis
    return preg_match('/^[\d\s\-\(\)\+]+$/', $telefono);
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
$servicio = sanitizarDatos($_POST['servicio'] ?? '');
$descripcion = sanitizarDatos($_POST['descripcion'] ?? '');
$urgencia = sanitizarDatos($_POST['urgencia'] ?? 'normal');
$presupuesto_estimado = sanitizarDatos($_POST['presupuesto_estimado'] ?? '');

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

if (empty($servicio)) {
    $errores[] = 'Debe seleccionar un servicio';
}

if (empty($descripcion)) {
    $errores[] = 'La descripción del proyecto es obligatoria';
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
if (isset($_SESSION['ultimo_presupuesto']) && 
    ($tiempo_actual - $_SESSION['ultimo_presupuesto']) < $config['tiempo_limite']) {
    responderJSON(false, 'Por favor, espera unos minutos antes de enviar otra solicitud');
}
$_SESSION['ultimo_presupuesto'] = $tiempo_actual;

// Preparar contenido del email
$asunto = $config['asunto_base'] . ' - ' . ucfirst($servicio);

$contenido = "NUEVA SOLICITUD DE PRESUPUESTO\n";
$contenido .= "================================\n\n";
$contenido .= "DATOS DEL CLIENTE:\n";
$contenido .= "Nombre: {$nombre}\n";
$contenido .= "Email: {$email}\n";
$contenido .= "Teléfono: {$telefono}\n";
$contenido .= "Empresa: " . ($empresa ?: 'No especificada') . "\n\n";
$contenido .= "DETALLES DEL SERVICIO:\n";
$contenido .= "Servicio solicitado: {$servicio}\n";
$contenido .= "Nivel de urgencia: " . ucfirst($urgencia) . "\n";
$contenido .= "Presupuesto estimado: " . ($presupuesto_estimado ?: 'No especificado') . "\n\n";
$contenido .= "DESCRIPCIÓN DEL PROYECTO:\n";
$contenido .= "{$descripcion}\n\n";
$contenido .= "FECHA Y HORA: " . date('d/m/Y H:i:s') . "\n";
$contenido .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Cabeceras del email
$cabeceras = [
    'From: ' . $config['destinatario'],
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
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
    responderJSON(true, 'Solicitud de presupuesto enviada correctamente. Nos pondremos en contacto contigo pronto.');
} else {
    // Error al enviar email
    responderJSON(false, 'Error al enviar la solicitud. Por favor, intenta nuevamente o contacta directamente por teléfono.');
}
?>



