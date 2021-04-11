$(function() {
    $('#bk-btn').hide();
});

function nameSorter(a, b) {
    return a.replace(/href=.*"/, "").localeCompare(b.replace(/href=.*"/, ""));
}

// Format time
const current = new Date();
const times = document.querySelectorAll(".time");
for (const time of times) {
    const diff = Math.abs((current - new Date(time.textContent)) / 1000);
    let magnitude, unit;
    if (diff > 86400) { // Over a day
        magnitude = diff / 86400;
        unit = " days";
    } else if (diff > 3600) {
        magnitude = diff / 3600;
        unit = " hrs";
    } else if (diff > 60) {
        magnitude = diff / 60;
        unit = " mins";
    } else {
        magnitude = diff;
        unit = " secs";
    }
    let txt;
    if (time.classList.contains("start")) {
        txt = (magnitude | 0) + unit + " ago";
    } else {
        txt = "After " + (magnitude | 0) + unit;
    }
    time.textContent = txt;
}

for (const deleteBtn of document.querySelectorAll(".deleteBtn")) {
    deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const task_id = deleteBtn.dataset.taskId;
        if (confirm("Are you sure to delete this task?")) {
            window.location = "/task/delete/" + task_id;
        }
    });
}
