<?php
$data = json_decode(file_get_contents('php://input'), true);


    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "turtle";
    $conn = new mysqli($servername, $username, $password, $db_name);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $user_id = $data['user_id'];
    $wpm = (int)$data['wpm'];
    $time = (int)$data['time'];
    $rawSpeed = (int)$data['rawSpeed'];
    $consistency = (int)$data['consistency'];
    $accuracy = (int)$data['accuracy'];

    $tableName = "user_" . $user_id;

    $sql = "INSERT INTO `" . $tableName . "` (wpm, accuracy, rawspeed, consistency, time) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("iiiii", $wpm, $accuracy, $rawSpeed, $consistency, $time);
        $stmt->execute();
        $stmt->close();
    } 

    // Insert best result into leaderboard
    $q = "SELECT wpm, accuracy, rawspeed, consistency, time FROM " . $tableName . " WHERE time=15 OR time=60 ORDER BY wpm DESC, accuracy DESC, rawspeed DESC LIMIT 1";
    $res = mysqli_query($conn, $q);
    $row = mysqli_fetch_array($res);

    $wpm = $row['wpm'];
    $time = $row['time'];
    $rawSpeed = $row['rawspeed'];
    $consistency = $row['consistency'];
    $accuracy = $row['accuracy'];

    $q = "select username from users where user_id=$user_id";
    $res = mysqli_query($conn, $q);
    $row = mysqli_fetch_array($res);

    $user_id_name = $row[0];

    if($wpm != 0){
        $q = "select username from leaderboard where username='$user_id_name'";
        $res = mysqli_query($conn, $q);
        $row = mysqli_fetch_array($res);
        if(!$row){
            $q = "INSERT INTO leaderboard (`username`, `wpm`, `time`, `rawspeed`, `consistency`, `accuracy`) VALUES ('$user_id_name', $wpm, $time, $rawSpeed, $consistency, $accuracy)";
            $res = mysqli_query($conn, $q);
        }
        else{
            $q = "UPDATE leaderboard SET wpm=$wpm, time=$time, rawspeed=$rawSpeed, consistency=$consistency, accuracy=$accuracy WHERE username='$user_id_name'";
            $res = mysqli_query($conn, $q);
        }
    }

    $conn->close();

?>
