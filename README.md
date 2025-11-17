# Seating Chart Generator

A privacy-first web application for teachers to create randomized seating charts with customizable classroom layouts and student placement rules.

![Riverton High School Colors](https://img.shields.io/badge/School-Riverton%20High-5a3f8a)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![No Server Required](https://img.shields.io/badge/Server-Not%20Required-green.svg)

## Features

🔒 **Privacy First**
- 100% client-side processing - no server needed
- Student data never leaves your computer
- FERPA compliant - safe for educational use
- No tracking or analytics

🎨 **Flexible Layout**
- Supports multiple students per desk (2-3 typical)
- Custom desk capacities
- Block off unavailable desks
- Define classroom dimensions

📋 **Smart Constraints**
- Keep certain students apart (same or adjacent desks)
- Assign students to specific rows/columns
- "Large students" count as 1.5 towards desk capacity (50% more space)
- Support for groups that can't sit near each other

🎲 **Reproducible Results**
- Use random seeds for consistent seating charts
- Regenerate with one click
- Print-friendly output

## Quick Start

### Option 1: Use Online (Recommended)

Visit the hosted version: **[Your GitHub Pages URL]**

1. Upload your `classroom.yaml` file
2. Upload your `students.yaml` file
3. Click "Generate Seating Chart"
4. Print or regenerate as needed

### Option 2: Run Locally

#### Method A: Direct Open (Simplest)
1. Download this repository
2. Open `index.html` in your web browser
3. Works offline - no installation required!

#### Method B: Local Server (Optional)

For development or testing:

```bash
# Navigate to the project directory
cd seating-charter

# Python 3 (Mac/Linux)
python3 -m http.server 8000

# Python 3 (Windows)
python -m http.server 8000

# Then open in browser:
# http://localhost:8000
```

**Note:** The local server is optional - the app works perfectly by just opening `index.html`!

## YAML File Format

### classroom.yaml

Define your classroom layout:

```yaml
rows: 4
columns: 6

# Maximum capacity per desk (default)
# Regular students = 1.0, Large students = 1.5
max_capacity: 3.0

# Optional: Block off specific desks (1-indexed)
blocked_desks:
  - row: 2
    column: 3

# Optional: Custom capacity for specific desks
desk_capacity_overrides:
  - row: 1
    column: 1
    max: 2.5  # Cramped desk (against wall)
```

### students.yaml

Define your students and constraints:

```yaml
students:
  - Alice
  - Bob
  - Charlie
  - Diana

constraints:
  # Students who can't sit at same OR adjacent desks
  cannot_sit_together:
    - [Alice, Bob]      # These two talk too much
    - [Charlie, Diana]  # These two distract each other

  # Students who need extra space (count as 1.5)
  large_students:
    - Charlie  # Uses wheelchair

  # Position requirements
  row_requirements:
    - student: Alice
      row: 1  # Must be in front row

  column_requirements:
    - student: Bob
      column: 1  # Must be on left side
```

## Example Files

Example YAML files are included in the `examples/` directory:
- `classroom.yaml` - Sample 4x6 classroom layout
- `students.yaml` - Sample student list with various constraints

You can also download these examples directly from the web interface.

## How It Works

The seating chart generator:

1. **Even Distribution**: Spreads students across all desks evenly before filling any desk completely
2. **Constraint Checking**: Ensures all placement rules are respected
3. **Smart Placement**: Large students count as 1.5 towards desk capacity
4. **Random with Seed**: Optional seed for reproducible results

### Classroom Orientation

```
        FRONT OF CLASSROOM
┌─────────┬─────────┬─────────┐
│ Desk 1  │ Desk 2  │ Desk 3  │  Row 1 (Front)
├─────────┼─────────┼─────────┤
│ Desk 4  │ Desk 5  │ Desk 6  │  Row 2
└─────────┴─────────┴─────────┘
        BACK OF CLASSROOM

Left side ← → Right side
```

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

Requires JavaScript enabled.

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Responsive design (Riverton HS colors)
- **JavaScript (ES6+)** - Core algorithm
- **js-yaml** - YAML parsing in browser

No frameworks, no build process, no dependencies to install!

## Privacy & Security

### What Data is Transmitted?
**Nothing.** All processing happens in your browser.

### Is Student Data Stored?
**No.** The app has no backend server or database.

### Is it FERPA Compliant?
**Yes.** Student names never leave your computer.

### Can I Use it Offline?
**Yes.** Download once, use forever - no internet needed.

## Deployment

Want to host your own version?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed GitHub Pages deployment instructions.

**TL;DR:**
1. Fork this repository
2. Enable GitHub Pages in Settings → Pages
3. Select `main` branch and `/ (root)` folder
4. Your site will be at `https://username.github.io/seating-chart/`

## Project Structure

```
seating-charter/
├── index.html              # Main application
├── css/
│   └── styles.css         # Styling (Riverton HS theme)
├── js/
│   ├── app.js             # UI and file handling
│   ├── seating-generator.js  # Core algorithm
│   └── libs/
│       └── js-yaml.min.js    # YAML parser
├── examples/              # Example YAML files
│   ├── classroom.yaml
│   └── students.yaml
├── README.md              # This file
├── CLAUDE.md              # Project specification
└── DEPLOYMENT.md          # GitHub Pages guide
```

## Development

### Making Changes

1. Edit the files directly
2. Test by opening `index.html` in your browser
3. No build process required!

### Testing Locally with Python Server

While not required, you can serve the app locally for development:

```bash
# Navigate to project directory
cd seating-charter

# Start Python's built-in HTTP server
python3 -m http.server 8000
# or on Windows: python -m http.server 8000

# Visit http://localhost:8000 in your browser
```

This mimics how the app will run on GitHub Pages.

### Key Files

- `js/seating-generator.js` - Core algorithm (modify constraints logic here)
- `js/app.js` - UI handling (modify interface behavior here)
- `css/styles.css` - Styling (modify colors/layout here)

## FAQ

**Q: Do I need to install anything?**
A: No! Just open `index.html` in a browser.

**Q: Can I use this on a school Chromebook?**
A: Yes! It works in any browser, no installation needed.

**Q: What if I have more than 3 students per desk?**
A: Adjust `max_capacity` in `classroom.yaml`.

**Q: Can I save my classroom layouts?**
A: Yes! Save your YAML files and reuse them anytime.

**Q: What if the algorithm can't place all students?**
A: The constraints may be too restrictive. Try relaxing some rules.

**Q: Can I print the seating chart?**
A: Yes! Click the "Print" button for a printer-friendly version.

**Q: How do I recreate the same seating chart?**
A: Note the seed number shown (or enter your own), then regenerate with that seed.

## Contributing

This project was created for Riverton High School. Feel free to fork and customize for your school!

## License

MIT License - Free to use and modify for educational purposes.

## Support

- **Bug Reports**: Open an issue on GitHub
- **Questions**: See [CLAUDE.md](CLAUDE.md) for detailed documentation
- **Deployment Help**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Acknowledgments

- Styled for Riverton High School (Silverwolves colors)
- Built with privacy and accessibility in mind
- No student data collection or transmission

---

**Made with ❤️ for teachers**
