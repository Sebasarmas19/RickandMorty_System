// characters.js
// Handles character data fetching, display, searching, sorting, and editing

let charactersData = [];
let currentPage = 1;
let totalPages = 1;
let currentSort = { column: 'id', order: 'asc' };
let searchQuery = '';

// Icons
const eyeIcon = `<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
const editIcon = `<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`;

document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters();
    
    // Setup Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            fetchCharacters();
        }, 500);
    });

    // Setup Sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            if (currentSort.column === column) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.order = 'asc';
            }
            renderTable();
        });
    });

    // Setup Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchCharacters();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchCharacters();
        }
    });
});

async function fetchCharacters() {
    try {
        const url = new URL('https://rickandmortyapi.com/api/character');
        url.searchParams.append('page', currentPage);
        if (searchQuery) {
            url.searchParams.append('name', searchQuery);
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                charactersData = [];
                totalPages = 1;
                renderTable();
                return;
            }
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        charactersData = data.results;
        totalPages = data.info.pages;
        
        // Merge with local edits
        const localEdits = JSON.parse(localStorage.getItem('characterEdits') || '{}');
        charactersData = charactersData.map(char => {
            if (localEdits[char.id]) {
                return { ...char, ...localEdits[char.id] };
            }
            return char;
        });

        renderTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('table-body').innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--status-dead)">Failed to load data. You might be offline.</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    
    if (charactersData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No characters found in this dimension.</td></tr>`;
        return;
    }

    // Sort data
    const sortedData = [...charactersData].sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = sortedData.map(char => `
        <tr>
            <td>#${char.id}</td>
            <td>
                <div class="flex-center">
                    <img src="${char.image}" alt="${char.name}" class="avatar">
                    <strong>${char.name}</strong>
                </div>
            </td>
            <td>${char.species}</td>
            <td>${char.gender}</td>
            <td><span class="badge badge-${char.status.toLowerCase()}">${char.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewCharacter(${char.id})" title="View Details">${eyeIcon}</button>
                    <button class="btn-icon" onclick="editCharacter(${char.id})" title="Edit">${editIcon}</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
}

// Modal Functions
function openModal() {
    document.getElementById('character-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('character-modal').classList.remove('active');
}

// Close on outside click
document.getElementById('character-modal').addEventListener('click', (e) => {
    if (e.target.id === 'character-modal') closeModal();
});

function viewCharacter(id) {
    const char = charactersData.find(c => c.id === id);
    if (!char) return;

    document.getElementById('modal-title').textContent = char.name;
    
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-card">
            <div class="detail-img-container">
                <img src="${char.image}" alt="${char.name}" class="detail-img">
            </div>
            <div class="detail-info">
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value"><span class="badge badge-${char.status.toLowerCase()}">${char.status}</span></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Species</span>
                    <span class="info-value">${char.species}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gender</span>
                    <span class="info-value">${char.gender}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Origin</span>
                    <span class="info-value">${char.origin.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Location</span>
                    <span class="info-value">${char.location.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Episodes</span>
                    <span class="info-value">${char.episode.length}</span>
                </div>
            </div>
        </div>
    `;
    
    openModal();
}

function editCharacter(id) {
    const char = charactersData.find(c => c.id === id);
    if (!char) return;

    document.getElementById('modal-title').textContent = `Edit ${char.name}`;
    
    document.getElementById('modal-body').innerHTML = `
        <form id="edit-form" onsubmit="saveCharacter(event, ${char.id})">
            <div class="form-group">
                <label class="form-label" for="edit-name">Name</label>
                <input type="text" id="edit-name" class="form-control" value="${char.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-species">Species</label>
                <input type="text" id="edit-species" class="form-control" value="${char.species}" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-gender">Gender</label>
                <select id="edit-gender" class="form-control">
                    <option value="Male" ${char.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${char.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Genderless" ${char.gender === 'Genderless' ? 'selected' : ''}>Genderless</option>
                    <option value="unknown" ${char.gender === 'unknown' ? 'selected' : ''}>Unknown</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-status">Status</label>
                <select id="edit-status" class="form-control">
                    <option value="Alive" ${char.status === 'Alive' ? 'selected' : ''}>Alive</option>
                    <option value="Dead" ${char.status === 'Dead' ? 'selected' : ''}>Dead</option>
                    <option value="unknown" ${char.status === 'unknown' ? 'selected' : ''}>Unknown</option>
                </select>
            </div>
            <div class="modal-footer" style="padding: 1.25rem 0 0; margin-top: 1rem;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    `;
    
    openModal();
}

// Need to attach it to window since it's called from inline HTML onsubmit
window.saveCharacter = function(event, id) {
    event.preventDefault();
    
    const newName = document.getElementById('edit-name').value;
    const newSpecies = document.getElementById('edit-species').value;
    const newGender = document.getElementById('edit-gender').value;
    const newStatus = document.getElementById('edit-status').value;
    
    const localEdits = JSON.parse(localStorage.getItem('characterEdits') || '{}');
    
    localEdits[id] = {
        name: newName,
        species: newSpecies,
        gender: newGender,
        status: newStatus
    };
    
    localStorage.setItem('characterEdits', JSON.stringify(localEdits));
    
    // Update local state and re-render immediately
    const charIndex = charactersData.findIndex(c => c.id === id);
    if (charIndex > -1) {
        charactersData[charIndex] = { ...charactersData[charIndex], ...localEdits[id] };
    }
    
    renderTable();
    closeModal();
};
