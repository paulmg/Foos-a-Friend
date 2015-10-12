<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

$userId = isset($_POST['userId']) ? $_POST['userId'] : '';

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database's table)
$collection = $db->users;

$cursor = $collection->findOne(['id' => $userId]);

//var_dump($cursor);

if ($cursor) {
  // set user to playing
  $newData = ['$set' => ['playing' => true]];
  $collection->update($cursor, $newData);

  echo "User added to game";
} else {
  echo "theres a problem: id " . $userId;
}

?>
