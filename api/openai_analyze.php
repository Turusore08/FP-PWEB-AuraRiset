<?php
// --- API: RUN AUTHENTICATED OPENAI RESEARCH GAP COMPILATION ---
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesi habis. Silakan login kembali."]);
    exit;
}

// Helper to load configurations from .env
function get_env_var($key, $default = null) {
    // Check system environment variable first (e.g. passed in Docker run)
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return $val;
    }

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

if (!$openai_key || $openai_key === 'your_openai_api_key_here') {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "API Key OpenAI belum dikonfigurasi di file .env. Harap perbarui kunci Anda."
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read request body
    $data = json_decode(file_get_contents('php://input'), true);
    $topic = trim($data['topic'] ?? '');

    if (empty($topic)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Tema penelitian (topic) tidak boleh kosong."]);
        exit;
    }

    // Prepare system instructions for structured output format
    $system_message = "You are an expert academic research assistant specialized in SOTA (State of the Art) analysis. "
                    . "Your task is to analyze the research topic provided by the user and formulate exactly 3 distinct, realistic comparison items (previous papers) showing the evolution of methods and their research gaps. "
                    . "You must output your response in JSON format containing a top-level key called 'results' which holds an array of 3 objects.\n"
                    . "Each object inside the 'results' array must strictly follow this structure:\n"
                    . "1. 'year': An integer representing publication year (e.g. 2022, 2023, 2024, or 2025).\n"
                    . "2. 'method': A string representing the name of the state-of-the-art methodology used in the paper.\n"
                    . "3. 'gap': A string explaining the research limitation or gap identified (Indonesian language).\n"
                    . "4. 'summary': A string summarizing the OpenAI integrated synthesis (Indonesian language).\n\n"
                    . "Example format:\n"
                    . "{\n"
                    . "  \"results\": [\n"
                    . "    {\n"
                    . "      \"year\": 2023,\n"
                    . "      \"method\": \"Hybrid CNN-LSTM\",\n"
                    . "      \"gap\": \"Kurang efisien dalam mendeteksi objek real-time pada gawai bersumber daya terbatas.\",\n"
                    . "      \"summary\": \"Menggabungkan CNN dan LSTM menghasilkan peningkatan akurasi namun meningkatkan latency komputasi secara signifikan pada edge devices.\"\n"
                    . "    }\n"
                    . "  ]\n"
                    . "}";

    // Set up request payload
    $post_data = [
        "model" => $openai_model,
        "messages" => [
            ["role" => "system", "content" => $system_message],
            ["role" => "user", "content" => "Analisis topik penelitian berikut: " . $topic]
        ],
        "response_format" => ["type" => "json_object"],
        "temperature" => 0.5
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

    // Decode completions response
    $result_data = json_decode($response, true);
    $message_content = $result_data['choices'][0]['message']['content'] ?? '';

    // Parse the inner JSON generated by OpenAI
    $parsed_content = json_decode($message_content, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($parsed_content['results'])) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => "Gagal mengurai respons terstruktur dari model AI.", 
            "raw_response" => $message_content
        ]);
        exit;
    }

    // Success response returning structured gap list
    echo json_encode([
        "status" => "success",
        "topic" => $topic,
        "results" => $parsed_content['results']
    ]);
    exit;

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
}
?>
