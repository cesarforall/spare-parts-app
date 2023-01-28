const inputFileElement = document.getElementById('input-file');
const tableElement = document.getElementById('table');
inputFileElement.addEventListener('change', handleFileAsync, false);

async function handleFileAsync(e) {
	/* get first file */
	const file = e.target.files[0];

	/* get raw data */
	const data = await file.arrayBuffer();

	/* data is an ArrayBuffer */
	const wb = XLSX.read(data, { cellText: false, cellDates: true });
	console.log(wb);

	/* get the sheet */
	const sheetNames = wb.SheetNames;
	const theSheetName = sheetNames[0];
	const theSheet = wb.Sheets[theSheetName];

	// get objet models
	const models = XLSX.utils.sheet_to_json(theSheet, { header: 1, range: 'C3:AE3' })[0];
	console.log(models);

	// get spare parts
	const spareParts = XLSX.utils.sheet_to_json(theSheet, { header: ['Part number', 'Parts name'], range: 'A4:B463' });
	// console.log(spareParts);

	const sparePartsLastColums = XLSX.utils.sheet_to_json(theSheet, { header: ['Remark', 'Repair component'], range: 'AF4:AG463', blankrows: true });
	// console.log(sparePartsLastColums);

	const fullSpareParts = [...spareParts];

	for (const item of sparePartsLastColums) {
		const rowNumber = item['__rowNum__'];
		const index = fullSpareParts.findIndex(item => {
			return item['__rowNum__'] == rowNumber;
		});
		fullSpareParts[index] = { ...fullSpareParts[index], ...item };
	}
	console.log(fullSpareParts);
}
