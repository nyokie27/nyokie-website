let gridSize = 9;
let tileSize = 50;
let mapScale = 142;
let pointA = null;
let pointB = null;

document.getElementById("set-grid-button").addEventListener("click", setGrid);
document.getElementById("reset-a-button").addEventListener("click", resetA);
document.getElementById("reset-b-button").addEventListener("click", resetB);
document.getElementById("convert-studs").addEventListener("click", convert_studs);

document.getElementById("grid").addEventListener("mousemove", function(event) { //Mouse event listener, show cursor position on grid
    let x = event.offsetX;
    let y = event.offsetY;
    let column = Math.floor((x / tileSize) + 1);
    let row = Math.floor((y / tileSize) + 1);
    let base26Column = getBase26Label(column);
    let base26Row = getBase26Label(row);
    document.getElementById("cursor-coordinates").textContent = base26Column + row;
    document.getElementById("cursor-coordinates").style.left = event.pageX + 10 + "px";
    document.getElementById("cursor-coordinates").style.top = event.pageY - 20 + "px";
    document.getElementById("cursor-coordinates").style.display = "block";
});

document.getElementById("grid").addEventListener("click", function(event) { //Mouse event listener on click to plot points
    if (pointA === null && event.button === 0) {
        pointA = {x: event.offsetX, y: event.offsetY};
        drawPoint(pointA, "green");
    } else if (pointA!= null && event.button === 0) { //Check if point A has been plotted
        pointB = {x: event.offsetX, y: event.offsetY};
        drawPoint(pointB, "red");
        document.getElementById("grid").innerHTML = "";
        drawGrid(); //Draw grid so that previous point Bs get overwritten and don't stay on the grid visible
    }
    calculate();
});

function setGrid() {
    gridSize = parseInt(document.getElementById("grid-size").value);
    mapScale = parseFloat(document.getElementById("map-scale").value);
    document.getElementById("grid").style.width = gridSize * tileSize + "px";
    document.getElementById("grid").style.height = gridSize * tileSize + "px";
    document.getElementById("grid").innerHTML = "";
    drawGrid();
}

//Buttons to reset points
function resetA() {
    pointA = null;
    document.getElementById("grid").innerHTML = "";
    drawGrid();
}

function resetB() {
    pointB = null;
    document.getElementById("grid").innerHTML = "";
    drawGrid();
}

function convert_studs() {
	let studs = parseFloat(document.getElementById("studs").value);
	let convertion = studs / (5 / 1.8);
	document.getElementById("studs-to-meters").innerHTML = " " + convertion + " meters";
}

function drawGrid() {
    document.getElementById("grid").style.position = "relative";

    //Add a transparent div element on top of the gridlines
    let transparentDiv = document.createElement("div");
    transparentDiv.style.position = "absolute";
    transparentDiv.style.top = "0px";
    transparentDiv.style.left = "0px";
    transparentDiv.style.width = gridSize * tileSize + "px";
    transparentDiv.style.height = gridSize * tileSize + "px";
    transparentDiv.style.background = "transparent";
    transparentDiv.style.zIndex = 1;
    document.getElementById("grid").appendChild(transparentDiv);

    //Add the points to the grid before adding the gridlines
    if (pointA) {
        drawPoint(pointA, "green");
    }
    if (pointB) {
        drawPoint(pointB, "red");
    }

    //Draw horizontal labels
    let labelWidth = 20;
    let labelHeight = 20;
    let labelMargin = 5;
    for (let i = 0; i <= gridSize-1; i++) {
        let label = document.createElement("div");
        label.style.position = "absolute";
        label.style.left = -labelWidth - labelMargin + "px";
        label.style.top = i * tileSize + labelMargin + "px";
        label.style.width = labelWidth + "px";
        label.style.height = labelHeight + "px";
        label.style.lineHeight = labelHeight + "px";
        label.style.textAlign = "center";
        label.style.fontSize = "12px";
        label.style.color = "black";
        label.textContent = i + 1;
        document.getElementById("grid").appendChild(label);
    }

    //Draw vertical labels
    for (let i = 0; i <= gridSize-1; i++) {
        let label = document.createElement("div");
        label.style.position = "absolute";
        label.style.top = -labelHeight - labelMargin + "px";
        label.style.left = i * tileSize + labelMargin + "px";
        label.style.width = labelWidth + "px";
        label.style.height = labelHeight + "px";
        label.style.lineHeight = labelHeight + "px";
        label.style.textAlign = "center";
        label.style.fontSize = "12px";
        label.style.color = "black";
        label.textContent = getBase26Label(i + 1);
        document.getElementById("grid").appendChild(label);
    }

    for (let i = 0; i <= gridSize; i++) {
        let horizontalLine = document.createElement("div");
        horizontalLine.style.position = "absolute";
        horizontalLine.style.top = i * tileSize + "px";
        horizontalLine.style.left = "0px";
        horizontalLine.style.width = gridSize * tileSize + "px";
        horizontalLine.style.height = "1px";
        horizontalLine.style.background = "black";
        document.getElementById("grid").appendChild(horizontalLine);

        let verticalLine = document.createElement("div");
        verticalLine.style.position = "absolute";
        verticalLine.style.top = "0px";
        verticalLine.style.left = i * tileSize + "px";
        verticalLine.style.width = "1px";
        verticalLine.style.height = gridSize * tileSize + "px";
        verticalLine.style.background = "black";
        document.getElementById("grid").appendChild(verticalLine);
    }
}

