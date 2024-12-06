// Function to get resorts from localStorage
function getResorts() {
    return JSON.parse(localStorage.getItem('resorts')) || [];
}

// Function to save resorts to localStorage
function saveResorts(resorts) {
    localStorage.setItem('resorts', JSON.stringify(resorts));
}

// Function to add a resort
function addResort() {
    const name = document.getElementById('resortName').value.trim();
    const tag = document.getElementById('resortTag').value.trim();
    if (!name) {
        alert("Please enter a resort name.");
        return;
    }

    const resorts = getResorts();
    resorts.push({ name, tag });
    saveResorts(resorts);

    document.getElementById('resortName').value = '';
    document.getElementById('resortTag').value = '';

    displayResorts(resorts);
}

// Function to search resorts
function searchResorts() {
    const query = document.getElementById('searchQuery').value.trim().toLowerCase();
    const resorts = getResorts();
    const filteredResorts = resorts.filter(resort => resort.name.toLowerCase().includes(query));
    displayResorts(filteredResorts);
}

// Function to display resorts
function displayResorts(resorts) {
    const resortList = document.getElementById('resortList');
    resortList.innerHTML = `<h2>Resort List</h2>`;
    resorts.forEach((resort, index) => {
        const resortDiv = document.createElement('div');
        resortDiv.className = 'resort-item';
        resortDiv.innerHTML = `
            <strong>${resort.name}</strong> - ${resort.tag || "No tag"}
            <button onclick="editTag(${index})">Edit Tag</button>
        `;
        resortList.appendChild(resortDiv);
    });
}

// Function to edit a tag
function editTag(index) {
    const newTag = prompt("Enter a new tag:");
    if (newTag === null) return;

    const resorts = getResorts();
    resorts[index].tag = newTag;
    saveResorts(resorts);
    displayResorts(resorts);
}

// Initial display of resorts
document.addEventListener('DOMContentLoaded', () => {
    displayResorts(getResorts());
});
