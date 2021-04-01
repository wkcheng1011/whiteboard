CREATE TABLE users (
    id string(36) NOT NULL PRIMARY KEY,
    name text NOT NULL,
    type integer NOT NULL,
    username string NOT NULL,
    password string NOT NULL
);

CREATE TABLE channels (
    id string(36) NOT NULL PRIMARY KEY
);

CREATE TABLE messages (
    id string(36) NOT NULL PRIMARY KEY,
    user_id string(36) NOT NULL,
    channel_id string(36) NOT NULL,
    at date default (datetime('now', 'localtime')),
    title text NOT NULL,
    content text NOT NULL,
    foreign key(user_id) references users(id),
    foreign key(channel_id) references channels(id)
);

CREATE TABLE participants (
    channel_id string(36) NOT NULL,
    user_id string(36) NOT NULL,
    primary key(channel_id, user_id),
    foreign key(channel_id) references channels(id),
    foreign key(user_id) references users(id)
);

CREATE TABLE classes (
    id string(36) NOT NULL,
    teacher_id string(36) NOT NULL,
    name text NOT NULL,
    foreign key(teacher_id) references users(id)
);

CREATE TABLE tasks (
    id string(36) NOT NULL PRIMARY KEY,
    class_id string(36),
    start date default (datetime('now', 'localtime')),
    end date default (datetime('now', '+14 day', 'localtime')),
    name text,
    foreign key(class_id) references classes(id)
);

CREATE TABLE questions (
    id string(36) NOT NULL PRIMARY KEY,
    task_id string(36),
    content text,
    foreign key(task_id) references tasks(id)
);

CREATE TABLE answers (
    id string(36) NOT NULL PRIMARY KEY,
    question_id string(36),
    content text,
    correct boolean,
    foreign key(question_id) references questions(id)
);

CREATE TABLE attempts (
    id string(36) NOT NULL PRIMARY KEY,
    task_id string(36),
    user_id string(36),
    at date default (datetime('now', 'localtime')),
    foreign key(task_id) references tasks(id),
    foreign key(user_id) references users(id)
);

CREATE TABLE attemptAnswers (
    id string(36) NOT NULL PRIMARY KEY,
    attempt_id string(36),
    answer_id string(36),
    question_id string(36),
    foreign key(attempt_id) references attempts(id),
    foreign key(answer_id) references answer(id),
    foreign key(question_id) references questions(id)
);