// DOM Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const timeLabels = document.getElementById('time-labels');
const taskMarkers = document.getElementById('task-markers');
const timeNeedle = document.getElementById('time-needle');
const timeTicks = document.getElementById('time-ticks');
const clockCenter = document.getElementById('clock-center');
const currentTimeDisplay = document.getElementById('current-time-display');
const targetTaskInfo = document.getElementById('target-task-info');
const notificationContainer = document.getElementById('notification-container');
const notificationMessage = document.getElementById('notification-message');
const dismissNotification = document.getElementById('dismiss-notification');
const themeToggle = document.getElementById('theme_toggle');
const notificationToggle = document.getElementById('notification_toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mobileSidebar = document.querySelector('.mobile-sidebar');
const closeSidebarBtn = document.querySelector('.mobile-sidebar .close-btn');
const sidebarContent = document.querySelector('.mobile-sidebar-content');
let notificationHelpBtn = document.getElementById('notification-help');
let notificationHelpModal = document.getElementById('notification-help-modal');
let closeModalBtn = document.querySelector('.close-modal');
let browserTabs = document.querySelectorAll('.browser-tab');

// Variables
let currentFilter = 'today';
let tasks = [];
let clockRadius = 0;
let clockCenterPos = { x: 0, y: 0 };
let maxTasksToShow = 15;
let upcomingTasks = [];
let targetTask = null;
let animationFrameId = null;
let targetAngle = 0;
let currentAngle = 0;
let needleSpeed = 0.5; // degrees per animation frame

// Custom notification sounds - using local files instead of URLs
const notificationSounds = {
    low: 'sounds/notification-low.mp3',
    medium: 'sounds/notification-medium.mp3',
    high: 'sounds/notification-high.mp3'
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
    createTaskListPreview('Today\'s Tasks', 'today', getTasksForToday());
    createTaskListPreview('Upcoming Tasks', 'event_upcoming', getUpcomingTasks());
    createTaskListPreview('High Priority', 'priority_high', getHighPriorityTasks());
    
    // Add visualization filters
    const filtersSection = document.createElement('div');
    filtersSection.className = 'task-list-preview';
    
    const filtersHeader = document.createElement('h4');
    filtersHeader.innerHTML = '<span class="material-symbols-outlined">filter_list</span>View Filters';
    filtersSection.appendChild(filtersHeader);
    
    const filtersList = document.createElement('div');
    filtersList.className = 'sidebar-filters';
    
    const filters = [
        { name: 'Today\'s Tasks', value: 'today' },
        { name: 'Day View', value: 'day' },
        { name: 'Month View', value: 'month' },
        { name: 'Year View', value: 'year' }
    ];
    
    filters.forEach(filter => {
        const filterBtn = document.createElement('div');
        filterBtn.className = 'sidebar-filter-btn';
        if (currentFilter === filter.value) {
            filterBtn.classList.add('active');
        }
        filterBtn.textContent = filter.name;
        filterBtn.dataset.filter = filter.value;
        
        filterBtn.addEventListener('click', function() {
            // Update filter buttons in the main view
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filter === this.dataset.filter) {
                    btn.click();
                }
            });
            
            // Close sidebar
            closeMobileSidebar();
        });
        
        filtersList.appendChild(filterBtn);
    });
    
    filtersSection.appendChild(filtersList);
    sidebarContent.appendChild(filtersSection);
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
        // Show only up to 3 tasks
        const tasksToShow = tasks.slice(0, 3);
        
        tasksToShow.forEach(task => {
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
    
    // Add preview to sidebar
    sidebarContent.appendChild(preview);
}

// Helper functions to get different task types
function getTasksForToday() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= today && taskDate < tomorrow;
    });
}

function getUpcomingTasks() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate > now && taskDate < nextWeek;
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

function getHighPriorityTasks() {
    return tasks.filter(task => task.importance === '3');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    applyTheme();
    
    // Get clock dimensions
    const clock = document.querySelector('.clock');
    clockRadius = clock.offsetWidth / 2;
    clockCenterPos = {
        x: clock.offsetWidth / 2,
        y: clock.offsetHeight / 2
    };
    
    // Load tasks
    loadTasks();
    
    // Set up filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            
            // Cancel previous animation
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            updateVisualization();
        });
    });
    
    // Set up theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Set up notification toggle
    if (notificationToggle) {
        notificationToggle.addEventListener('click', toggleNotificationPermission);
    }
    
    // Set up mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            populateMobileSidebar();
            toggleMobileSidebar();
        });
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileSidebar && mobileSidebar.classList.contains('open') && 
            !mobileSidebar.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle.contains(e.target)) {
            closeMobileSidebar();
        }
    });
    
    // Initialize visualization
    updateVisualization();
    
    // Update visualization every minute
    setInterval(() => {
        // Only update if we're not actively animating
        if (!animationFrameId) {
            updateVisualization();
        }
    }, 60000);
    
    // Request notification permission
    requestNotificationPermission();
    
    // Initialize notification sound setting
    initNotificationSoundSetting();
    
    // Start checking for upcoming tasks
    startTaskNotifications();
    
    // Set up notification help modal
    if (notificationHelpBtn) {
        notificationHelpBtn.addEventListener('click', function() {
            showNotificationHelpModal();
            detectBrowser(); // Auto-select the user's browser tab
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideNotificationHelpModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === notificationHelpModal) {
            hideNotificationHelpModal();
        }
    });
    
    // Set up browser tabs in help modal
    browserTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchBrowserTab(this.dataset.browser);
        });
    });
});

