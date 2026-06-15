<?php
// --- API: CHATBOT COMPLETION FOR SPECIFIC RESEARCH ANALYSIS ---
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesi habis. Silakan login kembali."]);
    exit;
}

// Helper to load configurations from .env
function get_env_var($key, $default = null) {
    static $env = null;
    if ($env === null) {
        $env = [];
        $envPath = __DIR__ . '/../.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $env[trim($name)] = trim($value);
                }
            }
        }
    }
    return $env[$key] ?? $default;
}

$openai_key = get_env_var('OPENAI_API_KEY');
$openai_model = get_env_var('OPENAI_MODEL', 'gpt-4o-mini');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    $topic = trim($data['topic'] ?? '');
    $results = $data['results'] ?? [];
    $message = trim($data['message'] ?? '');
    $chat_history = $data['history'] ?? []; // Array of previous message objects: [['role' => 'user', 'content' => '...']]

    if (empty($topic) || empty($message)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Topic dan pesan chat tidak boleh kosong."]);
        exit;
    }

    // Format SOTA results context for system prompt
    $results_formatted = "";
    if (is_array($results)) {
        foreach ($results as $idx => $res) {
            $year = $res['year'] ?? 'N/A';
            $method = $res['method'] ?? 'N/A';
            $gap = $res['gap'] ?? 'N/A';
            $summary = $res['summary'] ?? 'N/A';
            $results_formatted .= ($idx + 1) . ". Tahun: {$year}, Metode: {$method}, Gap: {$gap}, Ringkasan: {$summary}\n";
        }
    }

    // Prepare system instructions with factual research context
    $system_message = "You are AuraRiset AI, an expert academic chatbot assistant. The user is asking questions about a specific research gap analysis they performed.\n\n"
                    . "RESEARCH CONTEXT:\n"
                    . "- Topic/Theme: \"{$topic}\"\n"
                    . "- State-of-the-Art (SOTA) Gap Analysis results:\n"
                    . "{$results_formatted}\n\n"
                    . "INSTRUCTIONS:\n"
                    . "1. Answer the user's questions about this topic, the methodologies used, and the research gaps found.\n"
                    . "2. Provide academic explanations, suggest improvements, or recommend future research directions based on the SOTA gaps.\n"
                    . "3. Be scholarly, professional, helpful, and concise.\n"
                    . "4. You must speak and reply in the INDONESIAN language.";

    // If key is not configured, trigger a helpful fallback response without dummy models
    if (!$openai_key || $openai_key === 'your_openai_api_key_here') {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "API Key OpenAI belum dikonfigurasi di file .env. Harap perbarui kunci Anda untuk melakukan chat dengan asisten AI."
        ]);
        exit;
    }

    // Build messages array (system prompt + message history + latest user message)
    $messages = [
        ["role" => "system", "content" => $system_message]
    ];
    
    // Add history (up to last 10 messages to keep request small)
    $history_limit = array_slice($chat_history, -10);
    foreach ($history_limit as $msg) {
        $role = $msg['role'] ?? 'user';
        $content = trim($msg['content'] ?? '');
        if ($role && $content) {
            $messages[] = ["role" => $role, "content" => $content];
        }
    }
    
    // Add current message
    $messages[] = ["role" => "user", "content" => $message];

    $post_data = [
        "model" => $openai_model,
        "messages" => $messages,
        "temperature" => 0.7
    ];

    // cURL request to OpenAI
    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openai_key
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30 seconds limit

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal menghubungi API OpenAI (cURL error): " . $curl_error]);
        exit;
    }

    if ($http_code !== 200) {
        $err_details = json_decode($response, true);
        $err_msg = $err_details['error']['message'] ?? 'Respons tidak dikenal dari OpenAI.';
        http_response_code($http_code);
        echo json_encode(["status" => "error", "message" => "OpenAI API Error: " . $err_msg]);
        exit;
    }

    $result_data = json_decode($response, true);
    $reply = $result_data['choices'][0]['message']['content'] ?? '';

    echo json_encode([
        "status" => "success",
        "reply" => $reply
    ]);
    exit;

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
}
?>