function drawPoint(point, color) {
    let pointElement = document.createElement("div");
    pointElement.style.position = "absolute";
    pointElement.style.top = point.y - 5 + "px";
    pointElement.style.left = point.x - 5 + "px";
    pointElement.style.width = "10px";
    pointElement.style.height = "10px";
    pointElement.style.borderRadius = "50%";
    pointElement.style.background = color;
    document.getElementById("grid").appendChild(pointElement);
}

/*
    Calculate
    - Use pythagorean theorem to get distance between points
    - Use a simple projectile calculator to get both direct and indirect angles given projectile velocity to hit a target
    - Get times for both angles
*/
function calculate() {
    if (pointA && pointB) {
		let distanceMeters = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)) * mapScale / tileSize;
        let distanceStuds = distanceMeters * (5/1.8); // 1 meter = 3 studs?
        let dx = pointB.x - pointA.x;
        let dy = pointB.y - pointA.y;
        let azimuth = 180 - Math.atan2(dx, dy) * 180 / Math.PI;
		let initialHeight = 0;

        let velocity = parseFloat(document.getElementById("velocity").value);
        //let gravity = 9.81; // m/s^2
		let gravity = 9.8 * 1.8
		
		let indirectAngle = Math.atan(
			(velocity ** 2 + Math.sqrt(velocity ** 4 - gravity * (gravity * distanceMeters ** 2 + 2 * initialHeight * velocity ** 2))) / (gravity * distanceMeters)
		) * (180 / Math.PI);
		let directAngle = (90 - indirectAngle);

        if (azimuth < 0) {
            azimuth += 360;
        } else if (azimuth > 360) {
            azimuth -= 360;
        }
		
		//Time calculations
        let directTime = (2 * velocity * Math.sin(directAngle * Math.PI / 180)) / gravity;
        let indirectTime = (2 * velocity * Math.sin(indirectAngle * Math.PI / 180)) / gravity;
		
		//Max Range
		let theta = 45 * Math.PI / 180; 
		let maxRange = (velocity ** 2)* (2 * Math.sin(theta) * Math.cos(theta)) / gravity;
        
        document.getElementById("distance-label").innerHTML = "" + distanceMeters.toFixed(2) + " meters (" + distanceStuds.toFixed(2) + " studs)";
        document.getElementById("azimuth-label").innerHTML = "" + azimuth.toFixed(2) + " degrees";
        document.getElementById("direct-angle-label").innerHTML = "" + directAngle.toFixed(2) + " degrees" + "  (" + directTime.toFixed(2) + " seconds)";
        document.getElementById("indirect-angle-label").innerHTML = "" + indirectAngle.toFixed(2) + " degrees" + "  (" + indirectTime.toFixed(2) + " seconds)";
		document.getElementById("max-range-label").innerHTML = "" + maxRange.toFixed(2) + "meters";
    }
}

function getBase26Label(number) { //Base 26 number system for alphabetical labels
    let label = '';
    while (number > 0) {
        let remainder = number % 26;
        if (remainder === 0) {
            remainder = 26;
            number--;
        }
        label = String.fromCharCode(remainder + 64) + label;
        number = Math.floor(number / 26);
    }
    return label;
}

setGrid();