// Apply saved theme or default to dark
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        if (themeToggle) {
            themeToggle.textContent = 'light_mode';
        }
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.textContent = 'dark_mode';
        }
    }
}

// Load tasks from localStorage
function loadTasks() {
    tasks = [];
    let i = 0;
    while (localStorage.getItem(`task-${i}`)) {
        const task = JSON.parse(localStorage.getItem(`task-${i}`));
        if (!task.isDeleted && task.task_status !== 'Completed') {
            tasks.push({
                ...task,
                id: i
            });
        }
        i++;
    }
}

// Update visualization based on current filter
function updateVisualization() {
    // Reload tasks
    loadTasks();
    
    // Clear previous visualization
    timeLabels.innerHTML = '';
    taskMarkers.innerHTML = '';
    timeTicks.innerHTML = '';
    upcomingTasks = [];
    targetTask = null;
    
    // Update based on filter
    switch (currentFilter) {
        case 'today':
            visualizeTodayTasks();
            break;
        case 'day':
            visualizeDayTasks();
            break;
        case 'month':
            visualizeMonthTasks();
            break;
        case 'year':
            visualizeYearTasks();
            break;
    }
    
    // Create time ticks
    createTimeTicks();
    
    // Start needle animation
    animateTimeNeedle();
}

// Create time ticks around the clock
function createTimeTicks() {
    // Function is now empty as we're removing the ticks
    // This function is kept for compatibility with existing code
}

