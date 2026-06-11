<?php
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = filter_var(trim($_POST["name"]), FILTER_SANITIZE_STRING);
    $email = filter_var(trim($_POST["_replyto"]), FILTER_SANITIZE_EMAIL);
    $subject_form = filter_var(trim($_POST["subject"]), FILTER_SANITIZE_STRING);
    $message_form = filter_var(trim($_POST["message"]), FILTER_SANITIZE_STRING);

    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message_form)) {
        $response['message'] = '必須項目が入力されていないか、メールアドレスの形式が正しくありません。';
        echo json_encode($response);
        exit;
    }

    $to = "contact_form@we-san.com";
    $subject_mail = "ウェブサイトからの新しいお問い合わせ: " . $subject_form;

    $body = "以下の内容でお問い合わせがありました。\n\n";
    $body .= "お名前: " . $name . "\n";
    $body .= "メールアドレス: " . $email . "\n";
    $body .= "件名: " . $subject_form . "\n";
    $body .= "お問い合わせ内容:\n" . $message_form . "\n";

    $headers = "From: admin@we-san.com" . "\r\n" . 
               "Reply-To: " . $email . "\r\n" .
               "X-Mailer: PHP/" . phpversion() . "\r\n" .
               "Content-Type: text/plain; charset=UTF-8"; 

    if (mail($to, $subject_mail, $body, $headers)) {
        $response['success'] = true;
        $response['message'] = 'Message sent successfully.'; 
    } else {
        $response['message'] = 'Failed to send message. Server error.'; 
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>