<?php

    $data = json_decode(file_get_contents('php://input'), true);

    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "turtle";

    $conn = new mysqli($servername, $username, $password, $db_name);

    $sql = "SELECT notification, message FROM notification";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
    $data = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($data);
    } else {
    echo json_encode("");
    }

?>