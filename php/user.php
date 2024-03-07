<?php

    $data = json_decode(file_get_contents('php://input'), true);

    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "turtle";

    $conn = new mysqli($servername, $username, $password, $db_name);

    $user_id = $data['user_id'];
    $tableName = "user_" . $user_id;

    $sql = "SELECT wpm, accuracy, rawspeed, consistency, time FROM " . $tableName;
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
    }
    else{
        echo json_encode($data);
    }
    $conn->close();

?>
