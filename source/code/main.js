'use strict';

function initiateVimMotions() {
	const pressedKeys = new Set();
	const body = document.querySelector('body');
	const button = document.querySelectorAll('.appButton');
	body.addEventListener('keydown', event => {
		pressedKeys.add(event.key);
		if (pressedKeys.has('f')) {
			button.forEach(button => {
				button.style.outline = '1px solid #c84361';
			});
		}
		if (pressedKeys.has('f') && pressedKeys.has('a')) addToDoModal();
		if (pressedKeys.has('f') && pressedKeys.has('r')) removeTodo();
		if (pressedKeys.has('f') && pressedKeys.has('c')) clearTodos(true);
		if (pressedKeys.has('f') && pressedKeys.has('h')) console.info('hm');
	});

	document.addEventListener('keyup', event => {
		pressedKeys.delete(event.key);
		button.forEach(button => {
			button.style.outline = '';
		});
	});
}

function configureButtons() {
	document.querySelector('.appButton.addButton').addEventListener('click', addToDoModal);
	document.querySelector('.appButton.removeButton').addEventListener('click', removeTodo);
	document.querySelector('.appButton.clearButton').addEventListener('click', event => clearTodos(true));
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
				<input class='modalInput modalInputTask' placeholder='Learn vim motions' type="text" name="todo-name" />

				<label class='inputLabels' for="todo-description">Description</label>
				<textarea class='modalInput' placeholder='Create a dotfiles repository, learn the basics on vimtutor...' name="todo-description" rows="8" cols="10"></textarea>

				<div>
					<button class="appButton" type="submit">Add Task</button>
					<button class="appButton closeButton" type="button">Close</button>
				</div>
			</form>
		</div>
		`;

	body.appendChild(modal);
	modal.showModal();

	styleInput();

	document.querySelector('.addForm').addEventListener('submit', event => {
		event.preventDefault();
		const todoName = document.getElementsByName('todo-name')[0];
		const todoDescription = document.getElementsByName('todo-description')[0];
		addTodoToList(todoName, todoDescription, modal);
	});
}

function removeTodo() {
	const button = document.querySelector('.appButton.removeButton');
	const elements = document.querySelectorAll('.todoHolder');

	if (elements.length < 1) return;

	if (!button.classList.contains('elementsModified')) {
		let counter = 0;
		elements.forEach(element => {
			element.children[0].insertAdjacentHTML('afterbegin', `<span class='mod' onclick='test()'>[${counter}]</span> `);
			counter++;
		});

		button.classList.add('elementsModified');
		document.addEventListener('keydown', removeHandler);
		return;
	}

	document.removeEventListener('keydown', removeHandler);
	document.querySelectorAll('.mod').forEach(mod => mod.remove());
	button.classList.remove('elementsModified');
}

function removeHandler(event) {
	const elements = document.querySelectorAll('.todoHolder');

	try {
		if (Number(event.key) <= elements.length - 1) {
			const database = initData();
			const element = elements[Number(event.key)].children[0];

			const newDatabase = database.filter(data => !element.innerText.includes(data.name));
			localStorage.setItem('_vimiest_todos', JSON.stringify(newDatabase));
			renderTodos();
		}
	} catch (err) {
		console.info('Error avoided, please insert Numeric Values. -> ', err);
	}
}

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

	// if (todos.length === 0) return false;
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

function styleInput() {
	const inputs = document.querySelectorAll('.modalInputTask');
	const colors = {
		red: '#c84361',
		green: '#31493cff',
		black: '#001a23'
	};
	inputs.forEach(input =>
		input.addEventListener('input', event => {
			input.style.color = input.value.length === 0 ? colors.black : input.value.length >= 5 ? colors.green : colors.red;
			input.style.outline = input.value.length === 0 ? '' : input.value.length >= 5 ? `1px solid ${colors.green}` : `1px solid ${colors.red}`;
		})
	);
}

(function () {
	configureButtons();
	initiateVimMotions();
	renderTodos();
})();
