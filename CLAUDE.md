# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

**Install dependencies:**
```bash
npm install
```

**Run the application:**
```bash
npm start
```
Then open http://localhost:7777 in your browser.

## Project Architecture

This is a vanilla JavaScript web application implementing a multisense memory test for Swahili-English word pairs. The application uses a class-based architecture with no external dependencies.

### Core Components

- **MemoryTest class** (`script.js`): Main application controller that manages:
  - Test configuration (visual-only vs audio-visual conditions)
  - Study phase with timed word pair presentation
  - Recall phase with user input validation
  - Results tracking and localStorage persistence
  - Speech synthesis for audio-visual conditions

- **UI Screens** (`index.html`): Four distinct screens managed via show/hide:
  - Welcome screen: Test configuration
  - Study screen: Word pair presentation with timer
  - Recall screen: Translation input interface
  - Results screen: Score display and missed words review

- **Data Structure** (`swahili_nouns_200.json`): Word pairs in `{"q": "swahili", "a": "english"}` format

### Key Features

- **Condition Testing**: Visual-only vs audio-visual memory encoding
- **Customizable Parameters**: Number of pairs (10-50), timing per pair (1-5 seconds)
- **Progress Tracking**: Visual progress bars and counters
- **Results Persistence**: Local storage of test results with timestamps
- **Speech Synthesis**: Text-to-speech for audio-visual condition
- **Responsive Design**: Mobile-friendly interface

### Data Flow

1. Load word pairs from JSON file
2. User configures test parameters
3. Shuffle and select subset of word pairs
4. Study phase: Display pairs with timing
5. Recall phase: Test user memory
6. Results calculation and storage

### File Structure

- `index.html` - Complete UI structure with all screens
- `script.js` - MemoryTest class with full application logic
- `style.css` - Responsive styling with gradient background
- `swahili_nouns_200.json` - 200 Swahili-English word pairs