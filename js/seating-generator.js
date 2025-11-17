/**
 * Seating Chart Generator - JavaScript Port
 * Generates random seating charts based on classroom layout and student constraints
 */

class SeatingChartGenerator {
    constructor(classroomConfig, studentsConfig) {
        this.rows = classroomConfig.rows;
        this.columns = classroomConfig.columns;
        this.students = studentsConfig.students;
        this.constraints = studentsConfig.constraints || {};

        // Parse default desk capacity (max only)
        this.defaultMaxCapacity = classroomConfig.max_capacity || 3;

        // Parse blocked desks
        this.blockedDesks = new Set();
        if (classroomConfig.blocked_desks) {
            classroomConfig.blocked_desks.forEach(blocked => {
                // Convert to 0-indexed
                const key = `${blocked.row - 1},${blocked.column - 1}`;
                this.blockedDesks.add(key);
            });
        }

        // Parse desk capacity overrides (max only)
        this.deskCapacityOverrides = new Map();
        if (classroomConfig.desk_capacity_overrides) {
            classroomConfig.desk_capacity_overrides.forEach(override => {
                const row = override.row - 1; // Convert to 0-indexed
                const col = override.column - 1;
                const key = `${row},${col}`;
                this.deskCapacityOverrides.set(key, override.max || this.defaultMaxCapacity);
            });
        }

        // Parse constraints
        this.cannotSitTogether = this.constraints.cannot_sit_together || [];
        this.largeStudents = new Set(this.constraints.large_students || []);

        // Parse row/column requirements
        this.rowRequirements = new Map();
        if (this.constraints.row_requirements) {
            this.constraints.row_requirements.forEach(req => {
                this.rowRequirements.set(req.student, req.row);
            });
        }

        this.columnRequirements = new Map();
        if (this.constraints.column_requirements) {
            this.constraints.column_requirements.forEach(req => {
                this.columnRequirements.set(req.student, req.column);
            });
        }

        // Validate inputs
        this._validate();
    }

