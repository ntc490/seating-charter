#!/usr/bin/env python3
"""
Seating Chart Generator for Teachers

This script generates random seating charts based on classroom layout
and student constraints specified in YAML files.
"""

import argparse
import yaml
import random
from typing import List, Dict, Tuple, Optional
import sys


class SeatingChartGenerator:
    def __init__(self, classroom_config: Dict, students_config: Dict):
        self.rows = classroom_config['rows']
        self.columns = classroom_config['columns']
        self.students = students_config['students']
        self.constraints = students_config.get('constraints', {})

        # Parse blocked seats from classroom config
        self.blocked_seats = set()
        for blocked in classroom_config.get('blocked_seats', []):
            # Convert to 0-indexed
            self.blocked_seats.add((blocked['row'] - 1, blocked['column'] - 1))

        # Parse constraints
        self.cannot_sit_together = self.constraints.get('cannot_sit_together', [])
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
        total_seats = self.rows * self.columns
        available_seats = total_seats - len(self.blocked_seats)
        if len(self.students) > available_seats:
            raise ValueError(
                f"Too many students ({len(self.students)}) for available seats ({available_seats})"
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

    def _get_neighbors(self, row: int, col: int) -> List[Tuple[int, int]]:
        """Get neighboring seat positions (up, down, left, right)."""
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

    def _check_constraints(self, seating: List[List[Optional[str]]],
                          student: str, row: int, col: int) -> bool:
        """Check if placing a student at (row, col) violates constraints."""
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

        # Check cannot sit together constraints
        neighbors = self._get_neighbors(row, col)
        for neighbor_row, neighbor_col in neighbors:
            neighbor_student = seating[neighbor_row][neighbor_col]
            if neighbor_student:
                # Check if these two students cannot sit together
                for pair in self.cannot_sit_together:
                    if (student in pair and neighbor_student in pair):
                        return False

        return True

    def generate(self, max_attempts: int = 1000) -> List[List[Optional[str]]]:
        """Generate a seating chart that satisfies all constraints."""
        for attempt in range(max_attempts):
            # Initialize empty seating chart
            seating = [[None for _ in range(self.columns)] for _ in range(self.rows)]

            # Mark blocked seats as unavailable
            for row, col in self.blocked_seats:
                seating[row][col] = "BLOCKED"

            # Shuffle students for random placement
            shuffled_students = self.students.copy()
            random.shuffle(shuffled_students)

            # Try to place each student
            success = True
            for student in shuffled_students:
                placed = False

                # Get all available positions (not None and not BLOCKED)
                positions = [
                    (r, c)
                    for r in range(self.rows)
                    for c in range(self.columns)
                    if seating[r][c] is None
                ]

                # Shuffle positions for randomness
                random.shuffle(positions)

                # Try to place student in a valid position
                for row, col in positions:
                    if self._check_constraints(seating, student, row, col):
                        seating[row][col] = student
                        placed = True
                        break

                if not placed:
                    success = False
                    break

            if success:
                return seating

        raise RuntimeError(
            f"Could not generate a valid seating chart after {max_attempts} attempts. "
            "Constraints may be too restrictive."
        )

    def print_chart(self, seating: List[List[Optional[str]]]):
        """Print the seating chart in a readable format."""
        # Calculate column widths
        max_name_length = max(len(name) for name in self.students) if self.students else 5
        col_width = max(max_name_length + 2, 10)

        print("\n" + "="*((col_width + 1) * self.columns + 1))
        print("FRONT OF CLASSROOM".center((col_width + 1) * self.columns + 1))
        print("="*((col_width + 1) * self.columns + 1))

        for row_idx, row in enumerate(seating):
            row_str = "|"
            for seat in row:
                if seat == "BLOCKED":
                    row_str += f" {'[X]':^{col_width-1}}|"
                elif seat:
                    row_str += f" {seat:^{col_width-1}}|"
                else:
                    row_str += f" {'[empty]':^{col_width-1}}|"
            print(row_str)
            print("-"*((col_width + 1) * self.columns + 1))

        print("BACK OF CLASSROOM".center((col_width + 1) * self.columns + 1))
        print("="*((col_width + 1) * self.columns + 1))
        print(f"\nLeft side ← → Right side\n")


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
