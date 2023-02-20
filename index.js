const sparePartsContainer = document.querySelector('.spare-parts-container');
const manufacturerListElement = document.querySelector('.manufacturer-list');
const versionListElement = document.querySelector('.version-list');
const modelListElement = document.querySelector('.model-list');
const searchInput = document.getElementById('search-input');
const searchByPartNumberCheckbox = document.getElementById('search-by-part-number-checkbox');
const lastPageElement = document.getElementById('last-page');
const lastDataElement = document.getElementById('last-data');
const partsLengthElement = document.querySelector('.parts-length');

// const orderedManufacturers = Array.from(manufacturers).sort();
let currentSpareParts = [...repuestosData];
let currentVersionsData = [...versionesData];

const manufacturerList = Array.from(new Set(versionesData.map(version => version.manufacturer.toUpperCase()))).sort();
const getVersionList = () => currentVersionsData.map(version => version.name.toUpperCase()).sort();
const getModelList = () => Array.from(new Set(currentVersionsData.map(version => version.model.toUpperCase()))).sort();

const versions = getVersionList();
const manufacturers = new Set(versionesData.map(version => version.manufacturer.toUpperCase()));
const models = getModelList();

// searchByPartNumberCheckbox.addEventListener('change', () => {
// 	cleanInput();
// 	manufacturerListElement.classList.toggle('inactive');
// 	modelListElement.classList.toggle('inactive');
// 	versionListElement.classList.toggle('inactive');
// 	currentSpareParts = [...repuestosData];
// 	createOptions(manufacturerList, manufacturerListElement, 'FABRICANTE');
// 	createOptions([], modelListElement, 'MODELO');
// 	createOptions([], versionListElement, 'VERSIÓN');
// 	displaySpareParts(repuestosData);
// });

versionesData.map(item => (item.name = item.name.toUpperCase()));

function cleanInput() {
	// partsLengthElement.innerText = '';
	// sparePartsContainer.innerHTML = '';
	searchInput.value = '';
	searchInput.setAttribute('placeholder', '');
}

manufacturerListElement.addEventListener('change', e => {
	const manufacturerValue = manufacturerListElement.options[manufacturerListElement.selectedIndex].text;
	cleanInput();
	if (manufacturerValue === 'FABRICANTE') {
		currentSpareParts = [...repuestosData];
		createOptions(manufacturerList, manufacturerListElement, 'FABRICANTE');
		createOptions([], modelListElement, 'MODELO');
		createOptions([], versionListElement, 'VERSIÓN');
		displaySpareParts(repuestosData);
	}
	if (manufacturerValue != 'FABRICANTE') {
		findSparePartsByCategory('FABRICANTE', manufacturerValue);
		const modelList = getModelList(manufacturerValue);
		createOptions(modelList, modelListElement, 'MODELO');
		createOptions([], versionListElement, 'VERSIÓN');
	}
});

modelListElement.addEventListener('change', e => {
	cleanInput();
	const manufacturerValue = manufacturerListElement.options[manufacturerListElement.selectedIndex].text;
	const modelValue = modelListElement.options[modelListElement.selectedIndex].text;
	if (modelValue === 'MODELO') {
		currentSpareParts = [...repuestosData];
		findSparePartsByCategory('FABRICANTE', manufacturerValue);
		createOptions([], versionListElement, 'VERSIÓN');
	}
	if (modelValue != 'MODELO') {
		currentSpareParts = [...repuestosData];
		findSparePartsByCategory('FABRICANTE', manufacturerValue);
		findSparePartsByCategory('MODELO', modelValue);
		const versionList = getVersionList(modelValue);
		createOptions(versionList, versionListElement, 'VERSIÓN');
	}
});

versionListElement.addEventListener('change', e => {
	cleanInput();
	const manufacturerValue = manufacturerListElement.options[manufacturerListElement.selectedIndex].text;
	const modelValue = modelListElement.options[modelListElement.selectedIndex].text;
	const versionValue = versionListElement.options[versionListElement.selectedIndex].text;

	if (versionValue === 'VERSIÓN') {
		findSparePartsByCategory('FABRICANTE', manufacturerValue);
		findSparePartsByCategory('MODELO', modelValue);
	}
	if (versionValue != 'VERSIÓN') {
		findSparePartsByCategory('version', versionValue);
	}
});

