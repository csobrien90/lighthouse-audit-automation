#!/usr/bin/env node

function analyze() {

	// Configure utilites
	const fs = require('fs');
	const exec = require('child_process').exec;


	function promisify(fn) {
		/**
		 * @param {...Any} params The params to pass into *fn*
		 * @return {Promise<Any|Any[]>}
		 */
		return function promisified(...params) {
		return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve( args.length < 2 ? args[0] : args )])))
		}
	}

	// Get list of lighthouse report filenames
	const readdirAsync = promisify(fs.readdir);
	readdirAsync('./lighthouse-reports').then(filenames => {
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
		const execAsync = promisify(exec);
		execAsync('rm -r lighthouse-reports').then(console.log('Done!'));
		
	});

}

analyze();	