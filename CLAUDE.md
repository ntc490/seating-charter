# Seating Charter Application

## Overview
A Python-based script for teachers to create seating charts with customizable classroom layouts and student placement rules.

## Requirements

### Input Files

#### 1. Student List (YAML)
- List of student names for a class
- Different files can be created for different classes
- File path should be provided as a script argument
- Must support the following rules:
  - **Separation rules**: Combinations of students that cannot sit next to each other
  - **Position constraints**: Students that need to be in a specific row or column

#### 2. Classroom Layout (YAML)
- Defines the physical seat arrangement
- Specifies number of rows and columns
- **Blocked seats**: Optional list of seat positions that are unavailable (e.g., broken desks, teacher's desk)
- Layout orientation:
  - First row = front of the classroom
  - Last row = back of the classroom
  - Left-most column = left side of the classroom
  - Right-most column = right side of the classroom

### Functionality
- Generate random seating charts that respect all placement rules
- Ensure students who can't sit together are not placed adjacent to each other
  - Supports groups of 2+ students (any student in the group cannot sit next to any other in that group)
- Place students with row/column constraints in their required positions
- **Random seed support**: Optional `--seed` argument for reproducible seating chart generation
