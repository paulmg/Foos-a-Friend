<?php

include('global.php');
$mongoURI = $_SESSION['mongoURI'];

$regId = isset($_POST['regId']) ? $_POST['regId'] : '';
$firstName = isset($_POST['firstName']) ? $_POST['firstName'] : '';
$lastName = isset($_POST['lastName']) ? $_POST['lastName'] : '';
$nickName = isset($_POST['nickName']) ? $_POST['nickName'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';

// connect
$m = new MongoClient($mongoURI);

// select a database
$db = $m->heroku_app33192432;

// select a collection (analogous to a relational database's table)
$collection = $db->users;

//$emailQuery = array('email' => $email)

//todo: check that the user doesn't already exist
$cursor = $collection->findOne(array('email' => $email));

//var_dump($cursor);

if ($cursor) {
  // update regId?
  //$newData = array('$set' => array('regId' => $regId));
  //$collection->update($cursor, $newData);

  echo "User already in there, dumbass";
} else {
  // create gravatar
  // md5 hash
  $hash = md5( strtolower( trim( $email ) ) );
  $gravatar = "//gravatar.com/avatar/" . $hash;
  $id = uniqid();

  // add a record
  $user = ['id' => $id, 'regId' => $regId, 'firstName' => $firstName, 'lastName' => $lastName, 'nickName' => $nickName, 'email' => $email, 'avatar' => $gravatar, 'wins' => 0, 'loses' => 0, 'gamesPlayed' => 0, 'gamesInitiated' => 0, 'playing' => false];

  $collection->insert($user);

  echo json_encode(array('userId' => $id));
}

?>
