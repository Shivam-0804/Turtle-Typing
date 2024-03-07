<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "turtle";

$conn = new mysqli($servername, $username, $password, $dbname);
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }
$sql = "SELECT username, wpm, time, rawspeed, consistency, accuracy FROM leaderboard order by wpm desc";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($data);
} else {
    echo json_encode("");
}

$conn->close();
?>
