# Data Visualization Platform

A modern web application for uploading documents and datasets to generate comprehensive data analysis and visualizations.

## Features

- 📄 **Multiple File Format Support**: PDF, CSV, Excel, Word, and Text files
- 📊 **Rich Visualizations**: Interactive charts including bar, line, pie, area, and scatter plots
- 🔍 **Smart Data Analysis**: Automatic extraction and statistical insights
- 📈 **Real-time Processing**: Fast analysis and visualization generation
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **File Processing**: 
  - pdf-parse (PDF)
  - papaparse (CSV)
  - xlsx (Excel)
  - Native text parsing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. Upload a file by clicking the upload area or dragging and dropping
2. Supported formats: PDF, CSV, Excel (.xlsx, .xls), Word (.doc, .docx), and Text files
3. Click "Analyze & Visualize" to process the file
4. View the generated charts, statistics, and insights
5. Explore the raw data in the interactive table

## Project Structure

```
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts      # API endpoint for file analysis
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── FileUpload.tsx        # File upload component
│   └── DataVisualization.tsx # Visualization component
├── lib/
│   ├── dataAnalyzer.ts       # Data analysis logic
│   └── utils.ts              # Utility functions
└── package.json
```

## Features in Detail

### Data Analysis
- Automatic detection of numeric and categorical columns
- Statistical calculations (mean, min, max, sum)
- Distribution analysis
- Trend detection

### Visualizations
- **Bar Charts**: For distributions and comparisons
- **Line Charts**: For trends over time or sequences
- **Pie Charts**: For categorical distributions
- **Area Charts**: For cumulative trends
- **Scatter Plots**: For correlation analysis

## License

MIT

