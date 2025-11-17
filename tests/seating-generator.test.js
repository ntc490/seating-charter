// tests/seating-generator.test.js

// Import the class (you'll need to export it)
const SeatingChartGenerator = require('../js/seating-generator.js');

describe('SeatingChartGenerator', () => {

  describe('Validation', () => {
    test('should throw error if too many students for capacity', () => {
      const classroom = { rows: 2, columns: 2, max_capacity: 3.0 };
      const students = {
        students: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
      };

      expect(() => {
        new SeatingChartGenerator(classroom, students);
      }).toThrow('Too many students');
    });

    test('should validate row requirements are within bounds', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          row_requirements: [{ student: 'Alice', row: 10 }]
        }
      };

      expect(() => {
        new SeatingChartGenerator(classroom, students);
      }).toThrow('out of bounds');
    });

    test('should validate column requirements are within bounds', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          column_requirements: [{ student: 'Alice', column: 10 }]
        }
      };

      expect(() => {
        new SeatingChartGenerator(classroom, students);
      }).toThrow('out of bounds');
    });
  });

  describe('Capacity Calculation', () => {
    test('should calculate capacity correctly with large students', () => {
      const classroom = { rows: 2, columns: 2, max_capacity: 3.0 };
      const students = {
        students: ['A', 'B', 'C', 'D', 'E'],
        constraints: {
          large_students: ['A', 'B'] // 2 large (3.0) + 3 regular (3.0) = 6.0 total weight
        }
      };

      // Total capacity: 4 desks * 3.0 = 12.0
      // Should NOT throw with 6.0 weight
      expect(() => {
        new SeatingChartGenerator(classroom, students);
      }).not.toThrow();
    });

    test('should detect when large students cause overflow', () => {
      const classroom = { rows: 1, columns: 1, max_capacity: 2.0 };
      const students = {
        students: ['A', 'B', 'C'],
        constraints: {
          large_students: ['A', 'B'] // 2 large (3.0) + 1 regular (1.0) = 4.0 total
        }
      };

      // Total capacity: 1 desk * 2.0 = 2.0
      // Should throw with 4.0 weight
      expect(() => {
        new SeatingChartGenerator(classroom, students);
      }).toThrow('Too many students');
    });
  });

  describe('Desk Capacity', () => {
    test('should respect default desk capacity', () => {
      const classroom = { rows: 2, columns: 2, max_capacity: 3.0 };
      const students = { students: ['A', 'B', 'C', 'D'] };

      const generator = new SeatingChartGenerator(classroom, students);
      expect(generator._getDeskMaxCapacity(0, 0)).toBe(3.0);
    });

    test('should respect desk capacity overrides', () => {
      const classroom = {
        rows: 2,
        columns: 2,
        max_capacity: 3.0,
        desk_capacity_overrides: [
          { row: 1, column: 1, max: 2.5 }
        ]
      };
      const students = { students: ['A', 'B'] };

      const generator = new SeatingChartGenerator(classroom, students);
      expect(generator._getDeskMaxCapacity(0, 0)).toBe(2.5); // Overridden
      expect(generator._getDeskMaxCapacity(0, 1)).toBe(3.0); // Default
    });
  });

  describe('Constraint Checking', () => {
    test('should enforce row requirements', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          row_requirements: [{ student: 'Alice', row: 1 }]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[[], [], []], [[], [], []], [[], [], []]];

      // Alice should only be allowed in row 0 (1-indexed row 1)
      expect(generator._checkConstraints(seating, 'Alice', 0, 0)).toBe(true);
      expect(generator._checkConstraints(seating, 'Alice', 1, 0)).toBe(false);
      expect(generator._checkConstraints(seating, 'Alice', 2, 0)).toBe(false);
    });

    test('should enforce column requirements', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          column_requirements: [{ student: 'Alice', column: 2 }]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[[], [], []], [[], [], []], [[], [], []]];

      // Alice should only be allowed in column 1 (1-indexed column 2)
      expect(generator._checkConstraints(seating, 'Alice', 0, 0)).toBe(false);
      expect(generator._checkConstraints(seating, 'Alice', 0, 1)).toBe(true);
      expect(generator._checkConstraints(seating, 'Alice', 0, 2)).toBe(false);
    });

    test('should prevent students from sitting together at same desk', () => {
      const classroom = { rows: 2, columns: 2, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          cannot_sit_together: [['Alice', 'Bob']]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[['Alice'], []], [[], []]];

      // Bob should not be allowed at same desk as Alice
      expect(generator._checkConstraints(seating, 'Bob', 0, 0)).toBe(false);
      // Bob should not be allowed at adjacent desk (0,1) either
      expect(generator._checkConstraints(seating, 'Bob', 0, 1)).toBe(false);
      // Bob should be allowed at diagonal desk (1,1)
      expect(generator._checkConstraints(seating, 'Bob', 1, 1)).toBe(true);
    });

    test('should prevent students from sitting at adjacent desks', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          cannot_sit_together: [['Alice', 'Bob']]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[[], [], []], [[], ['Alice'], []], [[], [], []]];

      // Bob should not be allowed adjacent to Alice
      expect(generator._checkConstraints(seating, 'Bob', 0, 1)).toBe(false); // Above
      expect(generator._checkConstraints(seating, 'Bob', 2, 1)).toBe(false); // Below
      expect(generator._checkConstraints(seating, 'Bob', 1, 0)).toBe(false); // Left
      expect(generator._checkConstraints(seating, 'Bob', 1, 2)).toBe(false); // Right
      expect(generator._checkConstraints(seating, 'Bob', 0, 0)).toBe(true);  // Diagonal OK
    });

    test('should enforce large student capacity limits', () => {
      const classroom = { rows: 1, columns: 1, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          large_students: ['Alice', 'Bob']
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[['Alice']]]  // Alice (1.5) already at desk

      // Bob (1.5) + Alice (1.5) = 3.0, should fit exactly
      expect(generator._checkConstraints(seating, 'Bob', 0, 0)).toBe(true);
    });

    test('should prevent exceeding cramped desk capacity', () => {
      const classroom = {
        rows: 2,
        columns: 1,
        max_capacity: 2.5
      };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          large_students: ['Alice', 'Bob']
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[['Alice']], [[]]]  // Alice (1.5) already at desk

      // Bob (1.5) + Alice (1.5) = 3.0, exceeds 2.5 max
      expect(generator._checkConstraints(seating, 'Bob', 0, 0)).toBe(false);
    });

    test('should allow 1 large + 1 regular at cramped desk', () => {
      const classroom = {
        rows: 1,
        columns: 1,
        max_capacity: 2.5
      };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          large_students: ['Alice']
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = [[['Alice']]]  // Alice (1.5) already at desk

      // Bob (1.0) + Alice (1.5) = 2.5, fits exactly
      expect(generator._checkConstraints(seating, 'Bob', 0, 0)).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    test('should correctly identify adjacent desks', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = { students: ['A'] };
      const generator = new SeatingChartGenerator(classroom, students);

      // Middle desk (1, 1) should have 4 neighbors
      const neighbors = generator._getNeighbors(1, 1);
      expect(neighbors).toHaveLength(4);
      expect(neighbors).toContainEqual([0, 1]); // Up
      expect(neighbors).toContainEqual([2, 1]); // Down
      expect(neighbors).toContainEqual([1, 0]); // Left
      expect(neighbors).toContainEqual([1, 2]); // Right
    });

    test('should handle corner desk neighbors', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = { students: ['A'] };
      const generator = new SeatingChartGenerator(classroom, students);

      // Corner desk (0, 0) should have 2 neighbors
      const neighbors = generator._getNeighbors(0, 0);
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContainEqual([1, 0]); // Down
      expect(neighbors).toContainEqual([0, 1]); // Right
    });

    test('should handle blocked desks', () => {
      const classroom = {
        rows: 2,
        columns: 2,
        max_capacity: 3.0,
        blocked_desks: [{ row: 1, column: 1 }]
      };
      const students = { students: ['A'] };
      const generator = new SeatingChartGenerator(classroom, students);

      expect(generator.blockedDesks.has('0,0')).toBe(true);
    });
  });

  describe('Full Generation', () => {
    test('should successfully generate valid seating chart', () => {
      const classroom = { rows: 2, columns: 3, max_capacity: 3.0 };
      const students = { students: ['A', 'B', 'C', 'D'] };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = generator.generate();

      // Should be 2 rows
      expect(seating).toHaveLength(2);
      expect(seating[0]).toHaveLength(3);

      // Count total students placed
      let totalPlaced = 0;
      for (const row of seating) {
        for (const desk of row) {
          if (Array.isArray(desk)) {
            totalPlaced += desk.length;
          }
        }
      }
      expect(totalPlaced).toBe(4);
    });

    test('should respect all constraints in generated chart', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob', 'Charlie'],
        constraints: {
          row_requirements: [{ student: 'Alice', row: 1 }],
          cannot_sit_together: [['Bob', 'Charlie']]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);
      const seating = generator.generate();

      // Alice should be in row 0 (1-indexed row 1)
      let aliceRow = -1;
      for (let r = 0; r < seating.length; r++) {
        for (let c = 0; c < seating[r].length; c++) {
          if (Array.isArray(seating[r][c]) && seating[r][c].includes('Alice')) {
            aliceRow = r;
          }
        }
      }
      expect(aliceRow).toBe(0);
    });

    test('should throw error if constraints are impossible', () => {
      const classroom = { rows: 1, columns: 1, max_capacity: 3.0 };
      const students = {
        students: ['Alice', 'Bob'],
        constraints: {
          cannot_sit_together: [['Alice', 'Bob']]
        }
      };

      const generator = new SeatingChartGenerator(classroom, students);

      // Only 1 desk, but Alice and Bob can't sit together
      expect(() => {
        generator.generate(10); // Try only 10 times for speed
      }).toThrow('Could not generate');
    });

    test('should generate same result with same seed', () => {
      const classroom = { rows: 3, columns: 3, max_capacity: 3.0 };
      const students = { students: ['A', 'B', 'C', 'D', 'E'] };

      const generator1 = new SeatingChartGenerator(classroom, students);
      const seating1 = generator1.generate(1000, 42);

      const generator2 = new SeatingChartGenerator(classroom, students);
      const seating2 = generator2.generate(1000, 42);

      expect(seating1).toEqual(seating2);
    });
  });
});
