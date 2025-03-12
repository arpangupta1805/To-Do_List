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
let notificationContainer = document.getElementById('notification-container');
let notificationMessage = document.getElementById('notification-message');
let dismissNotification = document.getElementById('dismiss-notification');

// Custom notification sounds
const notificationSounds = {
    low: '/sounds/notification-low.mp3',
    medium: '/sounds/notification-medium.mp3',
    high: '/sounds/notification-high.mp3'
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
    
    const audio = new Audio(soundUrl);
    audio.volume = importance === '3' ? 0.7 : (importance === '2' ? 0.5 : 0.3);
    audio.play().catch(e => console.log('Audio play failed:', e));
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
    let tasks = getLocalStorage();
    tasks.forEach(task => {
        if (!task.isDeleted && task.task_status !== 'Completed' && task.task_status !== 'Missed') {
            const deadline = new Date(task.deadline);
            const notificationTime = calculateNotificationTime(task);
            
            // If notification time has passed but not yet notified
            if (now >= notificationTime && !task.notified) {
                const timeLeft = getTimeLeft(now, deadline);
                showNotification(`Task "${task.task_name}" is due in ${timeLeft}!`, task.importance);
                task.notified = true;
                
                // Update task in localStorage
                const taskIndex = tasks.indexOf(task);
                localStorage.setItem(`task-${taskIndex}`, JSON.stringify(task));
            }
        }
    });
}

// Calculate when to show notification based on user preferences
function calculateNotificationTime(task) {
    const deadline = new Date(task.deadline);
    const notificationTime = new Date(deadline);
    
    const amount = task.notification_time || 1;
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
            <p id = ${i} class = "completed  hover_complete material-symbols-outlined">task_alt</p>
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
            <p id ='${i}' class="restore material-symbols-outlined">restore_from_trash</p>` /////////////////////////////////
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
            <p id = ${i} class="extend_deadline material-symbols-outlined">more_time</p>
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
            <p id = ${i} class="pending material-symbols-outlined">pending</p>
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
        }
    });
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
    localStorage.setItem('notification_sound', notification_sound);
    
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

// for interactivity in left navigation bar 
document.getElementsByClassName('menu')[0].addEventListener('click', function(e) {
    if (e.target.id === 'delete') {
        render_deletedtask();
        create.hidden = true;
        document.getElementsByClassName('deleted_task')[0].hidden = false;
        document.getElementsByClassName('task_list')[0].hidden = true;
        document.getElementsByClassName('missed_task')[0].hidden = true;
        document.getElementsByClassName('pending_task')[0].hidden = true;
        document.getElementsByClassName('completed_task')[0].hidden = true;
        main[0].hidden = false;
        extenddeadlineform_container.hidden = true;
        document.body.classList.remove('overlay');
    }

    if (e.target.id === 'missed') {
        render_missedtask();
        create.hidden = true;
        document.getElementsByClassName('deleted_task')[0].hidden = true;
        document.getElementsByClassName('task_list')[0].hidden = true;
        document.getElementsByClassName('missed_task')[0].hidden = false;
        document.getElementsByClassName('pending_task')[0].hidden = true;
        document.getElementsByClassName('completed_task')[0].hidden = true;
        main[0].hidden = false;
        extenddeadlineform_container.hidden = true;
        document.body.classList.remove('overlay');
    }

    if (e.target.id === 'completed') {
        render_completedtask();
        create.hidden = true;
        document.getElementsByClassName('deleted_task')[0].hidden = true;
        document.getElementsByClassName('task_list')[0].hidden = true;
        document.getElementsByClassName('missed_task')[0].hidden = true;
        document.getElementsByClassName('pending_task')[0].hidden = true;
        document.getElementsByClassName('completed_task')[0].hidden = false;
        main[0].hidden = false;
        extenddeadlineform_container.hidden = true;
        document.body.classList.remove('overlay');
    }
    if (e.target.id === 'pending') {
        render_pendingtask();
        create.hidden = true;
        document.getElementsByClassName('deleted_task')[0].hidden = true;
        document.getElementsByClassName('task_list')[0].hidden = true;
        document.getElementsByClassName('missed_task')[0].hidden = true;
        document.getElementsByClassName('pending_task')[0].hidden = false;
        document.getElementsByClassName('completed_task')[0].hidden = true;
        main[0].hidden = false;
        extenddeadlineform_container.hidden = true;
        document.body.classList.remove('overlay');
    }
    
    if (e.target.id === 'theme_toggle') {
        toggleTheme();
    }
})


home.addEventListener('click', function() {
    rendertask();
    create.hidden = true;
    document.getElementsByClassName('deleted_task')[0].hidden = true;
    document.getElementsByClassName('task_list')[0].hidden = false;
    document.getElementsByClassName('missed_task')[0].hidden = true;
    document.getElementsByClassName('pending_task')[0].hidden = true;
    document.getElementsByClassName('completed_task')[0].hidden = true;
    main[0].hidden = false;
    extenddeadlineform_container.hidden = true;
    document.body.classList.remove('overlay');
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
        document.getElementById('notification_sound').checked = savedSound === 'true';
    }
}

