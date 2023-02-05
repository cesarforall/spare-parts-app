const updateInputElement = document.getElementById('update-input');
// const updateButtonElement = document.getElementById('update-button');
const dataContainerElement = document.getElementById('updated-data');

updateInputElement.addEventListener('change', handleFileAsync, false);
// updateButtonElement.addEventListener('click', createAndDownloadFiles);

function createAndDownloadFiles(transformedData, excelLastModifiedDate) {
	const versionesData = transformedData.versiones;
	const repuestosData = transformedData.repuestos;
	const pageLastModifiedDate = formatDate(new Date());

	const secureNum = Math.random().toString();

	const versionesDataString = `const versionesData = ${JSON.stringify(versionesData)}; const modelosSecureNum = '${secureNum}'; const excelLastModifiedDate = '${excelLastModifiedDate}';`;
	const repuestosDataString = `const repuestosData = ${JSON.stringify(repuestosData)}; const repuestosSecureNum = '${secureNum}'; const pageLastModifiedDate = '${pageLastModifiedDate}';`;

	dataContainerElement.innerText = JSON.stringify(transformedData);

	alert(`Datos cargados!\nSobreescribe:\ndata/modelos-pax.js\ndata/repuestos-pax.js`);
	downloadToFile(versionesDataString, 'modelos-pax.js', 'text/plain');
	downloadToFile(repuestosDataString, 'repuestos-pax.js', 'text/plain');
}

async function handleFileAsync(e) {
	const excelFileName = e.target.files[0].name;

	if (excelFileName == 'FICHERO REPUESTO PAX_Zelenza Sparesstock all modelsV2_07_11_22.xlsx') {
		/* get first file */
		const excelLastModifiedDate = formatDate(e.target.files[0].lastModifiedDate);
		const file = e.target.files[0];

		/* get raw data */
		const data = await file.arrayBuffer();

		/* data is an ArrayBuffer */
		const wb = XLSX.read(data, { cellText: false, cellDates: true });
		const transformedData = transformDataForTheProject(wb);

		createAndDownloadFiles(transformedData, excelLastModifiedDate);
	} else {
		alert('El archivo no es correcto');
	}
}

