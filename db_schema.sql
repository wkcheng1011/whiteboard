CREATE TABLE users (
	id string(36),
	name text,
	type integer,
	username string,
	password string
);

CREATE TABLE messages (
	id string(36),
	from_id string(36),
	to_id string(36),
    at date default (datetime('now','localtime')),
	content text,
    foreign key(from_id) references users(id),
    foreign key(to_id) references users(id)
);

CREATE TABLE tasks (
	id string(36),
	author_id string(36),
	start date default (datetime('now','localtime')),
	end date default (datetime('now','localtime')),
	name text,
    foreign key(author_id) references users(id)
);

CREATE TABLE questions (
	id string(36),
	task_id string(36),
	content text,
    foreign key(task_id) references tasks(id)
);

CREATE TABLE answers (
	id string(36),
	question_id string(36),
	content text,
	correct boolean,
    foreign key(question_id) references questions(id)
);

CREATE TABLE attempts (
	id string(36),
	task_id string(36),
	user_id string(36),
	at date default (datetime('now','localtime')),
    foreign key(task_id) references tasks(id),
    foreign key(user_id) references users(id)
);

CREATE TABLE attemptAnswers (
	id string(36),
	attempt_id string(36),
	answer_id string(36),
	question_id string(36),
    foreign key(attempt_id) references attempts(id),
    foreign key(answer_id) references answer(id),
    foreign key(question_id) references questions(id)
);
