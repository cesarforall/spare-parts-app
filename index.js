const sparePartsContainer = document.querySelector('.spare-parts-container');

function createSparePartCard(partNumber, partName, repairComponent, Remark) {
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
        <td class="rigth">${Remark}</td>
    </tr>
    </tbody>
    `;

	imgContainerElement.append(imgElement);
	articleElement.append(imgContainerElement);
	articleElement.append(tableElement);
	sparePartsContainer.append(articleElement);
}