function transformDataForTheProject(wb) {
	/* get the sheet */
	const sheetNames = wb.SheetNames;
	const theSheetName = sheetNames[0];
	theSheet = wb.Sheets[theSheetName];
	const theSheetRange = theSheet['!ref'].split(':');
	const lastCellFromRange = theSheetRange[1].replace(/\D/g, '');
	console.log(lastCellFromRange);

	const titlesRow = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 2 })[0];
	const titlesRowArray = Object.entries(titlesRow);
	// console.log(titlesRowArray);

	// Get headers names and id
	const headers = ['Part number', 'Parts name', 'Remark', 'Repair component'];
	const headersWithId = [];
	headers.forEach(header => {
		const index = titlesRowArray.findIndex(item => {
			return item[1] == header;
		});
		// headersWithId.push({ header: header, id: titlesRowArray[index][0] });
		headersWithId.push({ name: header, id: titlesRowArray[index][0] });
	});
	// console.log(headersWithId);

	const nameIdVersions = [];
	titlesRowArray.forEach(item => {
		if (item[1] == 'Part number' || item[1] == 'Parts name' || item[1] == 'Remark' || item[1] == 'Repair component' || item[1] == '') {
		} else {
			nameIdVersions.push(item);
		}
	});

	function getVersionsList(sparePartId) {
		const theRange = `${modelId}4:${modelId}lastCellFromRange`;
		const modelComponentList = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: theRange });
		let componentList = [];
		for (const component of modelComponentList) {
			componentList.push(component['__rowNum__']);
		}
		return componentList;
	}
	// get objet models

	// const rawModels = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 'C3:AE3' })[0];
	// console.log(rawModels);

	function getObjectModels(versions) {
		return nameIdVersions.map(([key, value]) => {
			return { name: value, id: key };
		});
	}
	const versions = getObjectModels(nameIdVersions);
	console.log(versions);

	// get full spare parts
	const sparePartsWithVersions = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 'A4:AGlastCellFromRange', blankrows: false });
	// console.log(sparePartsWithVersions);

	const fullSparePartsWithVersions = [];
	sparePartsWithVersions.forEach(row => {
		const compatibleDevicesIdList = [];

		const rowId = row['__rowNum__'];

		const partNumberId = headersWithId.find(header => header.name == 'Part number').id;
		const partNumber = row[partNumberId];

		const partsNameId = headersWithId.find(header => header.name == 'Parts name').id;
		const partsName = row[partsNameId];

		const remarkId = headersWithId.find(header => header.name == 'Remark').id;
		const remark = row[remarkId];

		const repairComponentId = headersWithId.find(header => header.name == 'Repair component').id;
		const repairComponent = row[repairComponentId];

		const rowArray = Object.entries(row);
		rowArray.forEach(item => {
			if (item[0] != partNumberId && item[0] != partsNameId && item[0] != remarkId && item[0] != repairComponentId) {
				compatibleDevicesIdList.push(item);
			}
		});

		const newSparePartObject = { id: rowId, 'Part number': partNumber, 'Parts name': partsName || '', Remark: remark || '', 'Repair component': repairComponent || '', 'Compatible device': compatibleDevicesIdList || '' };
		fullSparePartsWithVersions.push(newSparePartObject);
		return newSparePartObject;
	});

	// get spare parts
	// const spareParts = XLSX.utils.sheet_to_json(theSheet, { header: ['Part number', 'Parts name'], range: 'A4:BlastCellFromRange' });

	// const sparePartsLastColums = XLSX.utils.sheet_to_json(theSheet, { header: ['Remark', 'Repair component'], range: 'AF4:AGlastCellFromRange', blankrows: false });

	// const fullSpareParts = [...spareParts];
	// console.log(fullSpareParts);

	// for (const item of sparePartsLastColums) {
	// 	const rowNumber = item['__rowNum__'];
	// 	const index = fullSpareParts.findIndex(item => {
	// 		return item['__rowNum__'] == rowNumber;
	// 	});
	// 	fullSpareParts[index] = { ...fullSpareParts[index], ...item, id: item['__rowNum__'] };
	// }

	// get full componets for a single model
	// const modelSpareParts = {};

	// const modelComponentList = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: 'C4:ClastCellFromRange' });

	function getComponentList(modelId) {
		const theRange = `${modelId}4:${modelId}lastCellFromRange`;
		const modelComponentList = XLSX.utils.sheet_to_json(theSheet, { header: 'A', range: theRange });
		let componentList = [];
		for (const component of modelComponentList) {
			componentList.push(component['__rowNum__']);
		}
		return componentList;
	}

	// Get full list with models and spareparts
	const fullVersionsList = [...versions];

	for (const model of fullVersionsList) {
		const componentList = getComponentList(model.id);
		model.spareParts = componentList;
	}

	const versionesData = [...fullVersionsList];
	const repuestosData = [...fullSparePartsWithVersions];

	// let html = XLSX.utils.sheet_to_html(theSheet, { header: '' });
	// console.log(html);
	// dataContainerElement.innerHTML = html;

	return { versiones: versionesData, repuestos: repuestosData };
}

// Download String object to file
function downloadToFile(content, filename, contentType) {
	const a = document.createElement('a');
	const file = new Blob([content], { type: contentType });

	a.href = URL.createObjectURL(file);
	a.download = filename;
	a.click();

	URL.revokeObjectURL(a.href);
}

// Format Date object to string
Number.prototype.padLeft = function (base, chr) {
	var len = String(base || 10).length - String(this).length + 1;
	return len > 0 ? new Array(len).join(chr || '0') + this : this;
};

function formatDate(date) {
	const formatedDate = [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(), date.getFullYear()].join('/') + ' ' + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(':');
	return formatedDate;
}

// Credits
const atElement = document.getElementById('at-element');
const creditsElement = document.getElementById('credits');
const creditsLinkElement = document.querySelector('#credits a');

function showElement(elements) {
	elements.forEach(element => {
		element.classList.remove('hidden');
		setTimeout(() => {
			hideElement(elements);
		}, 1000);
	});
}

function hideElement(elements) {
	elements.forEach(element => {
		element.classList.add('hidden');
	});
}

// Event listeners
atElement.addEventListener('click', () => {
	showElement([creditsLinkElement, creditsElement]);
});
