# Seating Chart Generator

A Python-based tool for teachers to generate random seating charts with customizable constraints.

## Features

- Define classroom layout (rows and columns)
- Block off specific seats that aren't available
- Specify students who cannot sit next to each other
- Require specific students to sit in certain rows or columns
- Generate random seating arrangements that satisfy all constraints

## Requirements

- Python 3.6+
- PyYAML library

Install dependencies:
```bash
pip install pyyaml
```

## Usage

Basic usage:
```bash
python seating_chart.py class_period1.yaml
```

Specify a custom classroom layout:
```bash
python seating_chart.py class_period1.yaml --classroom my_classroom.yaml
```

Use a seed for reproducible results:
```bash
python seating_chart.py class_period1.yaml --seed 42
```

## Configuration Files

### Classroom Layout File (classroom.yaml)

Defines the physical layout of your classroom:

```yaml
# Number of rows (front to back)
rows: 4

# Number of columns (left to right)
columns: 6

# Optional: Block off specific seats (1-indexed)
blocked_seats:
  - row: 2
    column: 3
  - row: 4
    column: 6
```

### Student File (e.g., class_period1.yaml)

Lists students and their seating constraints:

```yaml
students:
  - Alice
  - Bob
  - Charlie
  # ... more students

constraints:
  # Students who cannot sit next to each other (up/down/left/right)
  cannot_sit_together:
    - [Alice, Bob]           # Two students
    - [Charlie, Diana, Emma] # Three or more students (none can sit next to each other)

  # Students who must be in a specific row (1 = front row)
  row_requirements:
    - student: Henry
      row: 1

  # Students who must be in a specific column (1 = leftmost)
  column_requirements:
    - student: Tom
      column: 1
```

All constraint sections are optional. You can have:
- A simple student list with no constraints
- Just cannot_sit_together constraints
- Any combination of constraints

## Example Output

```
===============================================================
                   FRONT OF CLASSROOM
===============================================================
|   Sarah   |   Quinn   |   Liam    |   Kate    |   Iris    |   Jack    |
---------------------------------------------------------------
|   Maya    |    [X]    |   Noah    |  Olivia   |   Peter   |   Ryan    |
---------------------------------------------------------------
|   Grace   |   Frank   |   Emma    |  Charlie  |   Alice   |   Diana   |
---------------------------------------------------------------
|    Tom    |   Henry   |    Bob    |  [empty]  |  [empty]  |    [X]    |
---------------------------------------------------------------
                    BACK OF CLASSROOM
===============================================================

Left side ← → Right side
```

Legend:
- Student names: Occupied seats
- `[X]`: Blocked seats (not available)
- `[empty]`: Empty seats

## Tips

- If the script fails to generate a seating chart after 1000 attempts, your constraints may be too restrictive
- Try reducing the number of constraints or adding more available seats
- Use the `--seed` option when you want to reproduce the same seating chart later
- Rows are numbered from front (1) to back
- Columns are numbered from left (1) to right
