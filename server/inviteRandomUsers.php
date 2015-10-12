<?php

include('global.php');

$regIds = isset($_POST['regIds']) ? $_POST['regIds'] : '';

$apiKey = $_SESSION['apiKey'];
$gcmURL = $_SESSION['gcmURL'];

$message = "Wanna foos, bitch?";

$post = [
    'registration_ids'  => [$regIds],
    'data'              => ["message" => $message]
];

$headers = [
    'Authorization: key=' . $apiKey,
    'Content-Type: application/json'
];

$ch = curl_init();

curl_setopt( $ch, CURLOPT_URL, $gcmURL );
curl_setopt( $ch, CURLOPT_POST, true );
curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $post ) );

$result = curl_exec( $ch );

if ( curl_errno( $ch ) ) {
    echo 'GCM error: ' . curl_error( $ch );
}

curl_close( $ch );

echo $result;

?>
