let add = document.getElementsByClassName('add')[0];
let create = document.getElementById('create_task');
let main = document.getElementsByClassName('hide_main');
let add_task = document.getElementById('add_task');
let home = document.getElementById('home');
let completed = document.querySelectorAll('.completed');
let deletebtn = document.querySelectorAll('.delete');
let extenddeadlineform = document.getElementById('extend_deadline_form')
let extenddeadlineform_container = document.getElementById('EXTEND')
let themeToggle = document.getElementById('theme_toggle');
let notificationToggle = document.getElementById('notification_toggle');
let notificationContainer = document.getElementById('notification-container');
let notificationMessage = document.getElementById('notification-message');
let dismissNotification = document.getElementById('dismiss-notification');
let menuToggle = document.querySelector('.menu-toggle');
let mobileSidebar = document.querySelector('.mobile-sidebar');
let closeSidebarBtn = document.querySelector('.mobile-sidebar .close-btn');
let sidebarContent = document.querySelector('.mobile-sidebar-content');
let notificationHelpBtn = document.getElementById('notification-help');
let notificationHelpModal = document.getElementById('notification-help-modal');
let closeModalBtn = document.querySelector('.close-modal');
let browserTabs = document.querySelectorAll('.browser-tab');

// Custom notification sounds
const notificationSounds = {
    low: './sounds/notification-low.wav',
    medium: './sounds/notification-medium.wav',
    high: './sounds/notification-high.wav'
};

// Theme switching functionality
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeToggle.textContent = 'light_mode';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'dark_mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Apply saved theme or default to dark
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeToggle.textContent = 'light_mode';
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'dark_mode';
    }
}

// Notification system
function showNotification(message, importance = '1') {
    notificationMessage.textContent = message;
    notificationContainer.classList.remove('hidden');
    
    // Add animation class based on importance
    notificationContainer.classList.remove('priority-low', 'priority-medium', 'priority-high');
    
    let priorityClass;
    switch(importance) {
        case '3':
            priorityClass = 'priority-high';
            break;
        case '2':
            priorityClass = 'priority-medium';
            break;
        default:
            priorityClass = 'priority-low';
    }
    
    notificationContainer.classList.add(priorityClass);
    
    // Play sound if enabled
    if (localStorage.getItem('notification_sound') === 'true') {
        playNotificationSound(importance);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        notificationContainer.classList.add('hidden');
    }, 5000);
    
    // Send system notification if supported and enabled
    if ('Notification' in window && Notification.permission === 'granted' && 
        localStorage.getItem('notifications_enabled') !== 'false') {
        sendSystemNotification(message, importance);
    }
}