// Get days in current month
function getDaysInCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// Visualize today's tasks
function visualizeTodayTasks() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Update clock center text
    clockCenter.textContent = 'Today';
    
    // Filter tasks for today
    const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= today && taskDate < tomorrow;
    });
    
    // Sort tasks by deadline
    todayTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Store upcoming tasks for animation
    upcomingTasks = [...todayTasks];
    
    // Find target task (next upcoming task)
    findTargetTask();
    
    // Create hour labels for all 24 hours
    for (let i = 0; i < 24; i++) {
        // 0 hours is at 12 o'clock position (top), and we go clockwise
        const angle = ((i / 24) * 360) - 90;
        // Convert to radians and ensure positive angle
        const angleRad = ((angle + 360) % 360) * Math.PI / 180;
        
        const labelX = clockCenterPos.x + Math.cos(angleRad) * (clockRadius * 0.85);
        const labelY = clockCenterPos.y + Math.sin(angleRad) * (clockRadius * 0.85);
        
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${i}:00`;
        label.style.left = `${labelX}px`;
        label.style.top = `${labelY}px`;
        label.style.transform = 'translate(-50%, -50%)';
        timeLabels.appendChild(label);
    }
    
    // Position tasks according to their deadline time
    positionTasksByTime(todayTasks, 'today');
    
    // Update current time display
    updateCurrentTimeDisplay('today');
    
    // Set initial needle angle - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    currentAngle = (totalMinutes / (24 * 60)) * 360 - 90;
    timeNeedle.style.transform = `rotate(${currentAngle}deg)`;
}

// Visualize tasks by day
function visualizeDayTasks() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Update clock center text
    clockCenter.textContent = 'Days';
    
    // Filter tasks for current month
    const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= currentMonth && taskDate < nextMonth;
    });
    
    // Sort tasks by deadline
    monthTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Store upcoming tasks for animation
    upcomingTasks = [...monthTasks];
    
    // Find target task (next upcoming task)
    findTargetTask();
    
    // Get days in month
    const daysInMonth = getDaysInCurrentMonth();
    
    // Create day labels for all days in month
    for (let i = 1; i <= daysInMonth; i++) {
        // Day 1 is at 12 o'clock position (top), and we go clockwise
        const angle = (((i - 1) / daysInMonth) * 360) - 90;
        // Convert to radians and ensure positive angle
        const angleRad = ((angle + 360) % 360) * Math.PI / 180;
        
        const labelX = clockCenterPos.x + Math.cos(angleRad) * (clockRadius * 0.85);
        const labelY = clockCenterPos.y + Math.sin(angleRad) * (clockRadius * 0.85);
        
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = i;
        label.style.left = `${labelX}px`;
        label.style.top = `${labelY}px`;
        label.style.transform = 'translate(-50%, -50%)';
        timeLabels.appendChild(label);
    }
    
    // Position tasks according to their deadline day
    positionTasksByTime(monthTasks, 'day');
    
    // Update current time display
    updateCurrentTimeDisplay('day');
    
    // Set initial needle angle - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
    const day = now.getDate();
    const hours = now.getHours();
    // Add partial day progress based on current hour
    const dayProgress = (day - 1) + (hours / 24);
    currentAngle = (dayProgress / daysInMonth) * 360 - 90;
    timeNeedle.style.transform = `rotate(${currentAngle}deg)`;
}

// Visualize tasks by month
function visualizeMonthTasks() {
    const now = new Date();
    const currentYear = new Date(now.getFullYear(), 0, 1);
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    
    // Update clock center text
    clockCenter.textContent = 'Month';
    
    // Filter tasks for current year
    const yearTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= currentYear && taskDate < nextYear;
    });
    
    // Sort tasks by deadline
    yearTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Store upcoming tasks for animation
    upcomingTasks = [...yearTasks];
    
    // Find target task (next upcoming task)
    findTargetTask();
    
    // Create month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month, i) => {
        // January is at 12 o'clock position (top), and we go clockwise
        const angle = ((i / 12) * 360) - 90;
        // Convert to radians and ensure positive angle
        const angleRad = ((angle + 360) % 360) * Math.PI / 180;
        
        const labelX = clockCenterPos.x + Math.cos(angleRad) * (clockRadius * 0.85);
        const labelY = clockCenterPos.y + Math.sin(angleRad) * (clockRadius * 0.85);
        
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = month;
        label.style.left = `${labelX}px`;
        label.style.top = `${labelY}px`;
        label.style.transform = 'translate(-50%, -50%)';
        timeLabels.appendChild(label);
    });
    
    // Position tasks according to their deadline month
    positionTasksByTime(yearTasks, 'month');
    
    // Update current time display
    updateCurrentTimeDisplay('month');
    
    // Set initial needle angle - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
    const month = now.getMonth();
    const day = now.getDate();
    const daysInMonth = getDaysInCurrentMonth();
    // Add partial month progress based on current day
    const monthProgress = month + (day / daysInMonth);
    currentAngle = (monthProgress / 12) * 360 - 90;
    timeNeedle.style.transform = `rotate(${currentAngle}deg)`;
}

// Visualize tasks by year
function visualizeYearTasks() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Update clock center text
    clockCenter.textContent = 'Year';
    
    // Filter tasks for next few years
    const futureTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate.getFullYear() >= currentYear;
    });
    
    // Sort tasks by deadline
    futureTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Store upcoming tasks for animation
    upcomingTasks = [...futureTasks];
    
    // Find target task (next upcoming task)
    findTargetTask();
    
    // Create year labels - start from current year and show 5 years
    for (let i = 0; i < 5; i++) {
        const year = currentYear + i;
        // Current year is at 12 o'clock position (top), and we go clockwise
        const angle = ((i / 5) * 360) - 90;
        // Convert to radians and ensure positive angle
        const angleRad = ((angle + 360) % 360) * Math.PI / 180;
        
        const labelX = clockCenterPos.x + Math.cos(angleRad) * (clockRadius * 0.85);
        const labelY = clockCenterPos.y + Math.sin(angleRad) * (clockRadius * 0.85);
        
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = year;
        label.style.left = `${labelX}px`;
        label.style.top = `${labelY}px`;
        label.style.transform = 'translate(-50%, -50%)';
        timeLabels.appendChild(label);
    }
    
    // Position tasks according to their deadline year
    positionTasksByTime(futureTasks, 'year');
    
    // Update current time display
    updateCurrentTimeDisplay('year');
    
    // Set initial needle angle for year view
    // Calculate progress through the current year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
    const yearProgress = (now - yearStart) / (yearEnd - yearStart);
    
    // Map this to the first segment of the clock (0 to 1/5 of the circle)
    // 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
    // For the current year (first segment), the angle should be between -90 and -90+(360/5)
    currentAngle = (yearProgress * (360/5)) - 90;
    timeNeedle.style.transform = `rotate(${currentAngle}deg)`;
    
    // Check if we need to update the year view (if we're close to the end of the year)
    // This will automatically update the visualization when a year passes
    if (yearProgress > 0.99) {
        // Schedule an update for the new year
        setTimeout(() => {
            if (currentFilter === 'year') {
                updateVisualization();
            }
        }, (yearEnd - now) + 1000); // Add 1 second buffer
    }
}

// Find the target task (next upcoming task)
function findTargetTask() {
    const now = new Date();
    
    // Filter tasks that are in the future
    const futureTasks = upcomingTasks.filter(task => new Date(task.deadline) > now);
    
    if (futureTasks.length > 0) {
        // Sort by closest deadline
        futureTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        targetTask = futureTasks[0];
        
        // Update target task info
        const taskDate = new Date(targetTask.deadline);
        const formattedDate = taskDate.toLocaleDateString();
        const formattedTime = taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeRemaining = getTimeRemaining(taskDate);
        
        targetTaskInfo.textContent = `Next: "${targetTask.task_name}" (${timeRemaining})`;
        
        // Calculate target angle based on filter - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
        switch (currentFilter) {
            case 'today':
                const taskHours = taskDate.getHours();
                const taskMinutes = taskDate.getMinutes();
                const taskTotalMinutes = taskHours * 60 + taskMinutes;
                targetAngle = (taskTotalMinutes / (24 * 60)) * 360 - 90;
                break;
            case 'day':
                const taskDay = taskDate.getDate();
                const taskDaysInMonth = new Date(taskDate.getFullYear(), taskDate.getMonth() + 1, 0).getDate();
                targetAngle = ((taskDay - 1) / taskDaysInMonth) * 360 - 90;
                break;
            case 'month':
                const taskMonth = taskDate.getMonth();
                targetAngle = (taskMonth / 12) * 360 - 90;
                break;
            case 'year':
                const taskYear = taskDate.getFullYear();
                const currentYear = now.getFullYear();
                // Calculate years from current year (0 to 4)
                const yearDiff = taskYear - currentYear;
                // Limit to 0-4 range
                const yearsInFuture = Math.min(4, Math.max(0, yearDiff));
                targetAngle = (yearsInFuture / 5) * 360 - 90;
                break;
        }
    } else {
        targetTaskInfo.textContent = "No upcoming tasks";
        
        // If no target task, set target angle to current time - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
        switch (currentFilter) {
            case 'today':
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const totalMinutes = hours * 60 + minutes;
                targetAngle = (totalMinutes / (24 * 60)) * 360 - 90;
                break;
            case 'day':
                const day = now.getDate();
                const daysInMonth = getDaysInCurrentMonth();
                targetAngle = ((day - 1) / daysInMonth) * 360 - 90;
                break;
            case 'month':
                const month = now.getMonth();
                targetAngle = (month / 12) * 360 - 90;
                break;
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
                const yearProgress = (now - yearStart) / (yearEnd - yearStart);
                // Map to first segment (0 to 1/5 of the circle)
                targetAngle = (yearProgress * (360/5)) - 90;
                break;
        }
    }
}

// Position tasks according to their deadline time
function positionTasksByTime(taskList, filterType) {
    // Limit to max tasks
    const tasksToShow = taskList.slice(0, maxTasksToShow);
    
    if (tasksToShow.length === 0) return;
    
    // Group tasks by their time position
    const taskGroups = groupTasksByTimePosition(tasksToShow, filterType);
    
    // Position each group of tasks
    Object.entries(taskGroups).forEach(([angle, tasks]) => {
        const angleValue = parseFloat(angle);
        
        // Convert angle to radians
        const angleRad = angleValue * Math.PI / 180;
        
        // Position tasks in a row from outer to inner
        tasks.forEach((task, index) => {
            // Calculate radius based on index (outer to inner)
            // Start from 70% of radius and move inward
            const radiusFactor = 0.7 - (index * 0.08);
            const radius = clockRadius * Math.max(radiusFactor, 0.3); // Don't go closer than 30% to center
            
            // Calculate position using cos/sin for correct placement
            const markerX = clockCenterPos.x + Math.cos(angleRad) * radius;
            const markerY = clockCenterPos.y + Math.sin(angleRad) * radius;
            
            // Determine if this is the target task
            const isTarget = targetTask && task.id === targetTask.id;
            
            // Create marker
            createTaskMarker(task, markerX, markerY, angleValue, isTarget);
        });
    });
}

// Group tasks by their time position on the clock
function groupTasksByTimePosition(tasks, filterType) {
    const taskGroups = {};
    
    tasks.forEach(task => {
        const taskDate = new Date(task.deadline);
        let angle = 0;
        
        // Calculate angle based on filter type - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
        switch (filterType) {
            case 'today':
                const hours = taskDate.getHours();
                const minutes = taskDate.getMinutes();
                // For today view, use 15-minute intervals for better distribution
                // This creates 96 possible positions (24 hours * 4 quarters) around the clock
                const totalMinutes = hours * 60 + minutes;
                // Round to nearest 15-minute interval to reduce overlapping
                const roundedMinutes = Math.round(totalMinutes / 15) * 15;
                angle = (roundedMinutes / (24 * 60)) * 360 - 90;
                break;
            case 'day':
                const day = taskDate.getDate();
                const daysInMonth = new Date(taskDate.getFullYear(), taskDate.getMonth() + 1, 0).getDate();
                angle = ((day - 1) / daysInMonth) * 360 - 90;
                break;
            case 'month':
                const month = taskDate.getMonth();
                angle = (month / 12) * 360 - 90;
                break;
            case 'year':
                const taskYear = taskDate.getFullYear();
                const currentYear = new Date().getFullYear();
                // Calculate years from current year (0 to 4)
                const yearDiff = taskYear - currentYear;
                // Limit to 0-4 range
                const yearsInFuture = Math.min(4, Math.max(0, yearDiff));
                angle = (yearsInFuture / 5) * 360 - 90;
                break;
        }
        
        // Normalize angle to be between 0 and 360
        angle = (angle + 360) % 360;
        
        // Round angle to nearest integer for grouping
        const roundedAngle = Math.round(angle);
        
        // Add task to group
        if (!taskGroups[roundedAngle]) {
            taskGroups[roundedAngle] = [];
        }
        taskGroups[roundedAngle].push(task);
    });
    
    return taskGroups;
}

// Create a task marker
function createTaskMarker(task, x, y, angle, isTarget) {
    const marker = document.createElement('div');
    marker.className = 'task-marker';
    
    // Add priority class
    if (task.importance === '3') {
        marker.classList.add('priority-high');
    } else if (task.importance === '2') {
        marker.classList.add('priority-medium');
    } else {
        marker.classList.add('priority-low');
    }
    
    // Add target class if this is the target task
    if (isTarget) {
        marker.classList.add('target-task');
    }
    
    // Position marker
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.style.transform = 'translate(-50%, -50%)';
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'task-tooltip';
    tooltip.style.zIndex = '10000000000'; // Ensure tooltip appears above everything
    
    // Position tooltip based on angle to avoid going off-screen
    // Convert angle to 0-360 range for consistent tooltip positioning
    const normalizedAngle = (angle + 360) % 360;
    
    // Determine the best position for the tooltip based on the angle
    if (normalizedAngle > 45 && normalizedAngle < 135) {
        // Bottom quadrant - position tooltip above
        tooltip.style.bottom = '3rem';
        tooltip.style.top = 'auto';
        tooltip.style.left = '50%';
        tooltip.style.right = 'auto';
        tooltip.style.transform = 'translateX(-50%)';
    } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
        // Left quadrant - position tooltip to the right
        tooltip.style.left = '3rem';
        tooltip.style.right = 'auto';
        tooltip.style.top = '50%';
        tooltip.style.bottom = 'auto';
        tooltip.style.transform = 'translateY(-50%)';
    } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
        // Top quadrant - position tooltip below
        tooltip.style.top = '3rem';
        tooltip.style.bottom = 'auto';
        tooltip.style.left = '50%';
        tooltip.style.right = 'auto';
        tooltip.style.transform = 'translateX(-50%)';
    } else {
        // Right quadrant - position tooltip to the left
        tooltip.style.right = '3rem';
        tooltip.style.left = 'auto';
        tooltip.style.top = '50%';
        tooltip.style.bottom = 'auto';
        tooltip.style.transform = 'translateY(-50%)';
    }
    
    // Format deadline
    const deadline = new Date(task.deadline);
    const formattedDate = deadline.toLocaleDateString();
    const formattedTime = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate time remaining
    const timeRemaining = getTimeRemaining(deadline);
    
    // Add tooltip content
    tooltip.innerHTML = `
        <h4>${task.task_name}</h4>
        <p><strong>Due:</strong> ${formattedDate} at ${formattedTime}</p>
        <p><strong>Time left:</strong> ${timeRemaining}</p>
        <p><strong>Priority:</strong> ${task.importance === '3' ? 'High' : (task.importance === '2' ? 'Medium' : 'Low')}</p>
    `;
    
    marker.appendChild(tooltip);
    taskMarkers.appendChild(marker);
}

// Get human-readable time remaining
function getTimeRemaining(deadline) {
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) {
        return "Overdue";
    }
    
    // Convert to appropriate units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Update current time display
function updateCurrentTimeDisplay(filterType) {
    const now = new Date();
    let displayText = '';
    
    switch (filterType) {
        case 'today':
            displayText = `Current Time: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            break;
        case 'day':
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            displayText = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
            break;
        case 'month':
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            displayText = `Current Month: ${months[now.getMonth()]}`;
            break;
        case 'year':
            displayText = `Current Year: ${now.getFullYear()}`;
            break;
    }
    
    currentTimeDisplay.textContent = displayText;
}

