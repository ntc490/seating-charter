# Seating Chart Generator - Web Version

A client-side web application for generating random seating charts with customizable classroom layouts and student placement rules.

## Features

- **Zero Installation**: Run directly in your browser
- **Privacy First**: All processing happens locally - no student data is transmitted
- **FERPA Compliant**: Student information never leaves your computer
- **Easy to Use**: Simple drag-and-drop interface
- **Flexible**: Supports desks with multiple students (2-3 per desk)
- **Smart Constraints**:
  - Row/column requirements
  - "Cannot sit together" rules (same OR adjacent desks)
  - Large students (count as 2 towards desk capacity)
  - Custom desk capacities
- **Reproducible**: Use random seeds for consistent results
- **Print Friendly**: Print or save seating charts

## How to Use

### Online (GitHub Pages)

Visit: `https://yourusername.github.io/seating-chart/web/`

### Offline

1. Download this entire `web/` directory
2. Open `index.html` in any modern web browser
3. Works completely offline!

### Creating Seating Charts

1. **Upload classroom.yaml** - Defines your classroom layout
   - Number of rows and columns
   - Maximum students per desk
   - Blocked desks
   - Desk capacity overrides

2. **Upload students.yaml** - Lists your students and constraints
   - Student names
   - Large students
   - Cannot sit together rules
   - Row/column requirements

3. **Click "Generate Seating Chart"**

4. **Print or Regenerate** as needed

## Example Files

Example YAML files are provided in the `examples/` directory:
- `classroom.yaml` - Sample classroom layout (4 rows × 6 columns)
- `students.yaml` - Sample student list with constraints

You can download these directly from the app interface.

## YAML File Format

### classroom.yaml

```yaml
rows: 4
columns: 6

# Maximum students per desk
max_capacity: 3

# Optional: blocked desks (1-indexed)
blocked_desks:
  - row: 2
    column: 3

# Optional: custom capacity for specific desks
desk_capacity_overrides:
  - row: 1
    column: 1
    max: 2
```

### students.yaml

```yaml
students:
  - Alice
  - Bob
  - Charlie

constraints:
  # Students who cannot be at same OR adjacent desks
  cannot_sit_together:
    - [Alice, Bob]

  # Students who count as 2 towards max capacity
  large_students:
    - Charlie

  # Position requirements
  row_requirements:
    - student: Alice
      row: 1  # Must be in front row

  column_requirements:
    - student: Bob
      column: 1  # Must be on left side
```

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Privacy & Security

- **Client-Side Only**: All processing happens in your browser using JavaScript
- **No Server**: No backend server - just static HTML/CSS/JS files
- **No Data Transmission**: Student names never leave your computer
- **No Tracking**: No analytics or tracking scripts
- **Offline Capable**: Works without internet after first load

This makes it safe for use with student data under FERPA regulations.

## Technology Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- [js-yaml](https://github.com/nodeca/js-yaml) for YAML parsing
- Responsive design (works on desktop, tablet, mobile)

## Development

### File Structure

```
web/
├── index.html              # Main application page
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── app.js             # UI logic and file handling
│   ├── seating-generator.js  # Core algorithm
│   └── libs/
│       └── js-yaml.min.js    # YAML parser
├── examples/              # Example YAML files
│   ├── classroom.yaml
│   └── students.yaml
└── README.md
```

### Local Development

Simply open `index.html` in your browser. No build process required!

### Deployment to GitHub Pages

1. Push the `web/` directory to your GitHub repository
2. Go to Settings → Pages
3. Set source to your branch and `/web` folder
4. Your site will be live at `https://username.github.io/repo-name/`

## License

Same as parent project - free to use for educational purposes.

## Support

For issues or questions, please open an issue on GitHub.
