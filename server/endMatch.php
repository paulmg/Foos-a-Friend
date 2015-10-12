<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database table)
$collection = $db->match;

$collection->deleteIndexes();

$reminderCollection = $db->reminders;

$reminderCursor = $reminderCollection->find();

$reminderCollection->deleteIndexes();

// check for reminders
if($reminderCursor) {
    $apiKey = $_SESSION['apiKey'];
    $gcmURL = $_SESSION['gcmURL'];

    $message = "Game On!";

    $regIds = iterator_to_array($reminderCursor);

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
}

?>
