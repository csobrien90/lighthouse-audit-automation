#!/usr/bin/env node

// Define sites on which to run audit
const root = 'https://www.junkyarn.com/';
const sites = {
//  'filename'			: 'extension',
	'home'				: '',
	'cart'				: 'cart',
	'product-grid'		: 'collections/galentines-day-2019-collection-barbie',
	'single-product'	: 'collections/galentines-day-2019-collection-barbie/products/junkyarn-dk-ready-to-ship?variant=39511884038231'
};

function assess() {
	console.log('Assessing accessibility of all sites.');
	console.log('This could take a minute.');
	console.log('Thank you for your patience!');

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
		var lighthouseSummary = {
			mobile: [],
			desktop: []
		};
		filenames.forEach(file => {
			let report = require(`./lighthouse-reports/${file}`)
			
			// Get desired info from each report
			let siteArr = report.finalUrl.split('/');
			let reportSummary = {
				site: siteArr[siteArr.length -1],
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

		// Output summary object in console
		console.log(lighthouseSummary);
		
		// Clean up lighthouse-reports folder
		execAsync('rm -r lighthouse-reports').then(console.log('Done!'));

	}	
}

assess();