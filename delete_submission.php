<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Basic authentication
$valid_username = "admin";
$valid_password = "123456";

if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== $valid_username || 
    $_SERVER['PHP_AUTH_PW'] !== $valid_password) {
    header('WWW-Authenticate: Basic realm="Admin Access"');
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $host = "localhost";
    $dbname = "u387599469_Blazedata";
    $username = "u387599469_Blaze";
    $password = "@R1o2h3it";

    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['id']) || !is_numeric($data['id'])) {
        throw new Exception("Invalid ID provided");
    }

    $id = (int)$data['id'];

    // First check if the record exists
    $checkStmt = $conn->prepare("SELECT id FROM contacts WHERE id = ?");
    if (!$checkStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        $checkStmt->close();
        echo json_encode(['success' => false, 'message' => 'Record not found']);
        exit;
    }
    $checkStmt->close();

    // Proceed with deletion
    $deleteStmt = $conn->prepare("DELETE FROM contacts WHERE id = ?");
    if (!$deleteStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $deleteStmt->bind_param("i", $id);
    
    if (!$deleteStmt->execute()) {
        throw new Exception("Execute failed: " . $deleteStmt->error);
    }

    if ($deleteStmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Record deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete record']);
    }

    $deleteStmt->close();

} catch (Exception $e) {
    error_log("Delete submission error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>