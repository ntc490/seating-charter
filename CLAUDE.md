# Seating Charter Web Application

## Overview
A client-side web application for teachers to create seating charts with customizable classroom layouts and student placement rules. Students are assigned to desks that can hold multiple students (typically 2-3 students per desk).

**Key Features:**
- 100% client-side - no server needed, no data transmitted
- FERPA compliant - all processing happens in browser
- Works on any device with a modern web browser
- Can be used online (GitHub Pages) or offline (download and open locally)

## Application Requirements

### Input Files

#### 1. Student List (YAML)
- List of student names for a class
- Different files can be created for different classes
- File is uploaded through the web interface
- Must support the following rules:
  - **Separation rules**: Combinations of students that cannot sit at the same desk or adjacent desks
  - **Large students**: Students who require more space and count as 2 towards desk capacity
  - **Position constraints**:
    - Students that need to be at a desk in a specific row
    - Students that need to be at a desk in a specific column

#### 2. Classroom Layout (YAML)
- Defines the physical desk arrangement
- Specifies number of rows and columns of desks
- **Maximum desk capacity**: Maximum number of students per desk (e.g., 3 students)
- **Blocked desks**: Optional list of desk positions that are unavailable (e.g., broken desks, teacher's desk)
- **Desk capacity overrides**: Optional list of specific desks with custom maximum capacity
- Layout orientation:
  - First row = front of the classroom
  - Last row = back of the classroom
  - Left-most column = left side of the classroom
  - Right-most column = right side of the classroom

### Functionality
- Generate random seating charts that respect all placement rules
- Assign students to desks with even distribution
  - Spread students evenly across all available desks
  - Fill desks one student at a time until maximum capacity is reached
  - Respect maximum desk capacity (default or overridden)
  - Large students count as 2 students towards the maximum capacity
  - Minimize empty desks by distributing evenly
- Ensure students who can't sit together are not placed at the same desk or adjacent desks
  - Supports groups of 2+ students (any student in the group cannot be at the same/adjacent desk as any other in that group)
- Place students with position constraints:
  - Specific row requirements (desk must be in specified row)
  - Specific column requirements (desk must be in specified column)
- **Random seed support**: Optional seed input for reproducible seating chart generation
- **Print support**: Print-friendly output for classroom use
- **Regenerate**: Create new random arrangements with different seeds

### Definitions

**Desk**: A physical workspace that can accommodate multiple students (typically 2-3). The classroom is arranged as a grid of desks in rows and columns.

**Adjacent desks**: Desks that are directly next to each other (up, down, left, or right). Does not include diagonal desks.

**Large student**: A student who requires more personal space or has materials that take up more room. Large students count as 2 students towards the desk's maximum capacity. For example, if a desk has a max capacity of 3, a large student plus one regular student would fill the desk (2 + 1 = 3).

**Desk capacity**: The maximum number of students that can be assigned to a desk.
- **Default capacity**: Applies to all desks unless overridden (e.g., max: 3)
- **Capacity override**: Specific desks can have custom maximum capacity (e.g., max: 2 or max: 4)

**Even distribution**: The algorithm spreads students across all available desks evenly, placing one student at a time. This minimizes empty desks and ensures balanced distribution before any desk becomes full.

---

## Technology Stack

### Frontend
- **HTML5**: Semantic markup, file upload API
- **CSS3**: Responsive design, print styles
- **JavaScript (ES6+)**: Core algorithm, UI handling

### Libraries
- **js-yaml**: YAML parsing in browser (client-side)

### Deployment
- **GitHub Pages**: Free static hosting
- **Offline capable**: Can run locally without internet

---

## Example YAML Files

Example files are provided in the `examples/` directory:

### classroom.yaml
```yaml
# Classroom layout configuration
rows: 4
columns: 6

# Maximum students per desk (default for all desks)
max_capacity: 3

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
    max: 2      # Max 2 students
  - row: 4      # Back right desk
    column: 5
    max: 4      # Max 4 students (larger desk)
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

  # Students who need more space (count as 2 towards max capacity)
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

## Project Structure

```
seating-charter/
├── index.html              # Main application page
├── css/
│   └── styles.css         # All styling (Riverton HS colors)
├── js/
│   ├── app.js             # UI logic and file handling
│   ├── seating-generator.js  # Core algorithm
│   └── libs/
│       └── js-yaml.min.js    # YAML parser library
├── examples/              # Example YAML files for download
│   ├── classroom.yaml
│   └── students.yaml
├── README.md              # User documentation
├── CLAUDE.md              # Project specification (this file)
└── DEPLOYMENT.md          # GitHub Pages deployment guide
```

---

## Design Principles

### Privacy & Security
- **No server processing**: All computation happens in the browser
- **No data transmission**: Student names never leave the user's computer
- **FERPA compliant**: Safe for use with student data
- **No tracking**: No analytics or third-party scripts

### Accessibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (desktop, tablet, mobile)
- Keyboard accessible
- Print-friendly output

### User Experience
- Simple file upload interface
- Clear error messages
- Loading indicators
- Immediate visual feedback
- One-click print and regenerate

### Styling
- Riverton High School colors (purple and silver theme)
- Professional, educational appearance
- Clean, uncluttered interface
- High contrast for readability
