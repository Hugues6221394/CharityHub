// Load notification count on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationCount();
    setInterval(loadNotificationCount, 60000); // Refresh every minute
});

async function loadNotificationCount() {
    try {
        const response = await fetch('/Notifications/GetUnreadCount');
        const data = await response.json();
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            if (data.count > 0) {
                countElement.textContent = data.count;
                countElement.style.display = 'inline';
            } else {
                countElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading notification count:', error);
    }
}



