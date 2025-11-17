/**
 * Main Application Logic
 * Handles UI interactions, file uploads, and seating chart generation
 */

// Application state
let classroomConfig = null;
let studentsConfig = null;
let currentSeating = null;
let generator = null;

// DOM Elements
const classroomFileInput = document.getElementById('classroomFile');
const studentsFileInput = document.getElementById('studentsFile');
const classroomFileName = document.getElementById('classroomFileName');
const studentsFileName = document.getElementById('studentsFileName');
const generateBtn = document.getElementById('generateBtn');
const seedInput = document.getElementById('seedInput');
const errorDisplay = document.getElementById('errorDisplay');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const seatingChart = document.getElementById('seatingChart');
const statsDisplay = document.getElementById('statsDisplay');
const printBtn = document.getElementById('printBtn');
const regenerateBtn = document.getElementById('regenerateBtn');

// File upload handlers
classroomFileInput.addEventListener('change', (e) => handleFileUpload(e, 'classroom'));
studentsFileInput.addEventListener('change', (e) => handleFileUpload(e, 'students'));

// Button handlers
generateBtn.addEventListener('click', generateSeatingChart);
printBtn.addEventListener('click', () => window.print());
regenerateBtn.addEventListener('click', generateSeatingChart);

/**
 * Handle file upload and YAML parsing
 */
async function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = jsyaml.load(text);

        if (type === 'classroom') {
            classroomConfig = data;
            classroomFileName.textContent = file.name;
            classroomFileInput.parentElement.classList.add('has-file');
        } else {
            studentsConfig = data;
            studentsFileName.textContent = file.name;
            studentsFileInput.parentElement.classList.add('has-file');
        }

        // Enable generate button if both files are loaded
        if (classroomConfig && studentsConfig) {
            generateBtn.disabled = false;
        }

        hideError();
    } catch (error) {
        showError(`Error parsing ${type} file: ${error.message}`);
        if (type === 'classroom') {
            classroomConfig = null;
            classroomFileName.textContent = 'Choose classroom.yaml';
            classroomFileInput.parentElement.classList.remove('has-file');
        } else {
            studentsConfig = null;
            studentsFileName.textContent = 'Choose students.yaml';
            studentsFileInput.parentElement.classList.remove('has-file');
        }
        generateBtn.disabled = true;
    }
}

/**
 * Generate seating chart
 */
function generateSeatingChart() {
    hideError();
    showLoading();
    resultsSection.style.display = 'none';

    // Small delay to show loading indicator
    setTimeout(() => {
        try {
            // Create generator
            generator = new SeatingChartGenerator(classroomConfig, studentsConfig);

            // Get seed if provided
            const seed = seedInput.value ? parseInt(seedInput.value) : null;

            // Generate seating chart
            currentSeating = generator.generate(1000, seed);

            // Display results
            displaySeatingChart(currentSeating);
            displayStats(currentSeating);

            // Show results
            hideLoading();
            resultsSection.style.display = 'block';

            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            hideLoading();
            showError(`Error generating seating chart: ${error.message}`);
        }
    }, 100);
}

/**
 * Display seating chart as a grid
 */
function displaySeatingChart(seating) {
    seatingChart.innerHTML = '';

    const table = document.createElement('div');
    table.className = 'desk-grid';

    for (let row = 0; row < seating.length; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'desk-row';

        for (let col = 0; col < seating[row].length; col++) {
            const cell = document.createElement('div');
            cell.className = 'desk-cell';

            const desk = seating[row][col];

            if (desk === 'BLOCKED') {
                cell.classList.add('blocked');
                cell.textContent = '[X]';
            } else if (Array.isArray(desk) && desk.length > 0) {
                cell.classList.add('occupied');
                desk.forEach(studentName => {
                    const studentSpan = document.createElement('span');
                    studentSpan.className = 'student-name';
                    studentSpan.textContent = studentName;
                    cell.appendChild(studentSpan);
                });
            } else {
                cell.classList.add('empty');
                cell.textContent = '[empty]';
            }

            rowDiv.appendChild(cell);
        }

        table.appendChild(rowDiv);
    }

    seatingChart.appendChild(table);
}

/**
 * Display statistics
 */
function displayStats(seating) {
    const totalStudents = generator.students.length;
    const totalDesks = generator.rows * generator.columns - generator.blockedDesks.size;

    let occupiedDesks = 0;
    for (const row of seating) {
        for (const desk of row) {
            if (Array.isArray(desk) && desk.length > 0) {
                occupiedDesks++;
            }
        }
    }

    statsDisplay.textContent = `Students: ${totalStudents} | Desks: ${occupiedDesks}/${totalDesks} occupied`;
}

/**
 * Show error message
 */
function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorDisplay.style.display = 'none';
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.style.display = 'block';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Initialize
console.log('Seating Chart Generator initialized');
