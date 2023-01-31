const updateInputElement = document.getElementById('update-input');
const updateButtonElement = document.getElementById('update-button');
const dataContainerElement = document.getElementById('updated-data');

updateInputElement.addEventListener('change', handleFileAsync, false);

let modelosData;
let repuestosData;
let excelFileName;
let excelLastModifiedDate;

updateButtonElement.addEventListener('click', () => {
	let newDate = new Date();
	// lastDate.toString()
	// console.log(lastDate)

	const modelosDataString = `const modelosData = ${JSON.stringify(modelosData)};`;
	const repuestosDataString = `const repuestosData = ${JSON.stringify(repuestosData)};`;

	downloadToFile(modelosDataString, 'modelos-pax.js', 'text/plain');
	downloadToFile(repuestosDataString, 'repuestos-pax.js', 'text/plain');
});

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
	excelLastModifiedDate = formatDate(e.target.files[0].lastModifiedDate);
	excelFileName = e.target.files[0].name;
	const file = e.target.files[0];

	/* get raw data */
	const data = await file.arrayBuffer();

	/* data is an ArrayBuffer */
	const wb = XLSX.read(data, { cellText: false, cellDates: true });
	console.log(wb);

	transformDataForTheProject(wb);
}

function transformDataForTheProject(wb) {
	/* get the sheet */
	const sheetNames = wb.SheetNames;
	const theSheetName = sheetNames[0];
	theSheet = wb.Sheets[theSheetName];

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

	modelosData = [...fullModelList];
	repuestosData = [...fullSpareParts];

	let html = XLSX.utils.sheet_to_html(theSheet, { header: '' });
	console.log(html);
	dataContainerElement.innerHTML = html;
}

// Format date
Number.prototype.padLeft = function (base, chr) {
	var len = String(base || 10).length - String(this).length + 1;
	return len > 0 ? new Array(len).join(chr || '0') + this : this;
};
function formatDate(date) {
	const formatedDate = [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(), date.getFullYear()].join('/') + ' ' + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
	return formatedDate;
}
