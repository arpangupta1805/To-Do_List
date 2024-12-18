let add = document.getElementsByClassName('add')[0];
let create = document.getElementById('create_task');
let main = document.getElementsByClassName('hide_main');
let add_task = document.getElementById('add_task');
let home = document.getElementById('home');
let completed = document.querySelectorAll('.completed');
let deletebtn = document.querySelectorAll('.delete');
let extenddeadlineform = document.getElementById('extend_deadline_form')
let extenddeadlineform_container = document.getElementById('EXTEND')

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
            <p id = ${i} class="delete material-symbols-outlined">delete</p>
            <p id = ${i} class="extend_deadline material-symbols-outlined">more_time</p>`
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
            <p id = ${i} class="delete material-symbols-outlined">delete</p>
            <p id = ${i} class="pending material-symbols-outlined">pending</p>`

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
    localStorage.setItem(`task-${i}`, JSON.stringify({'task_name': task_name, 'deadline': deadline, 'importance': importance, 'task_status': "Pending", 'isDeleted': false, 'isCompleted': false, 'restoreit': false}));
    document.getElementById('add_task_form').reset();
    rendertask();
    home.click();
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
    localStorage.setItem(`task-${i}`, JSON.stringify(task));
    extenddeadlineform.reset();
    rendertask();
    home.click();
})

// for deleting or completing a task
document.getElementById('all_task').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {
        let i = e.target.id;
        let task = JSON.parse(localStorage.getItem(`task-${i}`));
        let a = confirm("Are you sure you want to delete this task?");
        if (a) {
            task.isDeleted = true;
            task.restoreit = false;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            rendertask();
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
            task.restoreit = true;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_deletedtask();   // To updated deleted task list too.
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
            task.restoreit = false;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_missedtask();
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
            task.restoreit = false;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            render_completedtask();
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
            task.restoreit = false;
            localStorage.setItem(`task-${i}`, JSON.stringify(task));
            rendertask();
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
    document.body.style.backgroundColor = ''; // Reset background color
})

add.addEventListener('click', function() {
    create.hidden = false;
    main[0].hidden = true;
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
    create.style.scale = 1.15;
})

window.onload = function() {
    document.getElementsByClassName('task_list')[0].hidden = false;
    rendertask();
    render_completedtask();
    render_deletedtask();
    render_missedtask();
    render_pendingtask();
}