searchInput.addEventListener('keyup', e => {
	// const checkBoxIsChecked = searchByPartNumberCheckbox.checked;
	const searchString = e.target.value;
	let filtered;
	// if (!checkBoxIsChecked) {
	// 	filtered = filterSPByPartName(searchString);
	// 	displaySpareParts(filtered);
	// }
	// if (checkBoxIsChecked) {
	// 	filtered = filterAll(searchString);
	// 	displaySpareParts(filtered);
	// }
	filtered = filterAll(searchString);
	displaySpareParts(filtered);
});

function testImage(url) {
	// Define the promise
	const imgPromise = new Promise(function imgPromise(resolve, reject) {
		// Create the image
		const imgElement = new Image();

		// When image is loaded, resolve the promise
		imgElement.addEventListener('load', function imgOnLoad() {
			resolve(this);
		});

		// When there's an error during load, reject the promise
		imgElement.addEventListener('error', function imgOnError() {
			reject();
		});

		// Assign URL
		imgElement.src = url;
	});

	return imgPromise;
}

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
	imgElement.setAttribute('data-src', `../../data/img-repuestos-pax/${partNumber}.jpg`);
	imgElement.setAttribute('alt', 'spare part');

	const io = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const img = entry.target;
				img.setAttribute('src', img.getAttribute('data-src'));
				img.onload = () => {
					imgContainerElement.classList.add('loaded');
				};
				img.onerror = () => {
					img.setAttribute('src', `../../data/img-repuestos-pax/anuncio.jpg`);
					imgContainerElement.classList.add('loaded');
				};
				observer.unobserve(img);
			}
		});
	});

	io.observe(imgElement);

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
	return articleElement;
}

function createOptions(optionList, node, listName) {
	listName.toUpperCase();
	node.innerText = '';
	const optionElement = document.createElement('option');
	optionElement.value = listName.toLowerCase();
	optionElement.innerText = listName;
	node.append(optionElement);

	if (listName === 'FABRICANTE') {
		optionList
			.map(option => {
				if (option != 'NO MANUFACTURER') return option;
			})
			.forEach(option => {
				const optionElement = document.createElement('option');
				optionElement.value = option.toLowerCase;
				optionElement.innerText = option;
				node.append(optionElement);
			});
	}
	if (listName === 'MODELO') {
		optionList
			.map(option => {
				if (option != 'NO MODEL') return option;
			})
			.forEach(option => {
				const optionElement = document.createElement('option');
				optionElement.value = option.toLowerCase;
				optionElement.innerText = option;
				node.append(optionElement);
			});
	}
	if (listName === 'VERSIÓN' || listName === 'VERSION') {
		console.log(optionList);
		optionList.forEach(option => {
			const optionElement = document.createElement('option');
			optionElement.value = option.toLowerCase;
			optionElement.innerText = option;
			node.append(optionElement);
		});
	}
}