function playNotificationSound(importance = '1') {
    let soundUrl;
    
    switch(importance) {
        case '3':
            soundUrl = notificationSounds.high;
            break;
        case '2':
            soundUrl = notificationSounds.medium;
            break;
        default:
            soundUrl = notificationSounds.low;
    }
    
    try {
        const audio = new Audio(soundUrl);
        audio.volume = importance === '3' ? 0.7 : (importance === '2' ? 0.5 : 0.3);
        
        // Use promise to handle play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
            }).catch(e => {
                console.error('Audio play failed:', e);
                
                // Create a temporary button for user interaction if needed
                if (e.name === 'NotAllowedError') {
                    
                    // Create a temporary button that will enable sound
                    if (!document.querySelector('.sound-trigger')) {
                        const soundTrigger = document.createElement('button');
                        soundTrigger.className = 'sound-trigger';
                        soundTrigger.textContent = 'Enable Sound';
                        soundTrigger.style.position = 'fixed';
                        soundTrigger.style.bottom = '10px';
                        soundTrigger.style.right = '10px';
                        soundTrigger.style.zIndex = '9999';
                        soundTrigger.style.padding = '10px';
                        soundTrigger.style.backgroundColor = '#B3A569';
                        soundTrigger.style.color = 'white';
                        soundTrigger.style.border = 'none';
                        soundTrigger.style.borderRadius = '5px';
                        soundTrigger.style.cursor = 'pointer';
                        
                        soundTrigger.addEventListener('click', () => {
                            // Try playing sound again
                            const newAudio = new Audio(soundUrl);
                            newAudio.volume = importance === '3' ? 0.7 : (importance === '2' ? 0.5 : 0.3);
                            newAudio.play().then(() => {
                            }).catch(e => {
                                console.error('Audio still failed after user interaction:', e);
                            });
                            
                            // Remove the button after click
                            document.body.removeChild(soundTrigger);
                        });
                        
                        document.body.appendChild(soundTrigger);
                        
                        // Auto-remove after 10 seconds
                        setTimeout(() => {
                            if (document.body.contains(soundTrigger)) {
                                document.body.removeChild(soundTrigger);
                            }
                        }, 10000);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Send system notification
function sendSystemNotification(message, importance) {
    // Skip if notifications are disabled
    if (localStorage.getItem('notifications_enabled') === 'false') {
        return;
    }
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
        return;
    }
    
    // Check if permission is granted
    if (Notification.permission !== 'granted') {

        // If permission is not denied, we can request it
        if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    // Try sending the notification again
                    sendSystemNotification(message, importance);
                }
            });
        }
        return;
    }
    
    // Format the notification title with time
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = `To-Do List (${formattedTime})`;
    
    // Set notification options
    const options = {
        body: message,
        icon: './logo 32px.png', // Use the existing logo file in the current directory
        badge: './logo 32px.png',
        vibrate: [200, 100, 200], // Vibration pattern for mobile devices
        tag: 'todo-notification', // Tag to replace previous notifications
        requireInteraction: true, // Keep notification visible until user interacts with it
        silent: false // Allow browser to play notification sound
    };
    
    try {
        // Create notification
        const notification = new Notification(title, options);
        
        // Play our custom sound
        if (localStorage.getItem('notification_sound') === 'true') {
            playNotificationSound(importance);
        }
        
        // Close notification after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
        
        // Handle click on notification
        notification.onclick = function() {
            // Focus on window when notification is clicked
            window.focus();
            this.close();
        };
        
        // Handle notification errors
        notification.onerror = function(error) {
            console.error('Notification error:', error);
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        // Fallback to in-app notification only
    }
}

// To update the current time every second
function updateCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();            
    const month = now.getMonth() + 1;         
    const date = now.getDate();               
    const hours = now.getHours();             
    const minutes = now.getMinutes();         
    const seconds = now.getSeconds();   
    const current_date = `${year}-${month}-${date}`;
    const current_time = `${hours}:${minutes}:${seconds}`;
    checkDeadline(`${current_date} ${current_time}`);
    checkNotifications(now);
}

// Check for upcoming task notifications
function checkNotifications(now) {
    // Skip if notifications are disabled
    if (localStorage.getItem('notifications_enabled') === 'false') {
        return;
    }
    
    let tasks = getLocalStorage();
    let foundNotifications = false;
    
    tasks.forEach(task => {
        if (!task.isDeleted && task.task_status !== 'Completed' && task.task_status !== 'Missed') {
            const deadline = new Date(task.deadline);
            const notificationTime = calculateNotificationTime(task);
            
            // If notification time has passed but not yet notified
            if (now >= notificationTime && !task.notified) {
                const timeLeft = getTimeLeft(now, deadline);    
                
                showNotification(`Task "${task.task_name}" is due in ${timeLeft}!`, task.importance);
                task.notified = true;
                foundNotifications = true;
                
                // Update task in localStorage
                const taskIndex = tasks.indexOf(task);
                localStorage.setItem(`task-${taskIndex}`, JSON.stringify(task));
            }
        }
    });
    
    if (!foundNotifications) {
    }
}

// Calculate when to show notification based on user preferences
function calculateNotificationTime(task) {
    const deadline = new Date(task.deadline);
    const notificationTime = new Date(deadline);
    
    // Default to 1 hour before if not specified
    const amount = task.notification_time ? parseInt(task.notification_time) : 1;
    const unit = task.notification_unit || 'hours';
    
    
    switch(unit) {
        case 'minutes':
            notificationTime.setMinutes(notificationTime.getMinutes() - amount);
            break;
        case 'hours':
            notificationTime.setHours(notificationTime.getHours() - amount);
            break;
        case 'days':
            notificationTime.setDate(notificationTime.getDate() - amount);
            break;
        case 'weeks':
            notificationTime.setDate(notificationTime.getDate() - (amount * 7));
            break;
        default:
            // Default to 1 hour before
            notificationTime.setHours(notificationTime.getHours() - 1);
    }
    return notificationTime;
}

