const API_URL = '../api/index.php';

const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-title');
const itemIdInput = document.getElementById('item-id');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tbody = document.getElementById('items-tbody');

form.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);

document.addEventListener('DOMContentLoaded', fetchItems);

function showMessage(text, type) {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    form.insertAdjacentElement('beforebegin', div);

    setTimeout(() => div.remove(), 3000);
}

function resetForm() {
    form.reset();
    itemIdInput.value = '';
    formTitle.textContent = 'Add New Item';
    submitBtn.textContent = 'Add Item';
    cancelBtn.style.display = 'none';
}

function populateForm(item) {
    itemIdInput.value = item.id;
    nameInput.value = item.name;
    descriptionInput.value = item.description;
    formTitle.textContent = 'Edit Item';
    submitBtn.textContent = 'Update Item';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchItems() {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading items...</td></tr>';

    try {
        const res = await fetch(API_URL);
        const result = await res.json();

        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No items found.</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.description || '')}</td>
                <td>${formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-edit" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Failed to load items.</td></tr>';
        showMessage('Failed to load items.', 'error');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const id = itemIdInput.value;

    if (!name) {
        showMessage('Name is required.', 'error');
        return;
    }

    const body = { name, description };

    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        const result = await res.json();

        if (res.ok) {
            showMessage(result.message, 'success');
            resetForm();
            fetchItems();
        } else {
            showMessage(result.message || 'Something went wrong.', 'error');
        }
    } catch (err) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function editItem(id) {
    try {
        const res = await fetch(`${API_URL}?id=${id}`);
        const result = await res.json();

        if (result.data) {
            populateForm(result.data);
        } else {
            showMessage('Item not found.', 'error');
        }
    } catch (err) {
        showMessage('Failed to fetch item details.', 'error');
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (res.ok) {
            showMessage(result.message, 'success');
            fetchItems();
        } else {
            showMessage(result.message || 'Failed to delete item.', 'error');
        }
    } catch (err) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}
