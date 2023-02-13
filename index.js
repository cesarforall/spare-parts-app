const sparePartsContainer = document.querySelector('.spare-parts-container');
const versionModelListElement = document.querySelector('.version-model-list');
const modelListElement = document.querySelector('.model-list');
const searchInput = document.getElementById('search-input');
const searchByPartNumberCheckbox = document.getElementById('search-by-part-number-checkbox');
const lastPageElement = document.getElementById('last-page');
const lastDataElement = document.getElementById('last-data');

searchByPartNumberCheckbox.addEventListener('change', () => {
	modelListElement.classList.toggle('inactive');
	versionModelListElement.classList.toggle('inactive');
	addVersionModelList('');
	partsLengthElement.innerText = '';
	sparePartsContainer.innerHTML = '';
	searchInput.value = '';
	if (searchByPartNumberCheckbox.checked) {
		searchInput.setAttribute('placeholder', 'buscar part number');
	}
	if (!searchByPartNumberCheckbox.checked) {
		searchInput.setAttribute('placeholder', '');
	}
	createOption(modelNames, modelListElement, 'MODELO');
});

versionesData.map(item => (item.name = item.name.toUpperCase()));

let currentSpareParts;

modelListElement.addEventListener('change', e => {
	const optionValue = modelListElement.options[modelListElement.selectedIndex].text;
	if (optionValue == 'MODELO') {
		addVersionModelList('');
		partsLengthElement.innerText = '';
		sparePartsContainer.innerHTML = '';
		searchInput.value = '';
		searchInput.setAttribute('placeholder', '');
	}
	if (optionValue != 'MODELO') {
		addVersionModelList(optionValue);
		partsLengthElement.innerText = '';
		sparePartsContainer.innerHTML = '';
		searchInput.value = '';
		searchInput.setAttribute('placeholder', 'buscar repuesto');
		currentSpareParts = findSparePartsByModel(optionValue);
	}
});

versionModelListElement.addEventListener('change', e => {
	const optionValueModel = modelListElement.options[modelListElement.selectedIndex].text;
	const optionValueVersion = versionModelListElement.options[versionModelListElement.selectedIndex].text;

	if (optionValueVersion == 'VERSIÓN' && optionValueModel != 'MODELO') {
		addVersionModelList(optionValueModel);
		partsLengthElement.innerText = '';
		sparePartsContainer.innerHTML = '';
		searchInput.value = '';
		searchInput.setAttribute('placeholder', '⬅ selecciona una versión');
		currentSpareParts = findSparePartsByModel(optionValueModel);
	}
	if (optionValueVersion != 'VERSIÓN') {
		searchInput.value = '';
		searchInput.setAttribute('placeholder', 'buscar repuesto');
		findSpareParts(optionValueVersion);
	}
});

searchInput.addEventListener('keyup', e => {
	const word = e.target.value;
	const optionValueModel = modelListElement.options[modelListElement.selectedIndex].text;
	const optionValueVersion = versionModelListElement.options[versionModelListElement.selectedIndex].text;

	if (optionValueModel == 'MODELO' && optionValueVersion == 'VERSIÓN' && searchByPartNumberCheckbox.checked) {
		if (word != '') {
			findByNumberInput(word);
		} else {
			partsLengthElement.innerText = '';
			sparePartsContainer.innerHTML = '';
		}
	}
	if (optionValueModel != 'MODELO' && optionValueVersion == 'VERSIÓN') {
		findByInput(currentSpareParts, word);
	}
	if (optionValueModel == 'MODELO' && optionValueVersion == 'VERSIÓN' && !searchByPartNumberCheckbox.checked) {
	}
	if (optionValueModel != 'MODELO' && optionValueVersion != 'VERSIÓN' && !searchByPartNumberCheckbox.checked) {
		findByInput(spareParts, word);
	}
});

function createSparePartCard(partNumber, partName, repairComponent, remark, compatibleDevicesArray) {
	const compatibleDevices = [];
	if (compatibleDevicesArray) {
		compatibleDevicesArray.forEach(item => {
			const id = item[0];
			const device = versionesData.find(item => item.id == id);

			const versionName = `<span>${device.name}</span><br>`;
			compatibleDevices.push(versionName);
		});
	}
	let compatibleDevicesHTML = ``;
	compatibleDevices.forEach(item => (compatibleDevicesHTML += item));

	const articleElement = document.createElement('article');
	articleElement.classList.add('card');

	const imgContainerElement = document.createElement('article');
	imgContainerElement.classList.add('card-img-container');

	const imgElement = document.createElement('img');
	imgElement.classList.add('card-img');
	imgElement.setAttribute('src', `../../data/img-repuestos-pax/${partNumber}.jpg` || './img/tvp.png');
	imgElement.setAttribute('alt', 'spare part');

	const tableElement = document.createElement('table');
	tableElement.classList.add('card-table');
	tableElement.innerHTML = `
    <tbody>
    <tr>
        <td class="left">Part number</td>
        <td class="right">${partNumber}</td>
    </tr>
    <tr>
        <td class="left">Part name</td>
        <td class="right">${partName}</td>
    </tr>
    <tr>
        <td class="left">Repair component</td>
        <td class="right">${repairComponent}</td>
    </tr>
    <tr>
        <td class="left">Remark</td>
        <td class="right">${remark}</td>
    </tr>
    <tr>
        <td class="left">Compatible devices</td>
        <td class="right">${compatibleDevicesHTML}</td>
    </tr>
    </tbody>
    `;

	imgContainerElement.append(imgElement);
	articleElement.append(imgContainerElement);
	articleElement.append(tableElement);
	sparePartsContainer.append(articleElement);
}
const versionModelNames = versionesData.map(model => model.name.toUpperCase());