// Get human-readable time left
function getTimeLeft(now, deadline) {
    const diff = deadline - now;
    
    // Convert to appropriate units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}

// To check if the deadline of a task has passed
function checkDeadline(current_date_time) {
    let tasks = getLocalStorage();
    tasks.forEach((task, i) => {
        let deadline = task.deadline;
        let task_status = task.task_status;
        if (task_status !== 'Completed') {
            if (new Date(current_date_time) >= new Date(deadline)) {
                task_status = 'Missed';
            }
            if (task_status != task.task_status) {
                task.task_status = task_status;
                localStorage.setItem(`task-${i}`, JSON.stringify(task));
                rendertask();
            }
        }
    })
}
// Update the current time every second
setInterval(updateCurrentTime, 1000);


function getLocalStorage() {
    var i = 0;
    var tasks = [];
    while (localStorage.getItem("task-" + i)) {
        tasks.push(JSON.parse(localStorage.getItem("task-" + i)));
        i++;
    }
    return tasks;
}

// to render all tasks.
function rendertask() {
    tasks = getLocalStorage();
    let ul = document.getElementById('all_task');
    ul.innerHTML = '';
    tasks.forEach((task, i) => { // Here, i is the index of the task
        if (!task.isDeleted) {
            let li = document.createElement('li');
            li.className = `task-${i} hover`;
            li.innerHTML = `<p id="name">${task.task_name}</p>
            <p id="end_date">${task.deadline}</p>
            <p id="status">${task.task_status}</p>
            <p id = ${i} class = "completed  hover_complete material-symbols-outlined" title="Mark as completed">task_alt</p>
            <p id = ${i} class="delete material-symbols-outlined" title="Delete task">delete</p>`
            if (task.importance === '3') {
                li.style.color = '#FF5555'
            }
            else if (task.importance === '2') {
                li.style.color = '#FFA500'
            }
            else {
                li.style.color = '#32CD32'
            }
            ul.append(li);
            if (task.isCompleted) {
                li.style.color = 'grey';
                li.classList.remove('hover');
                document.getElementById(i).classList.remove('hover_complete');
                document.getElementById(i).style.cursor = 'default';
            }
            else if (task.task_status==='Missed') {
                document.getElementById(i).classList.remove('hover_complete');
            }
        }
    });
}

// To render all deleted tasks
function render_deletedtask(){
    tasks = getLocalStorage();
    let ul = document.getElementById('deleted_task');
    ul.innerHTML = '';
    tasks.forEach((task, i) => { // Here, i is the index of the task
        if (task.isDeleted) {
            let li = document.createElement('li');
            li.className = `task-${i} hover`;
            li.innerHTML = `<p id="name">${task.task_name}</p>
            <p id="end_date">${task.deadline}</p>
            <p id="status">${task.task_status}</p>
            <p id ='${i}' class="restore material-symbols-outlined" title="Restore task">restore_from_trash</p>` 
            if (task.importance === '3') {
                li.style.color = '#FF5555'
            }
            else if (task.importance === '2') {
                li.style.color = '#FFA500'
            }
            else {
                li.style.color = '#32CD32'
            }
            ul.append(li);
        }
    });
}


// To render all Missed taks 
function render_missedtask() {
    tasks = getLocalStorage();
    let ul = document.getElementById('missed_task');
    ul.innerHTML = '';
    tasks.forEach((task, i) => { // Here, i is the index of the task
        if (task.task_status === 'Missed' && !task.isDeleted) {
            let li = document.createElement('li');
            li.className = `task-${i} hover`;
            li.innerHTML = `<p id="name">${task.task_name}</p>
            <p id="end_date">${task.deadline}</p>
            <p id="status">${task.task_status}</p>
            <p id = ${i} class="extend_deadline material-symbols-outlined" title="Extend deadline">more_time</p>
            <p id = ${i} class="delete material-symbols-outlined" title="Delete task">delete</p>`
            if (task.importance === '3') {
                li.style.color = '#FF5555'
            }
            else if (task.importance === '2') {
                li.style.color = '#FFA500'
            }
            else {
                li.style.color = '#32CD32'
            }
            ul.append(li);
        }
    });   
}

function render_pendingtask() {
    tasks = getLocalStorage();
    let ul = document.getElementById('pending_task');
    ul.innerHTML = '';
    tasks.forEach((task, i) => { // Here, i is the index of the task
        if (task.task_status === 'Pending' && !task.isDeleted) {
            let li = document.createElement('li');
            li.className = `task-${i} hover`;
            li.innerHTML = `<p id="name">${task.task_name}</p>
            <p id="end_date">${task.deadline}</p>
            <p id="status">${task.task_status}</p>
            <p id = ${i} class="completed  hover_complete material-symbols-outlined">task_alt</p>
            <p id = ${i} class="delete material-symbols-outlined">delete</p>`
            if (task.importance === '3') {
                li.style.color = '#FF5555'
            }
            else if (task.importance === '2') {
                li.style.color = '#FFA500'
            }
            else {
                li.style.color = '#32CD32'
            }
            ul.append(li);
            if (task.isCompleted) {
                li.style.color = 'grey';
                li.classList.remove('hover');
                document.getElementById(i).classList.remove('hover_complete');
                document.getElementById(i).style.cursor = 'default';
            }
            else if (task.task_status==="Missed") {
                document.getElementById(i).classList.remove('hover_complete')
            }
        }
    });
}

function render_completedtask() {
    tasks = getLocalStorage();
    let ul = document.getElementById('completed_task');
    ul.innerHTML = '';
    tasks.forEach((task, i) => { // Here, i is the index of the task
        if (task.task_status === 'Completed' && !task.isDeleted) {
            let li = document.createElement('li');
            li.className = `task-${i} hover`;
            li.innerHTML = `<p id="name">${task.task_name}</p>
            <p id="end_date">${task.deadline}</p>
            <p id="status">${task.task_status}</p>
            <p id = ${i} class="pending material-symbols-outlined" title="Mark as pending">pending</p>
            <p id = ${i} class="delete material-symbols-outlined" title="Delete task">delete</p>`

            if (task.importance === '3') {
                li.style.color = '#FF5555'
            }
            else if (task.importance === '2') {
                li.style.color = '#FFA500'
            }
            else {
                li.style.color = '#32CD32'
            }
            ul.append(li);
        }
    });
}

// Toggle notification permission
function toggleNotificationPermission() {
    if (!('Notification' in window)) {
        showNotification('Notifications are not supported in this browser', '1');
        return;
    }
    
    if (Notification.permission === 'granted') {
        // Can't revoke permission once granted, but we can disable notifications in our app
        const notificationsEnabled = localStorage.getItem('notifications_enabled') !== 'false';
        localStorage.setItem('notifications_enabled', notificationsEnabled ? 'false' : 'true');
        updateNotificationToggleIcon();
        
        showNotification(
            notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled', 
            '2'
        );
    } else if (Notification.permission === 'denied') {
        showNotification('Notification permission was denied. Please enable notifications in your browser settings.', '2');
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                localStorage.setItem('notifications_enabled', 'true');
                updateNotificationToggleIcon();
                showNotification('Notifications enabled!', '2');
            } else {
                localStorage.setItem('notifications_enabled', 'false');
                updateNotificationToggleIcon();
                showNotification('Notification permission denied', '1');
            }
        });
    }
}