function addVersionModelList(option) {
	console.log(option);
	option.toUpperCase();
	const versionModelFound = Array.from(new Set(currentVersionsData.filter(version => version.model.toUpperCase() == option.toUpperCase()).map(version => version.name))).sort();
	console.log(versionModelFound);
	createOptions(versionModelFound, versionListElement, 'VERSIÓN');
}
function addModelList(option) {
	const foundModels = Array.from(new Set(currentVersionsData.filter(version => version.manufacturer.toUpperCase() == option.toUpperCase()).map(version => version.model))).sort();
	console.log(foundModels);
	createOptions(foundModels, modelListElement, 'MODELO');
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
function findSparePartsByManufacturer(manufacturer) {
	if (manufacturer != 'FABRICANTE') {
		const filtered = versionesData.filter(item => item.manufacturer == manufacturer);
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

// New filter

function normalizeString(string) {
	return string
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toUpperCase();
}

function findSparePartsByCategory(category, value) {
	const nCategory = normalizeString(category);
	const nValue = normalizeString(value);
	const spareParts = [];
	let filteredVersions;
	function fillSparePartsArray() {
		filteredVersions.forEach(version => {
			const sparePartsArray = version.spareParts;
			sparePartsArray.forEach(singleSP => {
				const foundSparePart = repuestosData.find(sp => {
					return sp.id == singleSP;
				});
				const isAlreadyInSpareParts = spareParts.find(item => item.id == foundSparePart.id);
				if (!isAlreadyInSpareParts) {
					spareParts.push(foundSparePart);
				}
			});
		});
	}

	if (nCategory === 'FABRICANTE') {
		filteredVersions = versionesData.filter(version => normalizeString(version.manufacturer) == nValue);
		currentVersionsData = [...filteredVersions];
		fillSparePartsArray();
	}
	if (nCategory === 'MODELO') {
		filteredVersions = currentVersionsData.filter(version => normalizeString(version.model) == nValue);
		currentVersionsData = [...filteredVersions];
		fillSparePartsArray();
	}
	if (nCategory === 'VERSION') {
		console.log(currentVersionsData);
		filteredVersions = currentVersionsData.filter(version => normalizeString(version.name) == nValue);
		// currentVersionsData = [...filteredVersions];
		fillSparePartsArray();
	}

	currentSpareParts = [...spareParts];
	displaySpareParts(currentSpareParts);
}
// function findManufacturerSpareParts(manufacturer) {
// 	const nManufacturer = normalizeString(manufacturer);
// 	console.log(versionesData);

// 	const fManufaturer = versionesData.filter(version => normalizeString(version.manufacturer) == nManufacturer);

// 	let spareParts = [];

// 	currentSpareParts = fManufaturer.forEach(version => {
// 		const sparePartsArray = version.spareParts;
// 		sparePartsArray.forEach(singleSP => {
// 			const foundSparePart = repuestosData.find(sp => {
// 				return sp.id == singleSP;
// 			});
// 			const isAlreadyInSpareParts = spareParts.find(item => item.id == foundSparePart.id);
// 			if (!isAlreadyInSpareParts) {
// 				spareParts.push(foundSparePart);
// 			}
// 		});
// 	});

// 	currentSpareParts = [...spareParts];
// 	displaySpareParts(currentSpareParts);
// }

function filterSPByPartName(string) {
	const nString = normalizeString(string);
	// console.log(nString);
	// console.log(currentSpareParts);
	const filtered = currentSpareParts.filter(sp => normalizeString(sp['Parts name']).includes(nString));
	// console.log(filtered);
	// currentSpareParts = [...filtered];
	// displaySpareParts(currentSpareParts);
	return filtered;
}
function filterAll(string) {
	const nString = normalizeString(string);
	// console.log(nString);
	// console.log(currentSpareParts);
	const filtered = currentSpareParts.filter(sp => normalizeString(sp['Key words']).includes(nString));
	// console.log(filtered);
	// currentSpareParts = [...filtered];
	// displaySpareParts(currentSpareParts);
	return filtered;
}
function filterSPByPartNumber(string) {
	const nString = normalizeString(string);
	// console.log(nString);
	// console.log(currentSpareParts);
	console.log(currentSpareParts);
	const filtered = currentSpareParts.filter(sp => normalizeString(sp['Part number']).includes(nString));
	// console.log(filtered);
	// currentSpareParts = [...filtered];
	// displaySpareParts(currentSpareParts);
	return filtered;
}

// findManufacturerSpareParts('pax');
// findSparePartsByCategory('FABRICANTE', 'PAX');
// filterSPByPartName('pr');

function displaySpareParts(data) {
	const partsLength = data.length;
	partsLengthElement.innerText = `${partsLength} repuestos compatibles`;

	// create observer instance
	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const card = entry.target;
				const img = card.querySelector('img');
				img.setAttribute('src', img.getAttribute('data-src'));
				img.onload = () => {
					card.classList.add('loaded');
				};
				observer.unobserve(card);
			}
		});
	});

	// create and append cards
	const cards = data.map(item => {
		const partNumber = item['Part number'] || '';
		const partName = item['Parts name'] || '';
		const repairComponent = item['Repair component'] || '';
		const remark = item['Remark'] || '';
		const compatibleDevices = item['Compatible device'];
		const card = createSparePartCard(partNumber, partName, repairComponent, remark, compatibleDevices);

		// observe the card
		observer.observe(card);

		return card;
	});

	// append cards to container
	sparePartsContainer.append(...cards);
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

createOptions(manufacturerList, manufacturerListElement, 'FABRICANTE');
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
