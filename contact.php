<?php
error_reporting(0);
ini_set('display_errors', 0);

try {
    $host = "localhost";
    $dbname = "u387599469_Blazedata";
    $username = "u387599469_Blaze";
    $password = "@R1o2h3it";

    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        header('Location: /#contact');
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $phone = htmlspecialchars($_POST['phone']);
        $inquiry = htmlspecialchars($_POST['inquiry']);
        $message = htmlspecialchars($_POST['message']);

        $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, inquiry_type, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $email, $phone, $inquiry, $message);
        $stmt->execute();
        $stmt->close();
        
        header('Location: /#contact');
        exit;
    }
} catch (Exception $e) {
    header('Location: /#contact');
    exit;
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
header('Location: /#contact');
exit;
?>