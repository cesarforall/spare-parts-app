const inputFileElement = document.getElementById('input-file');
const tableElement = document.getElementById('table');
inputFileElement.addEventListener('change', handleFileAsync, false);
const buttonElement = document.getElementById('dowload-button');
buttonElement.addEventListener('click', () => {
	let newDate = new Date();
	// lastDate.toString()
	// console.log(lastDate)
	let data;
	data = 'const modelsData=' + JSON.stringify(modelsData);
	downloadToFile(data, 'data-versions' + '.js', 'text/plain');
});
let modelsData;
let sparePartsData;

const downloadToFile = (content, filename, contentType) => {
	const a = document.createElement('a');
	const file = new Blob([content], { type: contentType });

	a.href = URL.createObjectURL(file);
	a.download = filename;
	a.click();

	URL.revokeObjectURL(a.href);
};

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
	const rawModels = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 'C3:AE3' })[0];
	console.log(rawModels);

	function getObjectModels(rawModels) {
		return Object.entries(rawModels).map(([key, value]) => {
			return { name: value, id: key };
		});
	}
	const models = getObjectModels(rawModels);
	console.log(models);

	// get spare parts
	const spareParts = XLSX.utils.sheet_to_json(theSheet, { header: ['Part number', 'Parts name'], range: 'A4:B463' });
	// console.log(spareParts);

	const sparePartsLastColums = XLSX.utils.sheet_to_json(theSheet, { header: ['Remark', 'Repair component'], range: 'AF4:AG463', blankrows: true });
	// console.log(sparePartsLastColums);

	const fullSpareParts = [...spareParts];
	console.log(fullSpareParts);

	for (const item of sparePartsLastColums) {
		const rowNumber = item['__rowNum__'];
		const index = fullSpareParts.findIndex(item => {
			return item['__rowNum__'] == rowNumber;
		});
		fullSpareParts[index] = { ...fullSpareParts[index], ...item, id: item['__rowNum__'] };
	}
	// console.log(fullSpareParts);

	// get full componets for a model
	const modelSpareParts = {};

	const modelComponentList = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 'C4:C463' });
	console.log(modelComponentList);

	function getComponentList(modelId) {
		const theRange = `${modelId}4:${modelId}463`;
		const modelComponentList = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: theRange });
		let componentList = [];
		for (const component of modelComponentList) {
			componentList.push(component['__rowNum__']);
		}
		return componentList;
	}
	const componentC = getComponentList('C');
	console.log(componentC);

	// Get full list with models and spareparts
	const fullModelList = [...models];

	for (const model of fullModelList) {
		const componentList = getComponentList(model.id);
		model.spareParts = componentList;
	}

	modelsData = [...fullModelList];
	sparePartsData = [...fullSpareParts];
	console.table(fullModelList);
	console.table(fullModelList[10].spareParts);
}
