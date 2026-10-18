const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');
const notesList = document.getElementById('notes-list');
const form = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = type; // success or error
}

// Reusable request wrapper: checks response.ok and throws on errors
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function renderNote(note) {
  const li = document.createElement('li');
  li.dataset.id = note.id;

  const titleEl = document.createElement('h3');
  titleEl.textContent = note.title; // textContent only, no innerHTML

  const bodyEl = document.createElement('p');
  bodyEl.textContent = note.body || '';

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => deleteNote(note.id, li));

  li.appendChild(titleEl);
  li.appendChild(bodyEl);
  li.appendChild(delBtn);
  return li;
}

async function loadNotes() {
  setStatus('Loading notes...', '');
  loadBtn.disabled = true;
  try {
    const notes = await request(`${API_URL}?_limit=10`);
    notesList.innerHTML = '';
    if (!notes || notes.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.textContent = 'No notes found.';
      notesList.appendChild(emptyLi);
      setStatus('No notes to show.', '');
    } else {
      notes.forEach(note => notesList.appendChild(renderNote(note)));
      setStatus(`Loaded ${notes.length} notes from the server.`, 'success');
    }
  } catch (err) {
    setStatus(`Failed to load notes. Please try again. (${err.message})`, 'error');
  } finally {
    loadBtn.disabled = false;
  }
}

async function createNote(title, body) {
  submitBtn.disabled = true;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId: 1 })
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    const created = await response.json();
    notesList.prepend(renderNote(created));
    setStatus(`Note created (status ${response.status}, id ${created.id}).`, 'success');
    form.reset();
  } catch (err) {
    setStatus(`Failed to create note. (${err.message})`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteNote(id, listItem) {
  // NOTE: JSONPlaceholder is a fake API. POST/DELETE don't persist on the server.
  // So on success we remove the item from the DOM locally.
  // In the real QuickNotes API, DELETE /notes/:id would delete from the database.
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    if (listItem) listItem.remove();
    setStatus(`Note ${id} deleted.`, 'success');
    if (notesList.children.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.textContent = 'No notes found.';
      notesList.appendChild(emptyLi);
    }
  } catch (err) {
    setStatus(`Failed to delete note. (${err.message})`, 'error');
  }
}

loadBtn.addEventListener('click', loadNotes);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // validation: title required, max 100 chars
  if (!title) {
    setStatus('Title is required.', 'error');
    return;
  }
  if (title.length > 100) {
    setStatus('Title must be 100 characters or less.', 'error');
    return;
  }

  createNote(title, body);
});
