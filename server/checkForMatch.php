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

$cursor = $collection->find();

if($cursor) {
    echo 'Match in progress';
} else {
    echo 'No Match in progress';
}

?>