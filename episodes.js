// episodes.js
// Handles episode data fetching, display, searching, sorting, and editing

let episodesData = [];
let currentPage = 1;
let totalPages = 1;
let currentSort = { column: 'id', order: 'asc' };
let searchQuery = '';

// Icons
const eyeIcon = `<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
const editIcon = `<svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`;

document.addEventListener('DOMContentLoaded', () => {
    fetchEpisodes();
    
    // Setup Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            fetchEpisodes();
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
            fetchEpisodes();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchEpisodes();
        }
    });
});

async function fetchEpisodes() {
    try {
        const url = new URL('https://rickandmortyapi.com/api/episode');
        url.searchParams.append('page', currentPage);
        if (searchQuery) {
            url.searchParams.append('name', searchQuery);
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                episodesData = [];
                totalPages = 1;
                renderTable();
                return;
            }
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        episodesData = data.results;
        totalPages = data.info.pages;
        
        // Merge with local edits
        const localEdits = JSON.parse(localStorage.getItem('episodeEdits') || '{}');
        episodesData = episodesData.map(ep => {
            if (localEdits[ep.id]) {
                return { ...ep, ...localEdits[ep.id] };
            }
            return ep;
        });

        renderTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('table-body').innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--status-dead)">Failed to load data. You might be offline.</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    
    if (episodesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No episodes found.</td></tr>`;
        return;
    }

    // Sort data
    const sortedData = [...episodesData].sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];
        
        // Convert to Date for sorting air_date properly if needed, but string works reasonably well for this format usually, wait, air_date is "December 2, 2013". Let's parse it for true sorting.
        if (currentSort.column === 'air_date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
        return 0;
    });

    tbody.innerHTML = sortedData.map(ep => `
        <tr>
            <td>#${ep.id}</td>
            <td><strong>${ep.name}</strong></td>
            <td>${ep.air_date}</td>
            <td><span class="badge badge-unknown">${ep.episode}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewEpisode(${ep.id})" title="View Details">${eyeIcon}</button>
                    <button class="btn-icon" onclick="editEpisode(${ep.id})" title="Edit">${editIcon}</button>
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
    document.getElementById('episode-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('episode-modal').classList.remove('active');
}

// Close on outside click
document.getElementById('episode-modal').addEventListener('click', (e) => {
    if (e.target.id === 'episode-modal') closeModal();
});

function viewEpisode(id) {
    const ep = episodesData.find(e => e.id === id);
    if (!ep) return;

    document.getElementById('modal-title').textContent = ep.name;
    
    document.getElementById('modal-body').innerHTML = `
        <div class="detail-card">
            <div class="detail-info">
                <div class="info-item">
                    <span class="info-label">Episode Code</span>
                    <span class="info-value"><span class="badge badge-unknown">${ep.episode}</span></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Air Date</span>
                    <span class="info-value">${ep.air_date}</span>
                </div>
                <div class="info-item" style="grid-column: span 2;">
                    <span class="info-label">Characters Featured</span>
                    <span class="info-value">${ep.characters.length} characters appeared in this episode.</span>
                </div>
            </div>
        </div>
    `;
    
    openModal();
}

function editEpisode(id) {
    const ep = episodesData.find(e => e.id === id);
    if (!ep) return;

    document.getElementById('modal-title').textContent = `Edit ${ep.name}`;
    
    document.getElementById('modal-body').innerHTML = `
        <form id="edit-form" onsubmit="saveEpisode(event, ${ep.id})">
            <div class="form-group">
                <label class="form-label" for="edit-name">Name</label>
                <input type="text" id="edit-name" class="form-control" value="${ep.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-air-date">Air Date</label>
                <input type="text" id="edit-air-date" class="form-control" value="${ep.air_date}" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-code">Episode Code</label>
                <input type="text" id="edit-code" class="form-control" value="${ep.episode}" required>
            </div>
            <div class="modal-footer" style="padding: 1.25rem 0 0; margin-top: 1rem;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    `;
    
    openModal();
}

// Global scope
window.saveEpisode = function(event, id) {
    event.preventDefault();
    
    const newName = document.getElementById('edit-name').value;
    const newAirDate = document.getElementById('edit-air-date').value;
    const newCode = document.getElementById('edit-code').value;
    
    const localEdits = JSON.parse(localStorage.getItem('episodeEdits') || '{}');
    
    localEdits[id] = {
        name: newName,
        air_date: newAirDate,
        episode: newCode
    };
    
    localStorage.setItem('episodeEdits', JSON.stringify(localEdits));
    
    // Update local state and re-render immediately
    const epIndex = episodesData.findIndex(e => e.id === id);
    if (epIndex > -1) {
        episodesData[epIndex] = { ...episodesData[epIndex], ...localEdits[id] };
    }
    
    renderTable();
    closeModal();
};