function createOption(optionArray, node, listName) {
	node.innerText = '';
	const optionElement = document.createElement('option');
	optionElement.value = listName.toLowerCase();
	optionElement.innerText = listName;
	node.append(optionElement);
	optionArray.forEach(item => {
		const optionElement = document.createElement('option');
		optionElement.value = item.toLowerCase;
		optionElement.innerText = item;
		node.append(optionElement);
	});
}

function addVersionModelList(option) {
	const versionModelFound = [];
	versionModelNames.forEach(item => {
		if (item.startsWith(option + '-')) {
			versionModelFound.push(item);
		}
		return versionModelFound;
	});
	createOption(versionModelFound, versionModelListElement, 'VERSIÓN');
}

let spareParts = [];
function findSpareParts(version) {
	spareParts = [];
	if (version != 'VERSIÓN') {
		const foundVersion = versionesData.find(item => item.name == version);
		const sparePartsArray = foundVersion.spareParts;
		sparePartsArray.forEach(item => {
			const found = repuestosData.find(sp => {
				return sp.id == item;
			});
			spareParts.push(found);
		});
		displaySpareParts(spareParts);
	} else {
		sparePartsContainer.innerHTML = '';
	}
}
function findSparePartsByModel(model) {
	if (model != 'MODELO') {
		versionesData.map(item => item.id == item.id.toString());
		const filtered = versionesData.filter(item => item.name.startsWith(model));
		const spareParts = [];
		filtered.forEach(singleFiltered => {
			const sparePartsArray = singleFiltered.spareParts;
			sparePartsArray.forEach(singleSparePart => {
				const found = repuestosData.find(sp => {
					return sp.id == singleSparePart;
				});
				const isAlreadyInSpareParts = spareParts.find(item => item.id == found.id);
				if (!isAlreadyInSpareParts) {
					spareParts.push(found);
				}
			});
		});
		displaySpareParts(spareParts);
		return spareParts;
	}
}
function findSparePartsFromFull() {
	const filtered = versionesData;
	const spareParts = [];

	filtered.forEach(singleFiltered => {
		const sparePartsArray = singleFiltered.spareParts;
		sparePartsArray.forEach(singleSparePart => {
			const found = repuestosData.find(sp => {
				return sp.id == singleSparePart;
			});
			const isAlreadyInSpareParts = spareParts.find(item => item.id == found.id);
			if (!isAlreadyInSpareParts) {
				spareParts.push(found);
			}
		});
	});
	displaySpareParts(spareParts);
	return spareParts;
}

function findByInput(spareParts, word) {
	const normalizedWord = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
	const lowerCaseWord = normalizedWord.toLowerCase();
	let foundByInput = [];
	spareParts.forEach(item => {
		const lowerCaseItem = item['Parts name'].toLowerCase();
		if (lowerCaseItem.includes(lowerCaseWord)) {
			foundByInput.push(item);
		}
	});
	displaySpareParts(foundByInput);
}

function findByModelInput(word) {
	const normalizedWord = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
	const lowerCaseWord = normalizedWord.toLowerCase();
	let foundByInput = [];
	spareParts.forEach(item => {
		const lowerCaseItem = item['Parts name'].toLowerCase();
		if (lowerCaseItem.includes(lowerCaseWord)) {
			foundByInput.push(item);
		}
	});
	displaySpareParts(foundByInput);
}

function findByNumberInput(number) {
	const stringNumber = number.toString();
	let foundByNumberInput = [];
	repuestosData.forEach(item => {
		const dataStringNumber = item['Part number'].toString();
		if (dataStringNumber.includes(stringNumber)) {
			foundByNumberInput.push(item);
		} else {
		}
	});
	displaySpareParts(foundByNumberInput);
}

const partsLengthElement = document.querySelector('.parts-length');
function displaySpareParts(data) {
	const partsLength = data.length;

	partsLengthElement.innerText = `${partsLength} repuestos compatibles`;
	sparePartsContainer.innerHTML = '';

	data.forEach(item => {
		const partNumber = item['Part number'] || '';
		const partName = item['Parts name'] || '';
		const repairComponent = item['Repair component'] || '';
		const remark = item['Remark'] || '';
		const compatibleDevices = item['Compatible device'];
		createSparePartCard(partNumber, partName, repairComponent, remark, compatibleDevices);
	});
}

function getModels(modelNames) {
	const splittedNames = [];
	modelNames.forEach(item => {
		splittedNames.push(item.split('-')[0]);
	});
	const theModelNames = Array.from(new Set(splittedNames));
	const orderedModelNames = theModelNames.sort();
	return orderedModelNames;
}
const modelNames = getModels(versionModelNames);
createOption(modelNames, modelListElement, 'MODELO');

displaySpareParts(repuestosData);

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

// Last updates
lastPageElement.innerText = `Última actualización de página: ${pageLastModifiedDate}`;
lastDataElement.innerText = `Última actualización de datos: ${excelLastModifiedDate}`;