// Animate time needle to smoothly rotate toward the target task
function animateTimeNeedle() {
    function updateNeedle() {
        const now = new Date();
        
        // Update current angle based on real time with more precision - 0 degrees is at 3 o'clock, so we need to subtract 90 degrees
        switch (currentFilter) {
            case 'today':
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const milliseconds = now.getMilliseconds();
                const totalMinutes = hours * 60 + minutes + (seconds + milliseconds / 1000) / 60;
                currentAngle = (totalMinutes / (24 * 60)) * 360 - 90;
                break;
            case 'day':
                const day = now.getDate();
                const dayHours = now.getHours();
                const dayMinutes = now.getMinutes();
                const daysInMonth = getDaysInCurrentMonth();
                // Add partial day progress
                const dayProgress = (day - 1) + ((dayHours * 60 + dayMinutes) / (24 * 60));
                currentAngle = (dayProgress / daysInMonth) * 360 - 90;
                break;
            case 'month':
                const month = now.getMonth();
                const monthDay = now.getDate();
                const daysInCurrentMonth = getDaysInCurrentMonth();
                // Add partial month progress
                const monthProgress = month + ((monthDay - 1) / daysInCurrentMonth);
                currentAngle = (monthProgress / 12) * 360 - 90;
                break;
            case 'year':
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
                const yearProgress = (now - yearStart) / (yearEnd - yearStart);
                // Map to first segment (0 to 1/5 of the circle)
                currentAngle = (yearProgress * (360/5)) - 90;
                break;
        }
        
        // Rotate the needle
        timeNeedle.style.transform = `rotate(${currentAngle}deg)`;
        
        // Check if target task deadline has passed
        if (targetTask) {
            const taskDeadline = new Date(targetTask.deadline);
            if (now >= taskDeadline) {
                // Target task deadline has passed, update visualization
                updateVisualization();
                return; // Stop animation to allow for new visualization
            }
        }
        
        // Continue animation
        animationFrameId = requestAnimationFrame(updateNeedle);
    }
    
    // Start animation
    animationFrameId = requestAnimationFrame(updateNeedle);
}