    _validate() {
        const totalDesks = this.rows * this.columns;
        const availableDesks = totalDesks - this.blockedDesks.size;

        // Calculate maximum capacity (accounting for large students counting as 1.5)
        let maxCapacity = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (!this.blockedDesks.has(`${row},${col}`)) {
                    maxCapacity += this._getDeskMaxCapacity(row, col);
                }
            }
        }

        // Adjust for large students (they count as 1.5, so reduce capacity by 0.5 per large student)
        const largeStudentCount = this.largeStudents.size;
        const effectiveMaxCapacity = maxCapacity - (largeStudentCount * 0.5);

        if (this.students.length > effectiveMaxCapacity) {
            throw new Error(
                `Too many students (${this.students.length}) for maximum desk capacity ` +
                `(${effectiveMaxCapacity.toFixed(1)} with ${largeStudentCount} large students counting as 1.5)`
            );
        }

        // Validate row/column requirements are within bounds
        this.rowRequirements.forEach((row, student) => {
            if (row < 1 || row > this.rows) {
                throw new Error(
                    `Row ${row} for student ${student} is out of bounds (1-${this.rows})`
                );
            }
        });

        this.columnRequirements.forEach((col, student) => {
            if (col < 1 || col > this.columns) {
                throw new Error(
                    `Column ${col} for student ${student} is out of bounds (1-${this.columns})`
                );
            }
        });
    }

    _getDeskMaxCapacity(row, col) {
        const key = `${row},${col}`;
        if (this.deskCapacityOverrides.has(key)) {
            return this.deskCapacityOverrides.get(key);
        }
        return this.defaultMaxCapacity;
    }

    _getNeighbors(row, col) {
        const neighbors = [];
        // Up
        if (row > 0) neighbors.push([row - 1, col]);
        // Down
        if (row < this.rows - 1) neighbors.push([row + 1, col]);
        // Left
        if (col > 0) neighbors.push([row, col - 1]);
        // Right
        if (col < this.columns - 1) neighbors.push([row, col + 1]);
        return neighbors;
    }

    _getStudentsAtDesk(seating, row, col) {
        const desk = seating[row][col];
        return desk === "BLOCKED" ? [] : desk;
    }

    _getStudentsAtAdjacentDesks(seating, row, col) {
        const students = new Set();
        this._getNeighbors(row, col).forEach(([neighborRow, neighborCol]) => {
            const deskStudents = this._getStudentsAtDesk(seating, neighborRow, neighborCol);
            deskStudents.forEach(student => students.add(student));
        });
        return students;
    }

    _checkConstraints(seating, student, row, col) {
        // Check row requirements
        if (this.rowRequirements.has(student)) {
            const requiredRow = this.rowRequirements.get(student) - 1; // Convert to 0-indexed
            if (row !== requiredRow) return false;
        }

        // Check column requirements
        if (this.columnRequirements.has(student)) {
            const requiredCol = this.columnRequirements.get(student) - 1; // Convert to 0-indexed
            if (col !== requiredCol) return false;
        }

        // Get students currently at this desk
        const currentDeskStudents = this._getStudentsAtDesk(seating, row, col);

        // Check desk capacity - large students count as 1.5 towards max
        const maxCapacity = this._getDeskMaxCapacity(row, col);

        // Calculate current "weight" at desk (large students count as 1.5)
        let currentWeight = currentDeskStudents.length;
        currentDeskStudents.forEach(deskStudent => {
            if (this.largeStudents.has(deskStudent)) {
                currentWeight += 0.5; // Add 0.5 more (already counted as 1, now counts as 1.5)
            }
        });

        // Calculate weight of new student
        const newStudentWeight = this.largeStudents.has(student) ? 1.5 : 1;

        // Check if adding this student would exceed capacity
        if (currentWeight + newStudentWeight > maxCapacity) {
            return false;
        }

        // Check cannot sit together constraints - same desk
        for (const deskStudent of currentDeskStudents) {
            for (const group of this.cannotSitTogether) {
                if (group.includes(student) && group.includes(deskStudent)) {
                    return false;
                }
            }
        }

        // Check cannot sit together constraints - adjacent desks
        const adjacentStudents = this._getStudentsAtAdjacentDesks(seating, row, col);
        for (const adjacentStudent of adjacentStudents) {
            for (const group of this.cannotSitTogether) {
                if (group.includes(student) && group.includes(adjacentStudent)) {
                    return false;
                }
            }
        }

        return true;
    }

    generate(maxAttempts = 1000, seed = null) {
        // Set random seed if provided
        if (seed !== null) {
            this._seed = seed;
            this._seededRandom = this._createSeededRandom(seed);
        } else {
            this._seededRandom = null;
        }

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Initialize empty seating chart - each desk holds a list of students
            const seating = [];
            for (let r = 0; r < this.rows; r++) {
                seating[r] = [];
                for (let c = 0; c < this.columns; c++) {
                    seating[r][c] = [];
                }
            }

            // Mark blocked desks as unavailable
            this.blockedDesks.forEach(key => {
                const [row, col] = key.split(',').map(Number);
                seating[row][col] = "BLOCKED";
            });

            // Shuffle students for random placement
            const shuffledStudents = [...this.students];
            this._shuffle(shuffledStudents);

            // Try to place each student
            let success = true;
            for (const student of shuffledStudents) {
                let placed = false;

                // Get all available desk positions
                const positions = [];
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.columns; c++) {
                        if (seating[r][c] !== "BLOCKED") {
                            positions.push([r, c]);
                        }
                    }
                }

                // Strategy: Even distribution - always prefer desks with fewest students
                // Shuffle first for randomness among equal desks
                this._shuffle(positions);

                // Sort by number of students (fewest first)
                positions.sort((a, b) => {
                    return seating[a[0]][a[1]].length - seating[b[0]][b[1]].length;
                });

                // Try to place student in a valid position
                for (const [row, col] of positions) {
                    if (this._checkConstraints(seating, student, row, col)) {
                        seating[row][col].push(student);
                        placed = true;
                        break;
                    }
                }

                if (!placed) {
                    success = false;
                    break;
                }
            }

            if (success) {
                return seating;
            }
        }

        throw new Error(
            `Could not generate a valid seating chart after ${maxAttempts} attempts. ` +
            `Constraints may be too restrictive.`
        );
    }

    // Seeded random for reproducibility
    _createSeededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    _shuffle(array) {
        if (this._seededRandom) {
            // Fisher-Yates shuffle with seeded random
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(this._seededRandom() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        } else {
            // Standard Fisher-Yates shuffle
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    }
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeatingChartGenerator;
}