// Update notification toggle icon based on current permission state
function updateNotificationToggleIcon() {
    if (!notificationToggle) return;
    
    if (!('Notification' in window)) {
        notificationToggle.textContent = 'notifications_off';
        notificationToggle.classList.add('disabled');
        notificationToggle.classList.remove('enabled');
        return;
    }
    
    const notificationsEnabled = Notification.permission === 'granted' && 
                                localStorage.getItem('notifications_enabled') !== 'false';
    
    if (notificationsEnabled) {
        notificationToggle.textContent = 'notifications_active';
        notificationToggle.classList.add('enabled');
        notificationToggle.classList.remove('disabled');
    } else if (Notification.permission === 'denied') {
        notificationToggle.textContent = 'notifications_off';
        notificationToggle.classList.add('disabled');
        notificationToggle.classList.remove('enabled');
    } else {
        notificationToggle.textContent = 'notifications';
        notificationToggle.classList.remove('enabled', 'disabled');
    }
}

// Add task form
document.getElementById('add_task_form').addEventListener('submit', function(e) {
    let i = getLocalStorage().length;
    e.preventDefault();  // Prevents the page from reloading
    let task_name = document.getElementById('task_name').value;
    let deadline = document.getElementById('deadline').value.split('T');
    deadline = `${deadline[0]} ${deadline[1]}`;
    let importance = document.getElementById('importance').value;
    
    // Get notification preferences
    let notification_time = document.getElementById('notification_time').value;
    let notification_unit = document.getElementById('notification_unit').value;
    let notification_sound = document.getElementById('notification_sound').checked;
    
    localStorage.setItem(`task-${i}`, JSON.stringify({
        'task_name': task_name, 
        'deadline': deadline, 
        'importance': importance, 
        'task_status': "Pending", 
        'isDeleted': false, 
        'isCompleted': false,
        'notification_time': notification_time,
        'notification_unit': notification_unit,
        'notification_sound': notification_sound,
        'notified': false
    }));
    
    // Save notification sound preference globally
    localStorage.setItem('notification_sound', notification_sound.toString());
    
    document.getElementById('add_task_form').reset();
    rendertask();
    home.click();
    
    // Show confirmation notification
    showNotification(`Task "${task_name}" added successfully!`, importance);
})

