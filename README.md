# Lighthouse Audit Automation

## Instructions

### Setup environment

```
npm install
npm update
```

### Make reports

put targets in `root` and `sites` variables in assess.js
```
./assess.js // Build report directory
./analyze.js // Analyze, output full summary, and delete directory of reports
```

## To do

- Make lighthouse commands asynchronous and connect assess/analyze phases
- Output summary as .csv
- Prompt user input for sites to audit
- Make npm package portable