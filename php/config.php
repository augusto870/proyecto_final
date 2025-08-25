<?php
// ============================================
// config.php - Configuración del Sistema
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

// Configuración de emails
$config_emails = [
    'contacto' => 'contacto@aceingenieria.com',
    'presupuestos' => 'presupuestos@aceingenieria.com',
    'soporte' => 'soporte@aceingenieria.com',
    'notificaciones' => 'notificaciones@aceingenieria.com'
];

// Configuración de límites
$config_limites = [
    'contacto' => 120,        // 2 minutos entre mensajes
    'presupuesto' => 300,     // 5 minutos entre presupuestos
    'soporte' => 180,         // 3 minutos entre tickets
    'max_mensaje' => 3000,    // Máximo caracteres por mensaje
    'max_descripcion' => 2000 // Máximo caracteres para descripciones
];

// Configuración de la empresa
$config_empresa = [
    'nombre' => 'ACE Ingeniería & Conectividad',
    'telefono' => '+54 11 1234-5678',
    'whatsapp' => '+54 9 11 1234-5678',
    'direccion' => 'Buenos Aires, Argentina',
    'horarios' => 'Lunes a Viernes 9:00 - 18:00',
    'tiempo_respuesta' => '24 horas'
];

// Configuración de seguridad
$config_seguridad = [
    'session_timeout' => 1800,    // 30 minutos
    'max_intentos' => 5,          // Máximo intentos de envío
    'bloqueo_temporal' => 900,    // 15 minutos de bloqueo
    'captcha_required' => false   // Requerir captcha (para implementar después)
];

// Función para obtener configuración
function getConfig($tipo, $clave = null) {
    global $config_emails, $config_limites, $config_empresa, $config_seguridad;
    
    $configs = [
        'emails' => $config_emails,
        'limites' => $config_limites,
        'empresa' => $config_empresa,
        'seguridad' => $config_seguridad
    ];
    
    if (isset($configs[$tipo])) {
        if ($clave === null) {
            return $configs[$tipo];
        }
        return $configs[$tipo][$clave] ?? null;
    }
    
    return null;
}

// Función para validar configuración
function validarConfiguracion() {
    $errores = [];
    
    // Verificar emails
    foreach (getConfig('emails') as $tipo => $email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errores[] = "Email inválido para {$tipo}: {$email}";
        }
    }
    
    // Verificar límites
    foreach (getConfig('limites') as $tipo => $limite) {
        if (!is_numeric($limite) || $limite < 0) {
            $errores[] = "Límite inválido para {$tipo}: {$limite}";
        }
    }
    
    return $errores;
}

// Función para obtener información del sistema
function getInfoSistema() {
    return [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Desconocido',
        'server_time' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get(),
        'mail_function' => function_exists('mail') ? 'Disponible' : 'No disponible'
    ];
}

// Función para logging básico
function logActividad($tipo, $mensaje, $datos = []) {
    $log_file = __DIR__ . '/logs/actividad.log';
    $log_dir = dirname($log_file);
    
    // Crear directorio si no existe
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[{$timestamp}] [{$tipo}] {$mensaje}";
    
    if (!empty($datos)) {
        $log_entry .= " | Datos: " . json_encode($datos);
    }
    
    $log_entry .= "\n";
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

// Función para limpiar logs antiguos
function limpiarLogsAntiguos($dias = 30) {
    $log_file = __DIR__ . '/logs/actividad.log';
    
    if (file_exists($log_file)) {
        $tiempo_limite = time() - ($dias * 24 * 60 * 60);
        
        if (filemtime($log_file) < $tiempo_limite) {
            unlink($log_file);
            logActividad('SISTEMA', 'Logs antiguos eliminados automáticamente');
        }
    }
}

// Configuración de zona horaria
date_default_timezone_set('America/Argentina/Buenos_Aires');

// Configuración de sesiones
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));

// Limpiar logs antiguos (una vez por día)
if (rand(1, 100) === 1) {
    limpiarLogsAntiguos();
}

// Log de inicio del sistema
logActividad('SISTEMA', 'Sistema PHP iniciado', getInfoSistema());
?>