// Extend deadline form
extenddeadlineform.addEventListener('submit', function(e){
    tasks = getLocalStorage();
    e.preventDefault();
    let deadline = document.getElementById('Extend_Deadline').value.split('T');
    deadline = `${deadline[0]} ${deadline[1]}`;
    let i = extenddeadlineform_container.children[1].innerHTML;
    task = tasks[i];  // it will give task at index i
    task.deadline = deadline;
    task.task_status = "Pending";
    task.notified = false; // Reset notification status
    localStorage.setItem(`task-${i}`, JSON.stringify(task));
    extenddeadlineform.reset();
    rendertask();
    home.click();
    document.body.classList.remove('overlay');
    
    // Show confirmation notification
    showNotification(`Deadline extended successfully!`, task.importance);
})

// for deleting or completing a task
document.getElementById('all_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to delete this task?");
        if (a) {
            task.isDeleted = true;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            rendertask();
            showNotification(`Task "${task.task_name}" moved to trash`, task.importance);
        }
    }
    if (e.target.classList.contains('completed')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        if (task.task_status === 'Missed') {
            alert("You can only mark a task as completed before the Deadline.");
        }
        else if (task.isCompleted) {
            alert("This task has already been marked as completed.");
        }
        else {
            let a = confirm("Are you sure you want to mark this task as completed?");
            if (a) {
                task.isCompleted = true;
                task.task_status = 'Completed';
                localStorage.setItem(`task-${i}`, JSON.stringify(task));
                rendertask();
                showNotification(`Task "${task.task_name}" marked as completed!`, task.importance);
            }
        }
    }
});

// interactivity in deleted task section
document.getElementById('deleted_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('restore')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to Restore this task?");
        if (a) {
            task.isDeleted = false;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_deletedtask();   // To updated deleted task list too.
            showNotification(`Task "${task.task_name}" restored successfully`, task.importance);
        }
    }
});

// interactivity in missed task section
document.getElementById('missed_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to delete this task?");
        if (a) {
            task.isDeleted = true;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_missedtask();
            showNotification(`Task "${task.task_name}" moved to trash`, task.importance);
        }
    }
    if (e.target.classList.contains('extend_deadline')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure to extend deadline for this task?");
        let title = (task.task_name).trim()
        if (a) {
            extenddeadlineform_container.hidden = false;
            main[0].hidden = true;
            document.body.classList.add('overlay');
            extenddeadlineform_container.firstElementChild.innerHTML = `Extend "${title}" Deadline`
            extenddeadlineform_container.children[1].innerHTML = `${i}`
        }
    }
});

// for interactivity in completed task section.
document.getElementById('completed_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to delete this task?");
        if (a) {
            task.isDeleted = true;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_completedtask();
            showNotification(`Task "${task.task_name}" moved to trash`, task.importance);
        }
    }

    if (e.target.classList.contains('pending')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to make this task Pending?");
        if (a) {
            task.isCompleted = false;
            task.task_status = "Pending";
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_completedtask();
            showNotification(`Task "${task.task_name}" marked as pending`, task.importance);
        }
    }

});

// for interactivity in pending task section.
document.getElementById('pending_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to delete this task?");
        if (a) {
            task.isDeleted = true;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            rendertask();
            showNotification(`Task "${task.task_name}" moved to trash`, task.importance);
        }
    }
    if (e.target.classList.contains('completed')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        if (task.task_status === 'Missed') {
            alert("You can only mark a task as completed before the Deadline.");
        }
        else if (task.isCompleted) {
            alert("This task has already been marked as completed.");
        }
        else {
            let a = confirm("Are you sure you want to mark this task as completed?");
            if (a) {
                task.isCompleted = true;
                task.task_status = 'Completed';
                localStorage.setItem(`task-${i}`, JSON.stringify(task));
                render_pendingtask();
                showNotification(`Task "${task.task_name}" marked as completed!`, task.importance);
            }
        }
    }
});

