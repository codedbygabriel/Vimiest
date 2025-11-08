'use strict';

function initiateVimMotions() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
	const pressedKeys = new Set();

	document.addEventListener('keydown', event => {
		pressedKeys.add(event.key);
		if (pressedKeys.has('a') && pressedKeys.has('f')) console.info('hai');
	});

	document.addEventListener('keyup', event => {
		pressedKeys.delete(event.key);
	});
}

function configureButtons() {
	document.querySelector('.appButton.addButton').addEventListener('click', addToDoModal);
	document.querySelector('.appButton.removeButton').addEventListener('click', removeToDoModal);
	document.querySelector('.appButton.clearButton').addEventListener('click', event => clearTodos(true));
}

function assignToDos(buttons) {
	const toDoButtons = Array.from(buttons).filter(button => button.classList.contains('toDoButton'));
}

function addToDoModal() {
	const modal = document.createElement('dialog');
	modal.classList.add('modalTemplate');
	modal.classList.add('addModal');

	const body = document.querySelector('body');

	modal.innerHTML = `
		<div class='modalContainer'>
			<header class="modalHeader">
				<h2 class="modalTitle">Add To Do!</h2>
			</header>
			<form class="modalForms addForm">
				<label class='inputLabels' for="todo-name">I'll accomplish / do...</label>
				<input class='modalInput' placeholder='Learn vim motions' type="text" name="todo-name" />

				<label class='inputLabels' for="todo-description">Description</label>
				<textarea class='modalInput' placeholder='Create a dotfiles repository, learn the basics on vimtutor...' name="todo-description" rows="8" cols="10"></textarea>

				<button class="appButton" type="submit">Add Task</button>
			</form>
		</div>
		`;

	body.appendChild(modal);
	modal.showModal();
	document.querySelector('.addForm').addEventListener('submit', event => {
		event.preventDefault();
		const todoName = document.getElementsByName('todo-name')[0];
		const todoDescription = document.getElementsByName('todo-description')[0];
		addTodoToList(todoName, todoDescription, modal);
	});
}

function removeToDoModal() {}

function addTodoToList(name, description, modal) {
	if (!(name.value.length >= 5)) {
		name.placeholder = 'Your To Do needs to contain at least 5 chars!';
		name.value = '';
		name.style.color = '#846a6aff';
		name.focus();
		return false;
	}

	const database = initData();

	database.push({
		name: name.value,
		description: description.value || false
	});

	localStorage.setItem('_vimiest_todos', JSON.stringify(database));

	renderTodos();
	modal.close();
}

function initData() {
	let database = JSON.parse(localStorage.getItem('_vimiest_todos'));

	if (!database) {
		localStorage.setItem('_vimiest_todos', JSON.stringify([]));
		database = JSON.parse(localStorage.getItem('_vimiest_todos'));
	}

	return database;
}

function clearTodos(forever = false) {
	const elements = document.querySelectorAll('.todoHolder');
	const todos = initData();
	if (elements.length < 1) return false;

	if (forever && todos.length >= 1) {
		localStorage.removeItem('_vimiest_todos');
	}

	elements.forEach(element => {
		element.remove();
	});
}

function renderTodos() {
	const elements = document.querySelectorAll('.todoHolder');
	const container = document.querySelector('.appContent');
	const todos = initData();

	if (todos.length === 0) return false;
	if (elements.length >= 1) clearTodos();

	todos.forEach(todo => {
		container.insertAdjacentHTML(
			'beforeend',
			`
			<section class="todoHolder">
				<h2 class="taskTitle">${todo.name}</h2>
				<button class="appButton toDoButton" type="button">Edit</button>
			</section>
		`
		);
	});
}

(function () {
	configureButtons();
	initiateVimMotions();
	renderTodos();
})();
