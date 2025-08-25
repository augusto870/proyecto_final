<?php
// ============================================
// utilidades.php - Funciones de Utilidad
// ACE Ingeniería & Conectividad
// Hecho por estudiante (demo)
// ============================================

// Incluir configuración
require_once __DIR__ . '/config.php';

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Sanitiza y valida datos de entrada
 */
function sanitizarDatos($dato, $tipo = 'texto') {
    if ($dato === null) return '';
    
    $dato = trim($dato);
    $dato = stripslashes($dato);
    
    switch ($tipo) {
        case 'email':
            return filter_var($dato, FILTER_SANITIZE_EMAIL);
        case 'url':
            return filter_var($dato, FILTER_SANITIZE_URL);
        case 'entero':
            return filter_var($dato, FILTER_SANITIZE_NUMBER_INT);
        case 'decimal':
            return filter_var($dato, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
        case 'texto':
        default:
            return htmlspecialchars($dato, ENT_QUOTES, 'UTF-8');
    }
}

/**
 * Valida formato de email
 */
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valida formato de teléfono
 */
function validarTelefono($telefono) {
    // Permite números, espacios, guiones, paréntesis y +
    return preg_match('/^[\d\s\-\(\)\+]+$/', $telefono);
}

/**
 * Valida formato de URL
 */
function validarURL($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Valida que sea un número entero positivo
 */
function validarEnteroPositivo($numero) {
    return filter_var($numero, FILTER_VALIDATE_INT) !== false && $numero > 0;
}

// ============================================
// FUNCIONES DE RESPUESTA
// ============================================

/**
 * Genera respuesta JSON estándar
 */
function responderJSON($exito, $mensaje, $datos = null, $codigo_http = 200) {
    http_response_code($codigo_http);
    header('Content-Type: application/json; charset=utf-8');
    
    $respuesta = [
        'exito' => $exito,
        'mensaje' => $mensaje,
        'timestamp' => date('Y-m-d H:i:s'),
        'datos' => $datos
    ];
    
    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Genera respuesta de error estándar
 */
function responderError($mensaje, $errores = null, $codigo_http = 400) {
    responderJSON(false, $mensaje, $errores, $codigo_http);
}

/**
 * Genera respuesta de éxito estándar
 */
function responderExito($mensaje, $datos = null, $codigo_http = 200) {
    responderJSON(true, $mensaje, $datos, $codigo_http);
}

// ============================================
// FUNCIONES DE SEGURIDAD
// ============================================

/**
 * Verifica límite de tiempo entre envíos
 */
function verificarLimiteTiempo($tipo, $tiempo_limite = null) {
    if ($tiempo_limite === null) {
        $tiempo_limite = getConfig('limites', $tipo);
    }
    
    session_start();
    $tiempo_actual = time();
    $session_key = "ultimo_{$tipo}";
    
    if (isset($_SESSION[$session_key]) && 
        ($tiempo_actual - $_SESSION[$session_key]) < $tiempo_limite) {
        return false;
    }
    
    $_SESSION[$session_key] = $tiempo_actual;
    return true;
}

/**
 * Genera token CSRF básico
 */
function generarTokenCSRF() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Valida token CSRF
 */
function validarTokenCSRF($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Limpia sesión y regenera ID
 */
function limpiarSesion() {
    session_unset();
    session_destroy();
    session_start();
    session_regenerate_id(true);
}

// ============================================
// FUNCIONES DE EMAIL
// ============================================

/**
 * Prepara cabeceras de email estándar
 */
function prepararCabecerasEmail($from, $reply_to, $tipo = 'texto') {
    $cabeceras = [
        'From: ' . $from,
        'Reply-To: ' . $reply_to,
        'X-Mailer: ACE-Ingenieria-PHP/' . phpversion(),
        'X-Generated: ' . date('Y-m-d H:i:s')
    ];
    
    if ($tipo === 'html') {
        $cabeceras[] = 'Content-Type: text/html; charset=UTF-8';
    } else {
        $cabeceras[] = 'Content-Type: text/plain; charset=UTF-8';
    }
    
    return implode("\r\n", $cabeceras);
}

/**
 * Formatea contenido de email
 */
function formatearEmail($titulo, $contenido, $datos_cliente = []) {
    $email = "{$titulo}\n";
    $email .= str_repeat("=", strlen($titulo)) . "\n\n";
    
    if (!empty($datos_cliente)) {
        $email .= "DATOS DEL CLIENTE:\n";
        foreach ($datos_cliente as $clave => $valor) {
            $email .= ucfirst($clave) . ": {$valor}\n";
        }
        $email .= "\n";
    }
    
    $email .= "{$contenido}\n\n";
    $email .= "INFORMACIÓN TÉCNICA:\n";
    $email .= "Fecha y hora: " . date('d/m/Y H:i:s') . "\n";
    $email .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'No disponible') . "\n";
    $email .= "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'No disponible') . "\n";
    
    return $email;
}

// ============================================
// FUNCIONES DE UTILIDAD GENERAL
// ============================================

/**
 * Genera ID único
 */
function generarID($prefijo = '', $longitud = 8) {
    $id = strtoupper(substr(md5(uniqid()), 0, $longitud));
    return $prefijo ? $prefijo . '-' . $id : $id;
}

/**
 * Formatea número de teléfono
 */
function formatearTelefono($telefono) {
    // Elimina caracteres no numéricos
    $numero = preg_replace('/[^\d]/', '', $telefono);
    
    // Formatea según longitud
    if (strlen($numero) === 10) {
        return substr($numero, 0, 2) . '-' . substr($numero, 2, 4) . '-' . substr($numero, 6);
    } elseif (strlen($numero) === 11) {
        return substr($numero, 0, 2) . '-' . substr($numero, 2, 4) . '-' . substr($numero, 6);
    }
    
    return $telefono; // Retorna original si no coincide con formato esperado
}

/**
 * Formatea fecha
 */
function formatearFecha($fecha, $formato = 'd/m/Y H:i:s') {
    if (is_string($fecha)) {
        $timestamp = strtotime($fecha);
    } else {
        $timestamp = $fecha;
    }
    
    return date($formato, $timestamp);
}

/**
 * Calcula tiempo transcurrido
 */
function tiempoTranscurrido($timestamp) {
    $diferencia = time() - $timestamp;
    
    if ($diferencia < 60) {
        return 'Hace ' . $diferencia . ' segundos';
    } elseif ($diferencia < 3600) {
        $minutos = floor($diferencia / 60);
        return 'Hace ' . $minutos . ' minuto' . ($minutos > 1 ? 's' : '');
    } elseif ($diferencia < 86400) {
        $horas = floor($diferencia / 3600);
        return 'Hace ' . $horas . ' hora' . ($horas > 1 ? 's' : '');
    } else {
        $dias = floor($diferencia / 86400);
        return 'Hace ' . $dias . ' día' . ($dias > 1 ? 's' : '');
    }
}

/**
 * Valida que la petición sea POST
 */
function validarMetodoPOST() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderError('Método no permitido', null, 405);
    }
}

/**
 * Obtiene datos POST de forma segura
 */
function obtenerDatosPOST($campo, $tipo = 'texto', $requerido = false) {
    $valor = $_POST[$campo] ?? '';
    
    if ($requerido && empty($valor)) {
        responderError("El campo '{$campo}' es obligatorio");
    }
    
    return sanitizarDatos($valor, $tipo);
}

// ============================================
// FUNCIONES DE DEBUG Y LOGGING
// ============================================

/**
 * Función de debug (solo en desarrollo)
 */
function debug($dato, $titulo = 'Debug') {
    if (defined('MODO_DESARROLLO') && MODO_DESARROLLO) {
        echo "<pre><strong>{$titulo}:</strong>\n";
        var_dump($dato);
        echo "</pre>";
    }
}

/**
 * Log de actividad con contexto
 */
function logActividadConContexto($tipo, $mensaje, $datos = [], $contexto = '') {
    $datos_log = $datos;
    if ($contexto) {
        $datos_log['contexto'] = $contexto;
    }
    
    logActividad($tipo, $mensaje, $datos_log);
}

/**
 * Verifica estado del sistema
 */
function verificarEstadoSistema() {
    $estado = [
        'php_version' => phpversion(),
        'mail_function' => function_exists('mail'),
        'session_support' => function_exists('session_start'),
        'json_support' => function_exists('json_encode'),
        'timezone' => date_default_timezone_get(),
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time')
    ];
    
    return $estado;
}

// Agregar manejo de errores mejorado
function logError($mensaje, $tipo = 'ERROR', $archivo = null) {
    $fecha = date('Y-m-d H:i:s');
    $log = "[$fecha][$tipo] $mensaje";
    if ($archivo) {
        $log .= " en $archivo";
    }
    error_log($log);
}
?>



