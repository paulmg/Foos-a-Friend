<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

$regId = isset($_POST['regId']) ? $_POST['regId'] : '';

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database's table)
$collection = $db->reminders;

$collection->insert($regId);

echo json_encode(array('regId' => $regId));

?>
