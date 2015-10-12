<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

$email = isset($_POST['email']) ? $_POST['email'] : '';
$regId = isset($_POST['regId']) ? $_POST['regId'] : '';

//if regId = '' then grab it from db otherwise we already have it
if($regId == '') {
	// connect
	$m = new MongoClient($mongoURI);

	// select a database
	$db = $m->heroku_app33192432;

	// select a collection (analogous to a relational database's table)
	$collection = $db->users;

	$cursor = $collection->find(array('email' => $email));

	$array = iterator_to_array($cursor);

	// get regId from cursor
	$regId = $array['regId'];
}


$apiKey = $_SESSION['apiKey'];
$gcmURL = $_SESSION['gcmURL'];

$message = "Wanna foos, bitch?";

$post = [
          'registration_ids'  => [$regId],
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
