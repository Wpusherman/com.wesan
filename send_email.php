<?php
// 注意: 現在お問い合わせフォームは Formspree (contact.html / contact.js) を
// 使用しているため、このスクリプトは未使用です。
// PHP サーバー上で自前送信に切り替える場合に備えてセキュアな実装を残しています。
header('Content-Type: application/json; charset=UTF-8');

$response = ['success' => false, 'message' => ''];

// POST 以外は拒否
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// 入力値の取得（未設定でも警告が出ないよう null 合体演算子を使用）
$name    = trim($_POST["name"] ?? '');
$email   = trim($_POST["_replyto"] ?? '');
$subject = trim($_POST["subject"] ?? '');
$message = trim($_POST["message"] ?? '');

// メールヘッダーインジェクション対策：ヘッダーに入る値から改行を除去
$strip_newlines = static function (string $value): string {
    return str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], '', $value);
};
$name    = $strip_newlines($name);
$email   = $strip_newlines($email);
$subject = $strip_newlines($subject);

// バリデーション（FILTER_SANITIZE_STRING は PHP 8.1 で非推奨のため使用しない）
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
    http_response_code(400);
    $response['message'] = '必須項目が入力されていないか、メールアドレスの形式が正しくありません。';
    echo json_encode($response);
    exit;
}

// 件名が空の場合はデフォルトを設定
if ($subject === '') {
    $subject = '(件名なし)';
}

$to = "contact_form@we-san.com";
$subject_mail = "ウェブサイトからの新しいお問い合わせ: " . $subject;

// 本文を組み立て（本文は mail() の body なのでヘッダー注入リスクは低いが、
// 念のため改行コードを LF に正規化）
$body  = "以下の内容でお問い合わせがありました。\n\n";
$body .= "お名前: " . $name . "\n";
$body .= "メールアドレス: " . $email . "\n";
$body .= "件名: " . $subject . "\n";
$body .= "お問い合わせ内容:\n" . str_replace(["\r\n", "\r"], "\n", $message) . "\n";

// MIME エンコードで件名の文字化けを防止
$encoded_subject = mb_encode_mimeheader($subject_mail, 'UTF-8', 'B', "\r\n");

$headers = "From: admin@we-san.com\r\n"
         . "Reply-To: " . $email . "\r\n"
         . "X-Mailer: PHP/" . phpversion() . "\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "Content-Transfer-Encoding: 8bit";

if (mail($to, $encoded_subject, $body, $headers)) {
    $response['success'] = true;
    $response['message'] = 'Message sent successfully.';
} else {
    http_response_code(500);
    $response['message'] = 'Failed to send message. Server error.';
}

echo json_encode($response);