// Show notification
function showNotification(message, importance = '1') {
    // Show in-app notification
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
    
    // Send system notification if supported
    if ('Notification' in window) {
        // Check if permission is already granted
        if (Notification.permission === 'granted') {
            sendSystemNotification(message, importance);
        }
        // Otherwise, request permission
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    sendSystemNotification(message, importance);
                }
            });
        }
    }
}

// Send system notification
function sendSystemNotification(message, importance) {
    // Skip if notifications are disabled
    if (localStorage.getItem('notifications_enabled') === 'false') {
        return;
    }
    
    // Format the notification title with time
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = `To-Do List (${formattedTime})`;
    
    // Set notification options
    const options = {
        body: message,
        icon: 'favicon.ico', // Make sure you have a favicon
        badge: 'favicon.ico',
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
    } catch (error) {
        console.error('Error creating notification:', error);
        // Fallback to in-app notification only
    }
}

// Play notification sound
function playNotificationSound(importance = '1') {
    // Check if notification sound is enabled
    if (localStorage.getItem('notification_sound') !== 'true') {
        return; // Don't play sound if disabled
    }
    
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
        
        // Set volume based on importance
        audio.volume = importance === '3' ? 0.7 : (importance === '2' ? 0.5 : 0.3);
        
        // Play the sound
        const playPromise = audio.play();
        
        // Handle play promise (required for modern browsers)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio play failed:', error);
                // Most likely due to user interaction requirement
                // We'll try again with user interaction
                
                // Create a temporary button for user interaction
                if (!document.querySelector('.sound-trigger')) {
                    const soundTrigger = document.createElement('button');
                    soundTrigger.className = 'sound-trigger';
                    soundTrigger.textContent = 'Enable Sound';
                    soundTrigger.style.position = 'fixed';
                    soundTrigger.style.bottom = '10px';
                    soundTrigger.style.right = '10px';
                    soundTrigger.style.zIndex = '9999';
                    
                    soundTrigger.addEventListener('click', () => {
                        // Try playing sound again
                        const newAudio = new Audio(soundUrl);
                        newAudio.volume = importance === '3' ? 0.7 : (importance === '2' ? 0.5 : 0.3);
                        newAudio.play().catch(e => console.error('Audio still failed:', e));
                        
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
            });
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Dismiss notification
dismissNotification.addEventListener('click', function() {
    notificationContainer.classList.add('hidden');
});

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

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        // Initialize notification permission state if not set
        if (localStorage.getItem('notifications_enabled') === null) {
            localStorage.setItem('notifications_enabled', Notification.permission === 'granted' ? 'true' : 'false');
        }
        
        // Update the notification toggle icon
        updateNotificationToggleIcon();
        
        // If permission is already granted, we don't need to show the permission request
        if (Notification.permission === 'granted') {
            return;
        }
        
        // If permission is denied, we can't request it again
        if (Notification.permission === 'denied') {
            return;
        }
        
        // We only show the permission request if it's not been decided yet
        if (Notification.permission === 'default') {
            // Create a button in the notification container
            const permissionBtn = document.createElement('button');
            permissionBtn.textContent = 'Enable Notifications';
            permissionBtn.className = 'notification-permission-btn';
            
            // Clear any existing buttons
            const existingBtn = notificationContainer.querySelector('.notification-permission-btn');
            if (existingBtn) {
                notificationContainer.removeChild(existingBtn);
            }
            
            // Add click event to request permission
            permissionBtn.addEventListener('click', () => {
                // Request permission
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        // Show success message
                        showNotification('Notifications enabled! You will now receive alerts for upcoming tasks.', '2');
                        
                        // Remove the button
                        if (permissionBtn.parentNode) {
                            permissionBtn.parentNode.removeChild(permissionBtn);
                        }
                        
                        // Update notification toggle icon
                        localStorage.setItem('notifications_enabled', 'true');
                        updateNotificationToggleIcon();
                        
                        // Test notification
                        setTimeout(() => {
                            sendSystemNotification('Notification system is working! You will be notified about your tasks.', '2');
                        }, 2000);
                    } else {
                        // Show message if denied
                        showNotification('Notification permission denied. You can enable it in your browser settings.', '1');
                        
                        // Update notification toggle icon
                        localStorage.setItem('notifications_enabled', 'false');
                        updateNotificationToggleIcon();
                    }
                }).catch(error => {
                    console.error('Error requesting notification permission:', error);
                    showNotification('Could not request notification permission. Please try again.', '1');
                });
            });
            
            // Show message explaining notifications
            showNotification('Enable notifications to get reminders for your tasks', '2');
            
            // Add button to notification container
            notificationContainer.appendChild(permissionBtn);
        }
    }
}

