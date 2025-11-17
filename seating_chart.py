#!/usr/bin/env python3
"""
Seating Chart Generator for Teachers

This script generates random seating charts based on classroom layout
and student constraints specified in YAML files.

Each desk can hold multiple students (typically 2-3).
"""

import argparse
import yaml
import random
from typing import List, Dict, Tuple, Optional, Set
import sys


class SeatingChartGenerator:
    def __init__(self, classroom_config: Dict, students_config: Dict):
        self.rows = classroom_config['rows']
        self.columns = classroom_config['columns']
        self.students = students_config['students']
        self.constraints = students_config.get('constraints', {})

        # Parse default desk capacity
        default_cap = classroom_config.get('default_capacity', {'min': 2, 'max': 3})
        self.default_min_capacity = default_cap.get('min', 2)
        self.default_max_capacity = default_cap.get('max', 3)

        # Parse blocked desks from classroom config
        self.blocked_desks = set()
        for blocked in classroom_config.get('blocked_desks', []):
            # Convert to 0-indexed
            self.blocked_desks.add((blocked['row'] - 1, blocked['column'] - 1))

        # Parse desk capacity overrides
        self.desk_capacity_overrides = {}
        for override in classroom_config.get('desk_capacity_overrides', []):
            row = override['row'] - 1  # Convert to 0-indexed
            col = override['column'] - 1
            self.desk_capacity_overrides[(row, col)] = {
                'min': override.get('min', self.default_min_capacity),
                'max': override.get('max', self.default_max_capacity)
            }

        # Parse constraints
        self.cannot_sit_together = self.constraints.get('cannot_sit_together', [])
        self.large_students = set(self.constraints.get('large_students', []))
        self.row_requirements = {
            req['student']: req['row']
            for req in self.constraints.get('row_requirements', [])
        }
        self.column_requirements = {
            req['student']: req['column']
            for req in self.constraints.get('column_requirements', [])
        }

        # Validate inputs
        self._validate()

    def _validate(self):
        """Validate the configuration inputs."""
        total_desks = self.rows * self.columns
        available_desks = total_desks - len(self.blocked_desks)

        # Calculate maximum capacity
        max_capacity = 0
        for row in range(self.rows):
            for col in range(self.columns):
                if (row, col) not in self.blocked_desks:
                    capacity = self._get_desk_capacity(row, col)
                    max_capacity += capacity['max']

        if len(self.students) > max_capacity:
            raise ValueError(
                f"Too many students ({len(self.students)}) for maximum desk capacity ({max_capacity})"
            )

        # Validate row/column requirements are within bounds
        for student, row in self.row_requirements.items():
            if row < 1 or row > self.rows:
                raise ValueError(
                    f"Row {row} for student {student} is out of bounds (1-{self.rows})"
                )

        for student, col in self.column_requirements.items():
            if col < 1 or col > self.columns:
                raise ValueError(
                    f"Column {col} for student {student} is out of bounds (1-{self.columns})"
                )

    def _get_desk_capacity(self, row: int, col: int) -> Dict[str, int]:
        """Get the min/max capacity for a specific desk."""
        if (row, col) in self.desk_capacity_overrides:
            return self.desk_capacity_overrides[(row, col)]
        return {'min': self.default_min_capacity, 'max': self.default_max_capacity}

    def _get_neighbors(self, row: int, col: int) -> List[Tuple[int, int]]:
        """Get neighboring desk positions (up, down, left, right)."""
        neighbors = []
        # Up
        if row > 0:
            neighbors.append((row - 1, col))
        # Down
        if row < self.rows - 1:
            neighbors.append((row + 1, col))
        # Left
        if col > 0:
            neighbors.append((row, col - 1))
        # Right
        if col < self.columns - 1:
            neighbors.append((row, col + 1))
        return neighbors

    def _get_students_at_desk(self, seating: List[List[List[str]]], row: int, col: int) -> List[str]:
        """Get list of students at a specific desk."""
        return seating[row][col] if seating[row][col] != "BLOCKED" else []

    def _get_students_at_adjacent_desks(self, seating: List[List[List[str]]], row: int, col: int) -> Set[str]:
        """Get all students at desks adjacent to the specified desk."""
        students = set()
        for neighbor_row, neighbor_col in self._get_neighbors(row, col):
            desk_students = self._get_students_at_desk(seating, neighbor_row, neighbor_col)
            if isinstance(desk_students, list):
                students.update(desk_students)
        return students

    def _check_constraints(self, seating: List[List[List[str]]],
                          student: str, row: int, col: int) -> bool:
        """Check if placing a student at desk (row, col) violates constraints."""
        # Check row requirements
        if student in self.row_requirements:
            required_row = self.row_requirements[student] - 1  # Convert to 0-indexed
            if row != required_row:
                return False

        # Check column requirements
        if student in self.column_requirements:
            required_col = self.column_requirements[student] - 1  # Convert to 0-indexed
            if col != required_col:
                return False

        # Get students currently at this desk
        current_desk_students = self._get_students_at_desk(seating, row, col)

        # Check desk capacity
        capacity = self._get_desk_capacity(row, col)
        max_capacity = capacity['max']

        # If student is large or any student at desk is large, max is 2
        if student in self.large_students:
            max_capacity = min(max_capacity, 2)
        for desk_student in current_desk_students:
            if desk_student in self.large_students:
                max_capacity = min(max_capacity, 2)

        if len(current_desk_students) >= max_capacity:
            return False

        # Check cannot sit together constraints - same desk
        for desk_student in current_desk_students:
            for group in self.cannot_sit_together:
                if student in group and desk_student in group:
                    return False

        # Check cannot sit together constraints - adjacent desks
        adjacent_students = self._get_students_at_adjacent_desks(seating, row, col)
        for adjacent_student in adjacent_students:
            for group in self.cannot_sit_together:
                if student in group and adjacent_student in group:
                    return False

        return True

    def generate(self, max_attempts: int = 1000) -> List[List[List[str]]]:
        """Generate a seating chart that satisfies all constraints."""
        for attempt in range(max_attempts):
            # Initialize empty seating chart - each desk holds a list of students
            seating = [[[] for _ in range(self.columns)] for _ in range(self.rows)]

            # Mark blocked desks as unavailable
            for row, col in self.blocked_desks:
                seating[row][col] = "BLOCKED"

            # Shuffle students for random placement
            shuffled_students = self.students.copy()
            random.shuffle(shuffled_students)

            # Try to place each student
            success = True
            for student in shuffled_students:
                placed = False

                # Get all available desk positions
                positions = [
                    (r, c)
                    for r in range(self.rows)
                    for c in range(self.columns)
                    if seating[r][c] != "BLOCKED"
                ]

                # Strategy: Prefer desks with students but not full (encourages grouping)
                # Sort priority: partially filled > empty > (full desks filtered out)
                random.shuffle(positions)

                def sort_key(pos):
                    row, col = pos
                    current_count = len(seating[row][col])
                    capacity = self._get_desk_capacity(row, col)
                    min_cap = capacity['min']
                    max_cap = capacity['max']

                    # Check if any student at this desk is large
                    if any(s in self.large_students for s in seating[row][col]):
                        max_cap = min(max_cap, 2)

                    # Priority tiers:
                    # 0 = partially filled desks (1+ students, not full)
                    # 1 = empty desks
                    # 2 = will be filtered out (full desks)
                    if current_count > 0 and current_count < max_cap:
                        return (0, current_count)  # Prefer partially filled
                    elif current_count == 0:
                        return (1, 0)  # Then empty
                    else:
                        return (2, current_count)  # Shouldn't try full desks

                positions.sort(key=sort_key)

                # Try to place student in a valid position
                for row, col in positions:
                    if self._check_constraints(seating, student, row, col):
                        seating[row][col].append(student)
                        placed = True
                        break

                if not placed:
                    success = False
                    break

            if success:
                # Note: We don't strictly enforce minimum capacity as it may be
                # impossible to satisfy with certain student counts
                return seating

        raise RuntimeError(
            f"Could not generate a valid seating chart after {max_attempts} attempts. "
            "Constraints may be too restrictive."
        )

    def _verify_min_capacities(self, seating: List[List[List[str]]]) -> bool:
        """Verify that all desks meet their minimum capacity requirements."""
        for row in range(self.rows):
            for col in range(self.columns):
                if seating[row][col] == "BLOCKED":
                    continue

                desk_students = seating[row][col]
                if len(desk_students) == 0:
                    # Empty desks are okay
                    continue

                capacity = self._get_desk_capacity(row, col)
                min_capacity = capacity['min']

                # Check if any student at this desk is "large"
                has_large_student = any(s in self.large_students for s in desk_students)
                if has_large_student:
                    # For large students, we're more lenient - just need at least 1
                    min_capacity = 1

                if len(desk_students) < min_capacity:
                    return False

        return True

    def print_chart(self, seating: List[List[List[str]]]):
        """Print the seating chart in a readable format."""
        # Calculate column widths - need to accommodate multiple students per desk
        max_name_length = max(len(name) for name in self.students) if self.students else 5
        # Width should accommodate up to 3 names separated by commas
        col_width = max((max_name_length * 3) + 6, 20)

        print("\n" + "="*((col_width + 1) * self.columns + 1))
        print("FRONT OF CLASSROOM".center((col_width + 1) * self.columns + 1))
        print("="*((col_width + 1) * self.columns + 1))

        for row_idx, row in enumerate(seating):
            row_str = "|"
            for desk in row:
                if desk == "BLOCKED":
                    row_str += f" {'[X]':^{col_width-1}}|"
                elif isinstance(desk, list) and len(desk) > 0:
                    # Join student names with commas
                    students_str = ", ".join(desk)
                    # Truncate if too long
                    if len(students_str) > col_width - 2:
                        students_str = students_str[:col_width-5] + "..."
                    row_str += f" {students_str:^{col_width-1}}|"
                else:
                    row_str += f" {'[empty]':^{col_width-1}}|"
            print(row_str)
            print("-"*((col_width + 1) * self.columns + 1))

        print("BACK OF CLASSROOM".center((col_width + 1) * self.columns + 1))
        print("="*((col_width + 1) * self.columns + 1))
        print(f"\nLeft side ← → Right side\n")

        # Print summary statistics
        total_students = len(self.students)
        total_desks = self.rows * self.columns - len(self.blocked_desks)
        occupied_desks = sum(
            1 for row in seating for desk in row
            if isinstance(desk, list) and len(desk) > 0
        )
        print(f"Students: {total_students} | Desks: {occupied_desks}/{total_desks} occupied")


def main():
    parser = argparse.ArgumentParser(
        description='Generate a seating chart for a classroom'
    )
    parser.add_argument(
        'students_file',
        help='Path to YAML file containing student names and constraints'
    )
    parser.add_argument(
        '--classroom',
        default='classroom.yaml',
        help='Path to YAML file containing classroom layout (default: classroom.yaml)'
    )
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducible results'
    )

    args = parser.parse_args()

    # Set random seed if provided
    if args.seed is not None:
        random.seed(args.seed)

    # Load configuration files
    try:
        with open(args.classroom, 'r') as f:
            classroom_config = yaml.safe_load(f)

        with open(args.students_file, 'r') as f:
            students_config = yaml.safe_load(f)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML: {e}", file=sys.stderr)
        sys.exit(1)

    # Generate seating chart
    try:
        generator = SeatingChartGenerator(classroom_config, students_config)
        seating = generator.generate()
        generator.print_chart(seating)
    except (ValueError, RuntimeError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
