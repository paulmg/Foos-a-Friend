<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

$regIds = isset($_POST['regIds']) ? $_POST['regIds'] : '';

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database table)
$collection = $db->match;

// add a record
$match = ['player1' => $regIds[0], 'player2' => $regIds[1], 'player3' => $regIds[2], 'player4' => $regIds[4], 'started' => new MongoDate()];
$collection->insert($match);

$apiKey = $_SESSION['apiKey'];
$gcmURL = $_SESSION['gcmURL'];

$message = "Go Foos!";

$post = [
    'registration_ids' => [$regIds],
    'data' => ["message" => $message]
];

$headers = [
    'Authorization: key=' . $apiKey,
    'Content-Type: application/json'
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $gcmURL);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));

$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'GCM error: ' . curl_error($ch);
}

curl_close($ch);

echo $result;

?>
