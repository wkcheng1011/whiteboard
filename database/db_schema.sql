CREATE TABLE users (
    id string(36) NOT NULL PRIMARY KEY,
    name text NOT NULL,
    type integer NOT NULL,
    username string NOT NULL,
    password string NOT NULL
);

CREATE TABLE messages (
    id string(36) NOT NULL PRIMARY KEY,
    from_id string(36) NOT NULL,
    to_id string(36) NOT NULL,
    type integer NOT NULL,
    at date default (datetime('now', 'localtime')),
    content text NOT NULL,
    foreign key(from_id) references users(id) on delete cascade
);

CREATE TABLE classes (
    id string(36) NOT NULL PRIMARY KEY,
    teacher_id string(36) NOT NULL,
    name text NOT NULL,
    foreign key(teacher_id) references users(id) on delete cascade
);

CREATE TABLE members (
    class_id string(36) NOT NULL,
    student_id string(36) NOT NULL,
    PRIMARY KEY(class_id, student_id),
    foreign key(class_id) references classes(id) on delete cascade,
    foreign key(student_id) references users(id) on delete cascade
);

CREATE TABLE tasks (
    id string(36) NOT NULL PRIMARY KEY,
    class_id string(36) NOT NULL,
    start date NOT NULL,
    end date NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    foreign key(class_id) references classes(id) on delete cascade
);

CREATE TABLE questions (
    id string(36) NOT NULL PRIMARY KEY,
    task_id string(36) NOT NULL,
    content text NOT NULL,
    foreign key(task_id) references tasks(id) on delete cascade
);

CREATE TABLE answers (
    id string(36) NOT NULL PRIMARY KEY,
    question_id string(36) NOT NULL,
    content text NOT NULL,
    correct boolean NOT NULL,
    foreign key(question_id) references questions(id) on delete cascade
);

CREATE TABLE attempts (
    id string(36) NOT NULL PRIMARY KEY,
    task_id string(36) NOT NULL,
    user_id string(36) NOT NULL,
    at date default (datetime('now', 'localtime')),
    foreign key(task_id) references tasks(id) on delete cascade,
    foreign key(user_id) references users(id) on delete cascade
);

CREATE TABLE attemptAnswers (
    attempt_id string(36) NOT NULL,
    answer_id string(36) NOT NULL,
    PRIMARY KEY(attempt_id, answer_id),
    foreign key(attempt_id) references attempts(id) on delete cascade,
    foreign key(answer_id) references answers(id) on delete cascade
);