// Initialize notification sound setting
function initNotificationSoundSetting() {
    // Set default value if not already set
    if (localStorage.getItem('notification_sound') === null) {
        localStorage.setItem('notification_sound', 'true');
    }

    // Find all notification sound toggles (could be checkbox, slider, or other input)
    const soundToggles = document.querySelectorAll('.notification-sound-toggle, #notification-sound-toggle, #settings-sound-toggle, [data-setting="notification_sound"]');
    
    soundToggles.forEach(toggle => {
        // Determine the type of input
        const isCheckbox = toggle.type === 'checkbox';
        const isRange = toggle.type === 'range';
        
        // Set initial state based on localStorage
        const soundEnabled = localStorage.getItem('notification_sound') === 'true';
        
        if (isCheckbox) {
            toggle.checked = soundEnabled;
        } else if (isRange) {
            toggle.value = soundEnabled ? '1' : '0';
        } else {
            // For other types of elements, use a data attribute or class
            if (soundEnabled) {
                toggle.classList.add('active');
                toggle.setAttribute('data-enabled', 'true');
            } else {
                toggle.classList.remove('active');
                toggle.setAttribute('data-enabled', 'false');
            }
        }
        
        // Add appropriate event listener based on input type
        if (isCheckbox) {
            toggle.addEventListener('change', function() {
                updateNotificationSoundSetting(this.checked);
            });
        } else if (isRange) {
            toggle.addEventListener('input', function() {
                updateNotificationSoundSetting(this.value !== '0');
            });
        } else {
            toggle.addEventListener('click', function() {
                const currentState = this.getAttribute('data-enabled') === 'true';
                updateNotificationSoundSetting(!currentState);
            });
        }
    });
    
    // Also check for the notification sound setting in the add task form
    const addTaskForm = document.querySelector('#add-task-form, #edit-task-form');
    if (addTaskForm) {
        const soundSetting = addTaskForm.querySelector('[name="notification_sound"]');
        if (soundSetting) {
            const soundEnabled = localStorage.getItem('notification_sound') === 'true';
            soundSetting.value = soundEnabled ? 'true' : 'false';
            
            // Add event listener to the form submission
            addTaskForm.addEventListener('submit', function() {
                const newSetting = soundSetting.value === 'true';
                localStorage.setItem('notification_sound', newSetting ? 'true' : 'false');
            });
        }
    }
    
    // Log the current setting for debugging
    console.log('Notification sound setting:', localStorage.getItem('notification_sound'));
}

