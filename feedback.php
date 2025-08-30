<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Debug authentication
error_log("Auth User: " . ($_SERVER['PHP_AUTH_USER'] ?? 'not set'));
error_log("Auth PW: " . ($_SERVER['PHP_AUTH_PW'] ?? 'not set'));

// Basic authentication
$valid_username = "admin";
$valid_password = "123456";

if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== $valid_username || 
    $_SERVER['PHP_AUTH_PW'] !== $valid_password) {
    header('WWW-Authenticate: Basic realm="Admin Access"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Access Denied - Debug Info: ';
    echo 'Provided Username: ' . ($_SERVER['PHP_AUTH_USER'] ?? 'none') . ', ';
    echo 'Auth Header Present: ' . (isset($_SERVER['HTTP_AUTHORIZATION']) ? 'yes' : 'no');
    exit;
}

try {
    $host = "localhost";
    $dbname = "u387599469_Blazedata";
    $username = "u387599469_Blaze";
    $password = "@R1o2h3it";

    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed");
    }

    // Get total count
    $total_result = $conn->query("SELECT COUNT(*) as count FROM contacts");
    $total = $total_result->fetch_assoc()['count'];

    // Pagination
    $per_page = 10;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $per_page;

    // Get paginated results
    $query = "SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $per_page, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submissions</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #9D1C20;
            text-align: center;
            margin-bottom: 30px;
        }
        .stats {
            margin-bottom: 20px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #9D1C20;
            color: white;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
        .message {
            max-width: 400px;
            position: relative; /* Required for height checking */
        }
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 100px; /* Set initial max height */
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        .message.expanded .message-content {
            max-height: none;
        }
        .expand-btn {
            background: none;
            border: none;
            color: #9D1C20;
            cursor: pointer;
            text-decoration: underline;
            padding: 0;
            margin-top: 5px;
            font-size: 0.9em;
            display: none; /* Hidden by default */
        }
        .inquiry-type {
            text-transform: capitalize;
            color: #9D1C20;
            font-weight: bold;
        }
        .pagination {
            margin-top: 20px;
            text-align: center;
        }
        .pagination a {
            color: #9D1C20;
            padding: 8px 16px;
            text-decoration: none;
            border: 1px solid #9D1C20;
            margin: 0 4px;
        }
        .pagination a.active {
            background-color: #9D1C20;
            color: white;
        }
        .pagination a:hover:not(.active) {
            background-color: #f9f9f9;
        }
        .delete-btn {
            background-color: #ff4444;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
        .delete-btn:hover {
            background-color: #cc0000;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Contact Form Submissions</h1>
        
        <div class="stats">
            <p>Total Submissions: <?= $total ?></p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Inquiry Type</th>
                    <th>Message</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($result->num_rows > 0) {
                    while($row = $result->fetch_assoc()) {
                        $date = date('M d, Y g:i A', strtotime($row['created_at']));
                        $message = htmlspecialchars($row['message']);
                        echo "<tr>";
                        echo "<td class='timestamp'>" . $date . "</td>";
                        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                        echo "<td>Email: " . htmlspecialchars($row['email']) . "<br>Phone: " . htmlspecialchars($row['phone']) . "</td>";
                        echo "<td class='inquiry-type'>" . htmlspecialchars($row['inquiry_type']) . "</td>";
                        echo "<td class='message'>" . 
                             "<div class='message-content'>" . nl2br($message) . "</div>" .
                             "<button class='expand-btn' onclick='toggleMessage(this)'>Show More</button>" .
                             "</td>";
                        echo "<td><button class='delete-btn' onclick='deleteSubmission(" . $row['id'] . ")'>Delete</button></td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='6' style='text-align: center;'>No submissions found</td></tr>";
                }
                ?>
            </tbody>
        </table>

        <?php
        $total_pages = ceil($total / $per_page);
        if ($total_pages > 1):
        ?>
        <div class="pagination">
            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                <a href="?page=<?= $i ?>" <?= $i === $page ? 'class="active"' : '' ?>><?= $i ?></a>
            <?php endfor; ?>
        </div>
        <?php endif; ?>
    </div>

    <script>
    // Function to check if content needs "Show More" button
    function checkMessageLength() {
        const messages = document.querySelectorAll('.message-content');
        
        messages.forEach(content => {
            const expandBtn = content.parentElement.querySelector('.expand-btn');
            
            // Check if content height exceeds the max-height
            if (content.scrollHeight > content.clientHeight) {
                expandBtn.style.display = 'block';
            } else {
                expandBtn.style.display = 'none';
            }
        });
    }

    function toggleMessage(button) {
        const messageCell = button.parentElement;
        const messageContent = messageCell.querySelector('.message-content');
        
        if (messageCell.classList.contains('expanded')) {
            messageCell.classList.remove('expanded');
            button.textContent = 'Show More';
        } else {
            messageCell.classList.add('expanded');
            button.textContent = 'Show Less';
        }
    }

    // Run on page load
    document.addEventListener('DOMContentLoaded', checkMessageLength);

    // Run on window resize
    window.addEventListener('resize', checkMessageLength);

    function deleteSubmission(id) {
        if (!confirm('Are you sure you want to delete this submission?')) {
            return;
        }
        
        const row = event.target.closest('tr');
        if (!row) return;
        
        // Add loading state
        const deleteBtn = event.target;
        const originalText = deleteBtn.textContent;
        deleteBtn.textContent = 'Deleting...';
        deleteBtn.disabled = true;

        fetch('delete_submission.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Animate row removal
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100%)';
                
                setTimeout(() => {
                    row.remove();
                    
                    // Update total count
                    const statsElement = document.querySelector('.stats p');
                    if (statsElement) {
                        const currentTotal = parseInt(statsElement.textContent.match(/\d+/)[0]);
                        statsElement.textContent = `Total Submissions: ${currentTotal - 1}`;
                    }
                    
                    // If no more rows, show "No submissions found"
                    const tbody = document.querySelector('tbody');
                    if (tbody.children.length === 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = '<td colspan="6" style="text-align: center;">No submissions found</td>';
                        tbody.appendChild(noDataRow);
                    }
                }, 300);
            } else {
                throw new Error(data.message || 'Failed to delete submission');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
            // Reset button state
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
        });
    }
    </script>
</body>
</html>

<?php
} catch (Exception $e) {
    echo "An error occurred.";
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>