<?php
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);

$servername = "localhost";
$username = "root";
$password = "";
$db_name = "turtle";

// Create connection
$conn = new mysqli($servername, $username, $password, $db_name);
if (isset($data['user_id'])) {
    $user_id = $data['user_id'];
    $text = $data['advice'];
    $rating = isset($data['rating']) ? $data['rating'] : null;

    if ($rating !== null) {
        $sql = $conn->prepare("INSERT INTO feedback (user_id, advice, rating) VALUES (?, ?, ?)");
        $sql->bind_param("ssi", $user_id, $text, $rating);
    } else {
        $sql = $conn->prepare("INSERT INTO complain (user_id, problem) VALUES (?, ?)");
        $sql->bind_param("ss", $user_id, $text);
    }

    if ($sql->execute()) {
        if ($rating !== null) {
            echo "Feedback submitted Successfully!";
        } else {
            echo "Complaint submitted Successfully!";
        }
    } else {
        echo "Error: " . $sql->error;
    }

    $sql->close();
}

$conn->close();
?>
