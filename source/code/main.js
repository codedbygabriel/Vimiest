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
		if (pressedKeys.has('f') && pressedKeys.has('h')) viewCheatSheet();
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

	const modal = document.querySelector('.modalTemplate');
	document.querySelector('.closeButton').addEventListener('click', event => modal.close());
	document.querySelector('.addForm').addEventListener('submit', event => {
		event.preventDefault();
		const todoName = document.getElementsByName('todo-name')[0];
		const todoDescription = document.getElementsByName('todo-description')[0];
		addTodoToList(todoName, todoDescription, modal);
	});
}

function verifyModals() {
	let isOpen = false;
	const dialogs = document.querySelectorAll('dialog');

	dialogs.forEach(dialog => {
		if (dialog.open) isOpen = true;
	});

	return isOpen;
}

function addToDoModal() {
	if (verifyModals()) return;

	const modal = document.querySelector('.modalTemplate');

	modal.showModal();
	styleInput();
}

function removeTodo() {
	if (verifyModals()) return;
	const button = document.querySelector('.appButton.removeButton');
	const elements = document.querySelectorAll('.todoHolder');

	if (elements.length < 1) return;

	if (!button.classList.contains('elementsModified')) {
		let counter = 0;
		elements.forEach(element => {
			element.children[0].insertAdjacentHTML('afterbegin', `<span class='mod'>[${counter}]</span> `);
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

			element.children[0].remove();
			const newDatabase = database.filter(data => !(element.innerText == data.name));

			localStorage.setItem('_vimiest_todos', JSON.stringify(newDatabase));
			renderTodos();
		}
	} catch (err) {
		console.info('Error avoided, please insert Numeric Values. -> ', err);
	}
}

function verifyDuplicates(database, name) {
	let isDuplicate = false;

	database.forEach(data => {
		if (data.name === name.value) isDuplicate = true;
	});

	return isDuplicate;
}

function addTodoToList(name, description, modal) {
	if (!(name.value.length >= 5)) {
		name.placeholder = 'Your To Do needs to contain at least 5 chars!';
		name.value = '';
		name.style.color = '#846a6aff';
		name.focus();
		return;
	}

	const database = initData();
	if (verifyDuplicates(database, name)) {
		alert('To do already added.');
		name.value = '';
		name.style.color = '#846a6aff';
		name.focus();
		return;
	}

	database.push({
		name: name.value,
		description: description.value || false
	});

	localStorage.setItem('_vimiest_todos', JSON.stringify(database));

	renderTodos();
	name.value = '';
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

	if (elements.length >= 1) clearTodos();

	let counter = 0;
	todos.forEach(todo => {
		container.insertAdjacentHTML(
			'beforeend',
			`
			<section class="todoHolder">
				<h2 class="taskTitle">${todo.name}</h2>
				<button onclick='viewTodo("${counter}", "${todo.name}", "${todo.description}")' class="appButton toDoButton" type="button">View</button>
			</section>
		`
		);
		counter++;
	});
}

function viewTodo(id, name, description) {
	const exist = document.getElementById(`${id}`);

	if (exist) {
		exist.showModal();
		return;
	}

	const modal = document.createElement('dialog');
	const body = document.querySelector('body');

	const container = document.createElement('div');
	const header = document.createElement('header');
	const headerContent = document.createElement('h2');

	const paragraph = document.createElement('p');
	paragraph.textContent = description === 'false' ? 'No Description Provided' : description;

	modal.id = id;
	modal.classList.add('modalTemplate');
	container.classList.add('modalContainer');
	header.classList.add('modalHeader');
	headerContent.classList.add('modalTitle');
	headerContent.textContent = name;

	header.appendChild(headerContent);

	container.appendChild(header);
	container.appendChild(paragraph);

	modal.appendChild(container);
	body.appendChild(modal);
	modal.showModal();
}

function viewCheatSheet() {
	if (verifyModals()) return;
	const exist = document.querySelector('.cheatSheet');
	if (exist) {
		exist.showModal();
		return;
	}

	const modal = document.createElement('dialog');
	const body = document.querySelector('body');

	const container = document.createElement('div');
	const header = document.createElement('header');
	const headerContent = document.createElement('h2');

	const contentContainer = document.createElement('div');
	contentContainer.innerHTML = `
			<p class='keybindParagraph'><code class='code'>&lt;f&gt;-a</code> 	Opens Add Menu</p>
			<p class='keybindParagraph'><code class='code'>&lt;f&gt;-r</code> 	Enables Remove Mode</p>
			<p class='keybindParagraph'><code class='code'>&lt;f&gt;-c</code> 	Clear All To Dos</p>
			<p class='keybindParagraph'><code class='code'>&lt;f&gt;-h</code> 	Open CheatSheet </p>
			<p class='keybindParagraph'><code class='code'>&lt;f&gt;</code> 	Outline Buttons a-r-c</p>
		`;

	modal.classList.add('modalTemplate');
	modal.classList.add('cheatSheet');
	container.classList.add('modalContainer');
	header.classList.add('modalHeader');
	headerContent.classList.add('modalTitle');
	headerContent.textContent = 'Vimiest CheatSheet';

	header.appendChild(headerContent);

	container.appendChild(header);
	container.appendChild(contentContainer);

	modal.appendChild(container);
	body.appendChild(modal);
	modal.showModal();
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
