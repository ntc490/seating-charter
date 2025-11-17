# Seating Charter Application

## Overview
A Python-based script for teachers to create seating charts with customizable classroom layouts and student placement rules. Students are assigned to desks that can hold multiple students (typically 2-3 students per desk).

## Requirements

### Input Files

#### 1. Student List (YAML)
- List of student names for a class
- Different files can be created for different classes
- File path should be provided as a script argument
- Must support the following rules:
  - **Separation rules**: Combinations of students that cannot sit at the same desk or adjacent desks
  - **Large students**: Students who require more space and can only share a desk with 1 other student (max 2 total)
  - **Position constraints**:
    - Students that need to be at a desk in a specific row
    - Students that need to be at a desk in a specific column

#### 2. Classroom Layout (YAML)
- Defines the physical desk arrangement
- Specifies number of rows and columns of desks
- **Default desk capacity**: Range of students per desk (e.g., 2-3 students)
- **Blocked desks**: Optional list of desk positions that are unavailable (e.g., broken desks, teacher's desk)
- **Desk capacity overrides**: Optional list of specific desks with custom min/max capacity
- Layout orientation:
  - First row = front of the classroom
  - Last row = back of the classroom
  - Left-most column = left side of the classroom
  - Right-most column = right side of the classroom

### Functionality
- Generate random seating charts that respect all placement rules
- Assign students to desks with even distribution
  - Respect default capacity range (e.g., 2-3 students per desk)
  - Respect "large" student constraints (max 2 students at their desk)
  - Respect desk capacity overrides
  - Balance desk occupancy across the classroom
- Ensure students who can't sit together are not placed at the same desk or adjacent desks
  - Supports groups of 2+ students (any student in the group cannot be at the same/adjacent desk as any other in that group)
- Place students with position constraints:
  - Specific row requirements (desk must be in specified row)
  - Specific column requirements (desk must be in specified column)
- **Random seed support**: Optional `--seed` argument for reproducible seating chart generation

### Definitions

**Desk**: A physical workspace that can accommodate multiple students (typically 2-3). The classroom is arranged as a grid of desks in rows and columns.

**Adjacent desks**: Desks that are directly next to each other (up, down, left, or right). Does not include diagonal desks.

**Large student**: A student who requires more personal space or has materials that take up more room. When a "large" student is assigned to a desk, that desk can hold a maximum of 2 students total (the large student + 1 other).

**Desk capacity**: The number of students that can be assigned to a desk.
- **Default capacity**: Applies to all desks unless overridden (e.g., min: 2, max: 3)
- **Capacity override**: Specific desks can have custom min/max values

**Even distribution**: The algorithm attempts to balance the number of students at each desk, avoiding situations where some desks are full while others are nearly empty, while respecting capacity constraints.

---

## Example YAML Files

### classroom.yaml
```yaml
# Classroom layout configuration
rows: 4
columns: 6

# Default capacity for all desks
default_capacity:
  min: 2
  max: 3

# Optional: Block off specific desks (1-indexed)
blocked_desks:
  - row: 2
    column: 3
  - row: 4
    column: 6

# Optional: Override capacity for specific desks (1-indexed)
desk_capacity_overrides:
  - row: 1      # Front left desk
    column: 1
    min: 1      # Can have just 1 student
    max: 2      # Max 2 students
  - row: 4      # Back right desk
    column: 5
    min: 3      # Must have 3 students
    max: 3
```

### students.yaml
```yaml
# Student list and constraints

students:
  - Alice
  - Bob
  - Charlie
  - Diana
  - Emma
  - Frank
  - Grace
  - Henry
  - Iris
  - Jack
  - Kate
  - Liam

constraints:
  # Students who cannot sit at the same desk OR adjacent desks
  cannot_sit_together:
    - [Alice, Bob]           # Alice and Bob talk too much
    - [Charlie, Diana]       # Charlie and Diana distract each other
    - [Emma, Frank, Grace]   # These three can't be near ANY others in this group

  # Students who need more space (max 2 students at their desk)
  large_students:
    - Henry    # Henry uses a wheelchair
    - Iris     # Iris has lots of art supplies

  # Students who must be at a desk in a specific row (1-indexed, 1 = front)
  row_requirements:
    - student: Jack
      row: 1   # Jack needs to sit in the front row

  # Students who must be at a desk in a specific column (1-indexed, 1 = leftmost)
  column_requirements:
    - student: Kate
      column: 1  # Kate needs to sit on the left side
```

---

## Usage Examples

### Basic usage
```bash
python seating_chart.py students.yaml --classroom classroom.yaml
```

### With random seed for reproducibility
```bash
python seating_chart.py students.yaml --classroom classroom.yaml --seed 42
```

### Multiple classes with different student lists
```bash
python seating_chart.py class_period1.yaml --classroom classroom.yaml
python seating_chart.py class_period2.yaml --classroom classroom.yaml
```
