const sparePartsContainer = document.querySelector('.spare-parts-container');
const versionModelListElement = document.querySelector('.version-model-list');
const modelListElement = document.querySelector('.model-list');
const searchInput = document.getElementById('search-input');

modelosData.map(item => (item.name = item.name.toUpperCase()));

modelListElement.addEventListener('change', e => {
	const optionValue = modelListElement.options[modelListElement.selectedIndex].text;
	if (optionValue == 'MODELO') {
		addVersionModelList('');
		partsLengthElement.innerText = '';
		sparePartsContainer.innerHTML = '';
		searchInput.value = '';
		searchInput.setAttribute('placeholder', 'buscar part number');
	}
	if (optionValue != 'MODELO') {
		addVersionModelList(optionValue);
		partsLengthElement.innerText = '';
		sparePartsContainer.innerHTML = '';
		searchInput.value = '';
		searchInput.setAttribute('placeholder', '⬅ selecciona una versión');
	}
});

versionModelListElement.addEventListener('change', e => {
	const optionValue = versionModelListElement.options[versionModelListElement.selectedIndex].text;
	searchInput.setAttribute('placeholder', 'buscar repuesto');
	searchInput.value = '';
	findSpareParts(optionValue);
});

searchInput.addEventListener('keyup', e => {
	const word = e.target.value;
	const optionValueModel = modelListElement.options[modelListElement.selectedIndex].text;
	const optionValueVersion = versionModelListElement.options[versionModelListElement.selectedIndex].text;
	console.log(word);
	console.log(optionValueVersion);
	console.log(optionValueModel);

	if (optionValueModel == 'MODELO' && optionValueVersion == 'VERSIÓN') {
		if (word != '') {
			findByNumberInput(word);
		} else {
			partsLengthElement.innerText = '';
			sparePartsContainer.innerHTML = '';
		}
	} else {
		findByInput(word);
	}
});

function createSparePartCard(partNumber, partName, repairComponent, remark) {
	const articleElement = document.createElement('article');
	articleElement.classList.add('card');

	const imgContainerElement = document.createElement('article');
	imgContainerElement.classList.add('card-img-container');

	const imgElement = document.createElement('img');
	imgElement.classList.add('card-img');
	imgElement.setAttribute('src', `./data/img-repuestos-pax/${partNumber}.jpg` || './img/tvp.png');
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
    </tbody>
    `;

	imgContainerElement.append(imgElement);
	articleElement.append(imgContainerElement);
	articleElement.append(tableElement);
	sparePartsContainer.append(articleElement);
}

const versionModelNames = modelosData.map(model => model.name.toUpperCase());

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
function findSpareParts(model) {
	spareParts = [];
	if (model != 'VERSIÓN') {
		const foundModel = modelosData.find(item => item.name == model);
		const sparePartsArray = foundModel.spareParts;
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

function findByInput(word) {
	const normalizedWord = word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
	const lowerCaseWord = normalizedWord.toLowerCase();
	let foundByInput = [];
	console.log(foundByInput);
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
	console.log(foundByNumberInput);
	repuestosData.forEach(item => {
		const dataStringNumber = item['Part number'].toString();
		if (dataStringNumber.includes(stringNumber)) {
			foundByNumberInput.push(item);
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
		createSparePartCard(partNumber, partName, repairComponent, remark, length);
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