// Helper function to show a specific task section
function showTaskSection(section) {
    // Hide all sections first
    create.hidden = true;
    document.getElementsByClassName('deleted_task')[0].hidden = true;
    document.getElementsByClassName('task_list')[0].hidden = true;
    document.getElementsByClassName('missed_task')[0].hidden = true;
    document.getElementsByClassName('pending_task')[0].hidden = true;
    document.getElementsByClassName('completed_task')[0].hidden = true;
    extenddeadlineform_container.hidden = true;
    
    // Show the main container
    main[0].hidden = false;
    
    // Show the requested section
    switch(section) {
        case 'all':
            document.getElementsByClassName('task_list')[0].hidden = false;
            rendertask();
            break;
        case 'deleted':
            document.getElementsByClassName('deleted_task')[0].hidden = false;
            render_deletedtask();
            break;
        case 'missed':
            document.getElementsByClassName('missed_task')[0].hidden = false;
            render_missedtask();
            break;
        case 'pending':
            document.getElementsByClassName('pending_task')[0].hidden = false;
            render_pendingtask();
            break;
        case 'completed':
            document.getElementsByClassName('completed_task')[0].hidden = false;
            render_completedtask();
            break;
    }
    
    // Remove overlay
    document.body.classList.remove('overlay');
}

// Update the menu event listener to use the new helper function
document.getElementsByClassName('menu')[0].addEventListener('click', function(e) {
    if (e.target.id === 'delete') {
        showTaskSection('deleted');
    }

    if (e.target.id === 'missed') {
        showTaskSection('missed');
    }

    if (e.target.id === 'completed') {
        showTaskSection('completed');
    }
    
    if (e.target.id === 'pending') {
        showTaskSection('pending');
    }
    
    if (e.target.id === 'home') {
        showTaskSection('all');
    }
    
    if (e.target.id === 'theme_toggle') {
        toggleTheme();
    }
})

// Update the home click event to use the helper function
home.addEventListener('click', function() {
    showTaskSection('all');
})

add.addEventListener('click', function() {
    create.hidden = false;
    main[0].hidden = true;
    document.body.classList.add('overlay');
    create.style.scale = 1.15;
})

// Close add task form when clicking outside
document.addEventListener('click', function(e) {
    if (!create.hidden && !create.contains(e.target) && e.target !== add && !add.contains(e.target)) {
        create.hidden = true;
        main[0].hidden = false;
        document.body.classList.remove('overlay');
    }
});

// Dismiss notification
dismissNotification.addEventListener('click', function() {
    notificationContainer.classList.add('hidden');
});

// Toggle mobile sidebar
function toggleMobileSidebar() {
    mobileSidebar.classList.toggle('open');
    document.body.classList.toggle('overlay');
}

// Close mobile sidebar
function closeMobileSidebar() {
    mobileSidebar.classList.remove('open');
    document.body.classList.remove('overlay');
}

// Populate mobile sidebar with task previews
function populateMobileSidebar() {
    // Clear existing content
    sidebarContent.innerHTML = '';
    
    // Create task list previews
    createTaskListPreview('All Tasks', 'home', getAllTasks().slice(0, 3));
    createTaskListPreview('Pending Tasks', 'priority_high', getPendingTasks().slice(0, 3));
    createTaskListPreview('Completed Tasks', 'assignment_turned_in', getCompletedTasks().slice(0, 3));
    createTaskListPreview('Missed Tasks', 'assignment_late', getMissedTasks().slice(0, 3));
    createTaskListPreview('Deleted Tasks', 'delete', getDeletedTasks().slice(0, 3));
}