// Update notification sound setting
function updateNotificationSoundSetting(enabled) {
    // Update localStorage
    localStorage.setItem('notification_sound', enabled ? 'true' : 'false');
    
    // Update all toggles to match
    const soundToggles = document.querySelectorAll('.notification-sound-toggle, #notification-sound-toggle, #settings-sound-toggle, [data-setting="notification_sound"]');
    
    soundToggles.forEach(toggle => {
        const isCheckbox = toggle.type === 'checkbox';
        const isRange = toggle.type === 'range';
        
        if (isCheckbox) {
            toggle.checked = enabled;
        } else if (isRange) {
            toggle.value = enabled ? '1' : '0';
        } else {
            if (enabled) {
                toggle.classList.add('active');
                toggle.setAttribute('data-enabled', 'true');
            } else {
                toggle.classList.remove('active');
                toggle.setAttribute('data-enabled', 'false');
            }
        }
    });
    
    // Show feedback to user
    showNotification(
        enabled ? 'Notification sounds enabled' : 'Notification sounds disabled', 
        '1'
    );
    
    // Play a test sound if enabled
    if (enabled) {
        setTimeout(() => {
            playNotificationSound('1');
        }, 500);
    }
    
    // Log the updated setting for debugging
    console.log('Updated notification sound setting:', localStorage.getItem('notification_sound'));
}

