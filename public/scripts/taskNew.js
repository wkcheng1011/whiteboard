const simplemde = new SimpleMDE({});

function randomStr() {
    return Math.random().toString(36).substr(2, 5);
}

function clone(ele) {
    return document.querySelector(ele).content.firstElementChild.cloneNode(true);
}

function addQuestion(first = false) {
    const id = "q-" + randomStr();

    const containers = document.querySelector("#questionContainers");

    const questionContainerClone = clone("#questionContainerTemp");
    questionContainerClone.id = id;

    const questionInput = questionContainerClone.querySelector("input");
    questionInput.name = id;

    addAnswer(questionContainerClone, true);
    const actionClone = clone("#actionTemp");
    actionClone.querySelector(".removeQBtn").addEventListener("click", () => {
        containers.querySelector(`#${id}`).remove();
    });
    actionClone.querySelector(".addQBtn").addEventListener("click", () => {
        addQuestion();
    });

    if (first) {
        actionClone.querySelector(".removeQBtn").remove();
    }

    questionContainerClone.appendChild(actionClone);
    containers.appendChild(questionContainerClone);
    containers.querySelector(`#${id} input`).focus();
}

function addAnswer(questionElement, first = false) {
    const id = randomStr();

    const answerClone = clone("#answerTemp");
    answerClone.id = id;

    const radio = answerClone.querySelector("input[type=radio]");
    radio.name = questionElement.id + "-r";
    radio.value = id;

    const content = answerClone.querySelector("input[type=text]");
    content.name = questionElement.id + "-c-" + id;

    answerClone.querySelector(".removeABtn").addEventListener("click", () => {
        questionElement.querySelector(`#${id}`).remove();
    });

    answerClone.querySelector(".addABtn").addEventListener("click", () => {
        addAnswer(questionElement);
    });

    if (first) {
        radio.checked = true;
        answerClone.querySelector(".removeABtn").remove();
    }

    questionElement.insertBefore(answerClone, questionElement.querySelector(".d-flex"));
    questionElement.querySelector(`input[name=${questionElement.id + "-c-" + id}]`).focus();
}

const startDatePicker = document.querySelector("#start");
const endDatePicker = document.querySelector("#end");

startDatePicker.addEventListener("change", () => {
    endDatePicker.min = startDatePicker.value;
});

addQuestion(true);

/*
document.querySelector("#submitBtn").addEventListener("click", () => {
    const test = {};
    test.title = document.querySelector("input[name=title]").value;
    test.start = startDatePicker.value;
    test.end = endDatePicker.value;
    test.description = simplemde.value();
    test.questions = [];

    for (const question of document.querySelectorAll("#questionContainers > div")) {
        const q = {};
        q.answers = {};
        for (const answer of question.querySelectorAll("div[id^=a]")) {
            const correct = answer.querySelector("input[type=radio]").checked;
            const content = answer.querySelector("input[type=text]").value;
            q.answers[answer.id] = content;
            if (correct) q.answers.correct = answer.id;
        }
        test.questions.push(q);
    }

    console.log(test);
    
    const form = document.createElement("form");
    form.method = "POST";
    const value = document.createElement("input");
    value.name = "test";
    value.value = JSON.stringify(test);
    form.appendChild(value);

    document.body.appendChild(form);
    form.submit();
});
*/