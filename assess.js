#!/usr/bin/env node

// Define sites on which to run audit
const pageName = 'Google';
const root = 'https://google.com/'; //must have trailing slash
const sites = {
//  'page name'			: 'url extension',
//  'example-page		: 'pages/demos/example',
	'home'				: '',
};

function assess() {
	console.log('Assessing accessibility of all sites.');
	console.log('This could take a minute...');

	const fs = require('fs');
    const path = require('path');
    const os = require('os');
	const exec = require('child_process').exec;
	const execAsync = promisify(exec);
	
	let filenames = [];
	
	function promisify(fn) {
		/**
		 * @param {...Any} params The params to pass into *fn*
		 * @return {Promise<Any|Any[]>}
		 */
		return function promisified(...params) {
		return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve( args.length < 2 ? args[0] : args )])))
		}
	}

	exec(`mkdir lighthouse-reports`);
	Object.keys(sites).forEach(key => {
		execAsync(`lighthouse ${root}${sites[key]} --output=json --output-path=./lighthouse-reports/${key}_mobile.json`)
			.then(() => {
				filenames.push(`${key}_mobile.json`);
				if (filenames.length === Object.keys(sites).length * 2) analyze(filenames);
			})
		execAsync(`lighthouse ${root}${sites[key]} --preset=desktop --output=json --output-path=./lighthouse-reports/${key}_desktop.json`)
			.then(() => {
				filenames.push(`${key}_desktop.json`);
				if (filenames.length === Object.keys(sites).length * 2) analyze(filenames);
			})
	})

	function analyze(filenames) {
		console.log('Analyzing lighthouse data...');
		var lighthouseSummary = {
			mobile: [],
			desktop: []
		};
		filenames.forEach(file => {
			let report = require(`./lighthouse-reports/${file}`)
			
			// Get desired info from each report
			let reportSummary = {
				site: file.split('_')[0],
				performance: report.categories.performance.score,
				accessibility: report.categories.accessibility.score,
				bestPractices: report.categories['best-practices'].score,
				seo: report.categories.seo.score
			};

			if(file.includes('mobile')) {
				lighthouseSummary.mobile.push(reportSummary);
			} else {
				lighthouseSummary.desktop.push(reportSummary);
			}
		})

		// Output summary object as .csv
		generateCSV(lighthouseSummary);
		
		// Clean up lighthouse-reports folder
		execAsync('rm -r lighthouse-reports').then(console.log('Done!'));

	}

	function generateCSV(data) {
		console.log('Creating .csv of results...');
	
		let mobile = [];
		let desktop = [];

		Object.keys(data).forEach(format => {
			data[format].forEach(page => {
				// Get row data
				let row = [
					page.site,
					page.performance,
					page.accessibility,
					page.bestPractices,
					page.seo
				];

				switch(format) {
					case "mobile":
						mobile.push(row.join(','));
						break;
					case "desktop":
						desktop.push(row.join(','));
						break;
					default:
						console.log('error: invalid format');
				}
			})
		})

		const headers = ['Site', 'Performance', 'Accessibility', 'Best practices', 'SEO'];
		const output = [
			['Mobile'],
			headers,
			...mobile,
			[], [],
			['Desktop'],
			headers,
			...desktop
		];

		const filename = path.join(__dirname, `${pageName}-lighthouse-reports.csv`);
		fs.writeFileSync(filename, output.join(os.EOL));

	}

}

assess();