// Start checking for upcoming tasks and sending notifications
function startTaskNotifications() {
    // Check for upcoming tasks every minute
    setInterval(checkUpcomingTasks, 60000);
    
    // Also check immediately
    checkUpcomingTasks();
}

// Check for upcoming tasks and send notifications
function checkUpcomingTasks() {
    // Only proceed if notifications are granted
    if (Notification.permission !== 'granted') {
        return;
    }
    
    // Get current time
    const now = new Date();
    
    // Load tasks
    loadTasks();
    
    // Filter for upcoming tasks
    const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        
        // Calculate time difference in minutes
        const diffMinutes = Math.floor((taskDate - now) / (1000 * 60));
        
        // Return tasks that are due within the next hour but not overdue
        return diffMinutes >= 0 && diffMinutes <= 60;
    });
    
    // Sort by closest deadline
    upcomingTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    // Check if we have any upcoming tasks
    if (upcomingTasks.length > 0) {
        // Get the closest task
        const nextTask = upcomingTasks[0];
        const taskDate = new Date(nextTask.deadline);
        
        // Calculate time difference in minutes
        const diffMinutes = Math.floor((taskDate - now) / (1000 * 60));
        
        // Get the last notification time for this task
        const lastNotificationKey = `last_notification_${nextTask.id}`;
        const lastNotification = localStorage.getItem(lastNotificationKey);
        
        // Determine if we should send a notification
        let shouldNotify = false;
        
        if (!lastNotification) {
            // Never notified for this task
            shouldNotify = true;
        } else {
            const lastNotificationTime = parseInt(lastNotification);
            const timeSinceLastNotification = now.getTime() - lastNotificationTime;
            
            // Only notify again if it's been at least 15 minutes since the last notification
            if (timeSinceLastNotification >= 15 * 60 * 1000) {
                shouldNotify = true;
            }
        }
        
        // Send notification if needed
        if (shouldNotify) {
            // Format the message
            let message = '';
            
            if (diffMinutes === 0) {
                message = `Task "${nextTask.task_name}" is due now!`;
            } else if (diffMinutes === 1) {
                message = `Task "${nextTask.task_name}" is due in 1 minute!`;
            } else if (diffMinutes < 5) {
                message = `Task "${nextTask.task_name}" is due in ${diffMinutes} minutes!`;
            } else if (diffMinutes < 30) {
                message = `Task "${nextTask.task_name}" is due in ${diffMinutes} minutes.`;
            } else {
                message = `Task "${nextTask.task_name}" is due in ${diffMinutes} minutes.`;
            }
            
            // Send the notification with appropriate importance
            const importance = nextTask.importance || '1';
            sendSystemNotification(message, importance);
            
            // Update the last notification time
            localStorage.setItem(lastNotificationKey, now.getTime().toString());
        }
    }
}

// Show notification help modal
function showNotificationHelpModal() {
    notificationHelpModal.classList.remove('hidden');
    document.body.classList.add('overlay');
}

// Hide notification help modal
function hideNotificationHelpModal() {
    notificationHelpModal.classList.add('hidden');
    document.body.classList.remove('overlay');
}

// Switch browser tab in help modal
function switchBrowserTab(browser) {
    // Hide all instruction divs
    document.querySelectorAll('.browser-instructions').forEach(div => {
        div.classList.add('hidden');
    });
    
    // Show selected browser instructions
    document.getElementById(`${browser}-instructions`).classList.remove('hidden');
    
    // Update active tab
    browserTabs.forEach(tab => {
        if (tab.dataset.browser === browser) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Detect user's browser and show appropriate instructions
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'chrome'; // Default
    
    if (userAgent.indexOf('Firefox') > -1) {
        browser = 'firefox';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
        browser = 'safari';
    } else if (userAgent.indexOf('Edg') > -1) {
        browser = 'edge';
    }
    
    switchBrowserTab(browser);
}
