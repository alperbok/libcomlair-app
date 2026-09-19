'use strict';

const API_BASE = 'https://libcomlair-backend.onrender.com';
const keyInput = document.getElementById('adminKey');
const queue = document.getElementById('queue');
const statusBox = document.getElementById('status');

function text(tag, value, className) {
  const el = document.createElement(tag);
  el.textContent = String(value || '');
  if (className) el.className = className;
  return el;
}

async function api(path, options = {}) {
  const key = keyInput.value;
  if (!key) throw new Error('Clé administrateur requise.');
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', 'Bearer ' + key);
  const response = await fetch(API_BASE + path, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Erreur serveur');
  return body;
}

async function moderate(id, decision) {
  await api('/api/admin/contributions/' + encodeURIComponent(id) + '/moderate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: decision })
  });
  await loadQueue();
}

function render(items) {
  queue.replaceChildren();
  if (!items.length) {
    queue.append(text('p', 'Aucune proposition en attente.'));
    return;
  }
  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'card';
    card.append(text('h3', item.name));
    card.append(text('p', item.city + ' — ' + item.category, 'meta'));
    if (item.address) card.append(text('p', item.address));
    if (item.comment) card.append(text('p', item.comment));
    const actions = document.createElement('div');
    actions.className = 'actions';
    const approve = text('button', 'Approuver');
    const reject = text('button', 'Refuser');
    approve.type = reject.type = 'button';
    approve.addEventListener('click', () => moderate(item.id, 'approved').catch(showError));
    reject.addEventListener('click', () => moderate(item.id, 'rejected').catch(showError));
    actions.append(approve, reject);
    card.append(actions);
    queue.append(card);
  }
}

function showError(error) {
  statusBox.textContent = error.message === 'unauthorized' ? 'Accès refusé.' : error.message;
}

async function loadQueue() {
  statusBox.textContent = 'Chargement…';
  const data = await api('/api/admin/contributions/pending');
  render(Array.isArray(data.contributions) ? data.contributions : []);
  statusBox.textContent = 'File de modération chargée.';
}

document.getElementById('loadButton').addEventListener('click', () => loadQueue().catch(showError));
document.getElementById('clearButton').addEventListener('click', () => {
  keyInput.value = '';
  queue.replaceChildren();
  statusBox.textContent = 'Clé effacée de cette page.';
});
