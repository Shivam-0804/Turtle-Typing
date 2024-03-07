<?php
$data = json_decode(file_get_contents('php://input'), true);


    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "turtle";

    $conn = new mysqli($servername, $username, $password, $db_name);

    $email = isset($data['email']) ? $data['email'] : null;
    $password = isset($data['password']) ? $data['password'] : null;
    $username = isset($data['username']) ? $data['username'] : null;


    $sql = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $sql->bind_param("sss", $username, $email, $password);
    $sql->execute();
    // create a table for user
    $q = "call CreateIndividualUserTables()";
    $res = mysqli_query($conn, $q);
    // if($res){
    //     echo "Welcome $username!";
    // }
    $conn->close();

?>