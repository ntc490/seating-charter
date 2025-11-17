# Port Seating Chart to Go - Implementation Plan

## Overview
Port the Python seating chart application to Go to provide standalone binaries that teachers can download and run without installing dependencies.

## Phase 1: Go Application Development

### 1. Create Go module structure
- Initialize go.mod with appropriate module name
- Set up project structure:
  - `main.go` - Entry point and CLI
  - `internal/generator/` - Core seating chart logic
  - `internal/config/` - YAML parsing and validation

### 2. Port core functionality
- Implement `SeatingChartGenerator` struct with methods:
  - `NewGenerator()` - Constructor with validation
  - `Generate()` - Main algorithm with constraint checking
  - `PrintChart()` - Formatted output
- Port constraint checking logic:
  - Neighbor detection (up, down, left, right)
  - Cannot sit together validation
  - Row/column requirement checking
- Port seating generation algorithm with retry logic

### 3. YAML parsing
- Add dependency: `gopkg.in/yaml.v3`
- Define Go structs for configs:
  - `ClassroomConfig` (rows, columns, blocked_seats)
  - `StudentsConfig` (students, constraints)
  - `Constraints` (cannot_sit_together, row_requirements, column_requirements)
- Implement YAML file loading with error handling

### 4. CLI implementation
- Choose CLI library:
  - Option A: Standard `flag` package (simpler, no deps)
  - Option B: `cobra` (more features, better for future expansion)
- Match Python CLI interface:
  - Positional: students file path
  - `--classroom` flag (default: classroom.yaml)
  - `--seed` flag for random seed

## Phase 2: Cross-Platform Build Setup

### 1. Configure build targets
Build binaries for the following platforms:
- **macOS x86_64**: `GOOS=darwin GOARCH=amd64`
- **macOS ARM64**: `GOOS=darwin GOARCH=arm64` (Apple Silicon)
- **Windows x86_64**: `GOOS=windows GOARCH=amd64`
- **Linux x86_64**: `GOOS=linux GOARCH=amd64` (for ChromeOS users)

### 2. Create build automation
Option A - Simple Makefile:
```makefile
build-all:
    GOOS=darwin GOARCH=amd64 go build -o bin/seating-chart-darwin-amd64
    GOOS=darwin GOARCH=arm64 go build -o bin/seating-chart-darwin-arm64
    GOOS=windows GOARCH=amd64 go build -o bin/seating-chart-windows-amd64.exe
    GOOS=linux GOARCH=amd64 go build -o bin/seating-chart-linux-amd64
```

Option B - GoReleaser:
- Install and configure GoReleaser
- Create `.goreleaser.yml` configuration
- Automates:
  - Multi-platform builds
  - Checksum generation
  - GitHub release creation
  - Archive creation (zip/tar.gz)

### 3. Binary naming convention
- Format: `seating-chart-{os}-{arch}[.exe]`
- Examples:
  - `seating-chart-darwin-amd64`
  - `seating-chart-darwin-arm64`
  - `seating-chart-windows-amd64.exe`
  - `seating-chart-linux-amd64`

## Phase 3: Distribution & Testing

### 1. Test binaries on each platform
- macOS: Test both Intel and Apple Silicon versions
- Windows: Test on Windows 10/11
- Linux: Test on Ubuntu/Debian (ChromeOS compatibility)
- Verify all features work identically to Python version

### 2. Create installation instructions
Document in README:
- How to download the correct binary for their platform
- How to make binary executable (chmod +x on Unix systems)
- How to add to PATH (optional)
- Basic usage examples

### 3. Set up GitHub releases
- Tag versions (e.g., v1.0.0)
- Upload all platform binaries
- Include checksums for verification
- Provide release notes

## ChromeOS Compatibility

**Answer**: Technically yes, but with important caveats.

ChromeOS supports Linux applications through **Crostini** (Linux container):
- Provide the `linux-amd64` binary
- Users enable Linux apps in ChromeOS settings
- Run the binary in the Linux terminal
- Include ChromeOS-specific instructions in README

**Important limitation - School-managed Chromebooks**:
- School IT departments often disable Crostini/Linux on managed Chromebooks
- Developer mode is typically blocked
- This is done for security and to prevent bypassing content filters

**Recommendations for school users**:
1. **Teacher accounts** may have more privileges than student accounts - worth testing
2. **IT approval** - Some schools whitelist specific applications for teachers
3. **Alternative devices** - Teachers often have Windows/Mac laptops (personal or school-issued)
4. **Future consideration** - A web-based version would be most accessible for school environments

**Action item**: Survey target users (teachers) to understand what devices/platforms they actually use before investing heavily in ChromeOS support.

## Additional Considerations

### 1. Code signing (optional but recommended)
- **macOS**: Sign with Apple Developer certificate to avoid Gatekeeper warnings
- **Windows**: Sign with code signing certificate to avoid SmartScreen warnings

### 2. Package managers (future enhancement)
- Homebrew for macOS: Create formula
- Chocolatey for Windows: Create package
- APT/Snap for Linux: Create packages

### 3. Updates
- Consider adding `--version` flag
- Optional: Add update check feature
- Document versioning strategy

## Advantages of Go Port

1. **No dependencies**: Users don't need Python or PyYAML installed
2. **Single binary**: Easy distribution and installation
3. **Fast startup**: Compiled binaries start instantly
4. **Cross-compilation**: Build all platforms from one machine
5. **Small binary size**: Typically 5-10MB for simple CLI apps
