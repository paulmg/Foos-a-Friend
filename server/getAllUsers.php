<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database's table)
$collection = $db->users;

// find everything in the collection
$cursor = $collection->find();

// iterate through the results
// foreach ($cursor as $document) {
//   $userArray;
// }

$array = iterator_to_array($cursor);

echo json_encode($array);

?>