// Create a task list preview section
function createTaskListPreview(title, icon, tasks) {
    const preview = document.createElement('div');
    preview.className = 'task-list-preview';
    
    // Create header
    const header = document.createElement('h4');
    header.innerHTML = `<span class="material-symbols-outlined">${icon}</span>${title}`;
    preview.appendChild(header);
    
    // Create task list
    const list = document.createElement('ul');
    
    if (tasks.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No tasks';
        list.appendChild(emptyItem);
    } else {
        tasks.forEach(task => {
            const item = document.createElement('li');
            
            // Create priority indicator
            const priorityIndicator = document.createElement('span');
            priorityIndicator.className = 'task-priority';
            
            if (task.importance === '3') {
                priorityIndicator.classList.add('priority-high');
            } else if (task.importance === '2') {
                priorityIndicator.classList.add('priority-medium');
            } else {
                priorityIndicator.classList.add('priority-low');
            }
            
            // Create task name
            const taskName = document.createElement('span');
            taskName.className = 'task-name';
            taskName.textContent = task.task_name;
            
            // Add elements to item
            item.appendChild(priorityIndicator);
            item.appendChild(taskName);
            
            // Add item to list
            list.appendChild(item);
        });
    }
    
    preview.appendChild(list);
    
    // Create view all button
    const viewAllBtn = document.createElement('div');
    viewAllBtn.className = 'view-all-btn';
    viewAllBtn.textContent = 'View All';
    viewAllBtn.dataset.type = icon;
    viewAllBtn.addEventListener('click', function() {
        // Handle click based on task type
        switch(this.dataset.type) {
            case 'home':
                showTaskSection('all');
                break;
            case 'priority_high':
                showTaskSection('pending');
                break;
            case 'assignment_turned_in':
                showTaskSection('completed');
                break;
            case 'assignment_late':
                showTaskSection('missed');
                break;
            case 'delete':
                showTaskSection('deleted');
                break;
        }
        
        // Close sidebar
        closeMobileSidebar();
    });
    
    preview.appendChild(viewAllBtn);
    
    // Add preview to sidebar
    sidebarContent.appendChild(preview);
}

// Find the existing testNotification function and replace it
window.testNotification = function(importance = '2') {
    
    
    // If permission is not granted, request it first
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                localStorage.setItem('notifications_enabled', 'true');
                updateNotificationToggleIcon();
                // Now show the test notification
                showNotification('This is a test notification. If you see this, notifications are working!', importance);
            } else {
                // Show only in-app notification
                showNotification('Notification permission not granted. Only in-app notifications will work.', '1');
            }
        });
    } else {
        // Show the test notification
        showNotification('This is a test notification. If you see this, notifications are working!', importance);
        
        // Also directly test system notification if permission is granted
        if (Notification.permission === 'granted') {
            setTimeout(() => {
                sendSystemNotification('This is a direct system notification test.', importance);
            }, 1000); // Delay slightly to avoid confusion
        }
    }
};

window.onload = function() {
    document.getElementsByClassName('task_list')[0].hidden = false;
    rendertask();
    render_completedtask();
    render_deletedtask();
    render_missedtask();
    render_pendingtask();
    applyTheme();
    
    // Set default values for notification form
    const savedSound = localStorage.getItem('notification_sound');
    if (savedSound !== null) {
        const soundToggle = document.getElementById('notification_sound');
        if (soundToggle) {
            soundToggle.checked = savedSound === 'true';
        }
    } else {
        // Default to true if not set
        localStorage.setItem('notification_sound', 'true');
    }
    
    // Initialize notification permission state
    if (localStorage.getItem('notifications_enabled') === null) {
        localStorage.setItem('notifications_enabled', Notification.permission === 'granted' ? 'true' : 'false');
    }
    updateNotificationToggleIcon();
    
    // Add direct event listener for theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Add event listener for notification toggle
    if (notificationToggle) {
        notificationToggle.addEventListener('click', toggleNotificationPermission);
    }
    
    // Add event listener for nav-home link
    const navHome = document.getElementById('nav-home');
    if (navHome) {
        navHome.addEventListener('click', function(e) {
            e.preventDefault();
            showTaskSection('all');
        });
    }
    
    // Test notification function - accessible from console
    window.testNotification = function(importance = '2') {
        
        // If permission is not granted, request it first
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    localStorage.setItem('notifications_enabled', 'true');
                    updateNotificationToggleIcon();
                    // Now show the test notification
                    showNotification('This is a test notification. If you see this, notifications are working!', importance);
                } else {
                    // Show only in-app notification
                    showNotification('Notification permission not granted. Only in-app notifications will work.', '1');
                }
            });
        } else {
            // Show the test notification
            showNotification('This is a test notification. If you see this, notifications are working!', importance);
            
            // Also directly test system notification if permission is granted
            if (Notification.permission === 'granted') {
                setTimeout(() => {
                    sendSystemNotification('This is a direct system notification test.', importance);
                }, 1000); // Delay slightly to avoid confusion
            }
        }
    };
}