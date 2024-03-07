<?php

    $data = json_decode(file_get_contents('php://input'), true);

    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "turtle";
    
    $conn = new mysqli($servername, $username, $password, $db_name);
    
    $email = isset($data['email']) ? $data['email'] : null;
    $password = isset($data['password']) ? $data['password'] : null;


    $sql = $conn->prepare("SELECT * FROM users where email=? and password=?");
    $sql->bind_param("ss",$email, $password);
    $sql->execute();
    $result = $sql->get_result();

    if ($result->num_rows > 0) {
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
    }
    else{
        echo json_encode("");
    }
    $conn->close();

?>
