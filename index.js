const sparePartsContainer = document.querySelector('.spare-parts-container');
const versionModelListElement = document.querySelector('.version-model-list');
const modelListElement = document.querySelector('.model-list');

versionModelListElement.addEventListener('click', e => {
	const optionValue = versionModelListElement.options[versionModelListElement.selectedIndex].text;
	findSpareParts(optionValue);
});

function createSparePartCard(partNumber, partName, repairComponent, remark) {
	const articleElement = document.createElement('article');
	articleElement.classList.add('card');

	const imgContainerElement = document.createElement('article');
	imgContainerElement.classList.add('card-img-container');

	const imgElement = document.createElement('img');
	imgElement.classList.add('card-img');
	imgElement.setAttribute('src', './img/tvp.png');
	imgElement.setAttribute('alt', 'spare part');

	const tableElement = document.createElement('table');
	tableElement.classList.add('card-table');
	tableElement.innerHTML = `
    <tbody>
    <tr>
        <td class="left">Part number</td>
        <td class="rigth">${partNumber}</td>
    </tr>
    <tr>
        <td class="left">Part name</td>
        <td class="rigth">${partName}</td>
    </tr>
    <tr>
        <td class="left">Repair component</td>
        <td class="rigth">${repairComponent}</td>
    </tr>
    <tr>
        <td class="left">Remark</td>
        <td class="rigth">${remark}</td>
    </tr>
    </tbody>
    `;

	imgContainerElement.append(imgElement);
	articleElement.append(imgContainerElement);
	articleElement.append(tableElement);
	sparePartsContainer.append(articleElement);
}

const versionModelNames = modelData.map(model => model.name.toUpperCase());

function createOption(optionArray, node) {
	optionArray.forEach(item => {
		const optionElement = document.createElement('option');
		optionElement.value = item.toLowerCase;
		optionElement.innerText = item;
		node.append(optionElement);
	});
}

createOption(versionModelNames, versionModelListElement);

function findSpareParts(model) {
	if (model != 'VERSIÓN') {
		console.log(model);
		const foundModel = modelData.find(item => item.name == model);
		console.log(foundModel);
		const sparePartsArray = foundModel.spareParts;
		const spareParts = [];
		sparePartsArray.forEach(item => {
			const found = sparePartsData.find(sp => {
				return sp.id == item;
			});
			spareParts.push(found);
		});
		displaySpareParts(spareParts);
	}
}
function displaySpareParts(data) {
	sparePartsContainer.innerHTML = '';
	data.forEach(item => {
		const partNumber = item['Part number'] || '';
		const partName = item['Parts name'] || '';
		const repairComponent = item['Repair component'] || '';
		const remark = item['Remark'] || '';
		createSparePartCard(partNumber, partName, repairComponent, remark);
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
createOption(modelNames, modelListElement);
