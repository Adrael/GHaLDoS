var PIXEL_SIZE = 15; //pixels

var GRID_WIDTH = 0;
var GRID_HEIGHT = 0;

var OUTPUT_COUNT = 10;
var THICKNESS = 4;

var ACTIVATION_THRESHOLD = 0.8;
var LEARNING = 0.001;

var SAVE_ID = 0;

var pixels = [];

var learnedNumbers = [];

var neuralNetwork = [];
var activation = [];

var mousePressed = false;
var mousePixelIndex = -1;

var graphicsChart;

function init() {

    var canvas = document.getElementById("canvas");
    GRID_WIDTH = Math.floor(canvas.width/PIXEL_SIZE);
    GRID_HEIGHT = Math.floor(canvas.height/PIXEL_SIZE);
    var nbr_pixel = GRID_HEIGHT * GRID_WIDTH;

    LEARNING = 5 / nbr_pixel;
    ACTIVATION_THRESHOLD = 0.6;
    THICKNESS = Math.floor(GRID_WIDTH / 20) > 1 ? Math.floor(GRID_WIDTH / 20) : 1;

    resetCanvas();

    /* Création du réseau de neurones */
    for (var x = 0; x < nbr_pixel; x++) {
        neuralNetwork[x] = [];
        for (var y = 0; y < OUTPUT_COUNT; y++) {
            neuralNetwork[x][y] = 0.0;
        }
    }

    canvas.addEventListener("click", function(e) {
        var mousePoint = mouseCanvasPosition(e);
        setPixelValueAtPoint(mousePoint);
        drawPixels();
    });

    canvas.addEventListener("mousedown", function() {
        mousePressed = true;
    }, false);
    canvas.addEventListener("mouseup", function() {
        mousePressed = false;
    }, false);

    canvas.addEventListener("mousemove", function(e) {
        if(mousePressed) {
            var mousePoint = mouseCanvasPosition(e);
            var pixelIndex = pixelIndexAtPoint(mousePoint);
            if(pixelIndex != mousePixelIndex) {
                setPixelValueAtPoint(mousePoint);
                drawPixels();
                mousePixelIndex = pixelIndex;
            }
        }
    });

    var activationSlider = document.getElementById('activation_slider');
    var trainingSlider = document.getElementById('training_slider');
    var thicknessSlider = document.getElementById('thickness_slider');

    activationSlider.min = 0.2;
    activationSlider.max = 1;
    activationSlider.step = 0.05;
    activationSlider.value = ACTIVATION_THRESHOLD;
    activationSlider.onchange = function() {
        ACTIVATION_THRESHOLD = activationSlider.value;
        document.getElementById('activation_display').innerHTML = activationSlider.value;
        updateGraphic()
    };

    trainingSlider.min = 1 / (nbr_pixel);
    trainingSlider.max = 10 / nbr_pixel;
    trainingSlider.step = 1 / (nbr_pixel * 10);
    trainingSlider.value = LEARNING;
    trainingSlider.onchange = function() {
        LEARNING = trainingSlider.value;
        document.getElementById('training_display').innerHTML = trainingSlider.value;
    };

    thicknessSlider.min = 0;
    thicknessSlider.max = Math.ceil(GRID_WIDTH / 10);
    thicknessSlider.step = 1;
    thicknessSlider.value = THICKNESS;
    thicknessSlider.onchange = function() {
        THICKNESS = thicknessSlider.value;
        document.getElementById('thickness_display').innerHTML = thicknessSlider.value;
    };

    document.getElementById('activation_display').innerHTML = "" + ACTIVATION_THRESHOLD;
    document.getElementById('training_display').innerHTML = "" + LEARNING;
    document.getElementById('thickness_display').innerHTML = "" + THICKNESS;

    // le graphique
    graphicsChart = new Highcharts.Chart({
        chart: {
            renderTo: 'chartContainer',
            type: 'column'
        },
        title: {
            text: null
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        },
        yAxis: {
            title: {text: null},
            plotLines: [{
                value: ACTIVATION_THRESHOLD,
                color: 'rgb(255, 0, 0)',
                width: 2,
                id: 'activation_threshold'
            }]
        },
        series: [{
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }]
    });
}

function updateGraphic() {
    graphicsChart.series[0].update({
        data: activation
    }, true);

    graphicsChart.yAxis[0].removePlotLine('activation_threshold');
    graphicsChart.yAxis[0].addPlotLine({
        value: ACTIVATION_THRESHOLD,
        color: 'rgb(255, 0, 0)',
        width: 2,
        id: 'activation_threshold'
    });
}

function learnClicked() {

    var learnedNumber = parseInt($("#inputNumber").val());
    learn(learnedNumber);
    processClicked();
}

function saveNumberClicked() {

    var learnedNumber = parseInt($("#inputNumber").val());

    if (learnedNumber >= 0 && learnedNumber < OUTPUT_COUNT) {
        learnedNumbers[SAVE_ID] = [];
        learnedNumbers[SAVE_ID]['table'] = [];
        learnedNumbers[SAVE_ID]['number'] = learnedNumber;
        for (var x = 0; x < GRID_WIDTH; x++) {
            learnedNumbers[SAVE_ID]['table'][x] = [];
            for (var y = 0; y < GRID_HEIGHT;y++) {
                learnedNumbers[SAVE_ID]['table'][x][y] = pixels[x][y];
            }
        }
        refreshList(learnedNumber, SAVE_ID);
        SAVE_ID++;
    }
}

function refreshList(learnedNumber, id) {

    var element_liste = document.createElement('div');
    var div_row = document.createElement('div');
    var div_text = document.createElement('div');
    var div_group = document.createElement('div');
    var button = document.createElement('button');
    var button_span = document.createElement('span');

    button_span.className = 'glyphicon glyphicon-remove';

    button.className = 'btn btn-danger btn-xs';
    button.type = 'button';
    button.onclick = function(e) {
        learnedNumbers[id] = [];
        document.getElementById('save_' + id).remove();
        var nbr = document.getElementById('listOfNumbers').childNodes.length;
        document.getElementById('nbr-save').innerHTML = "" + nbr;
        e.stopPropagation();
    };

    button.appendChild(button_span);

    div_text.className = 'col-md-8 pull-left';
    div_text.innerHTML = learnedNumber;

    div_group.className = 'col-md-4 pull-right text-right';
    div_group.appendChild(button);

    div_row.className = 'row';
    div_row.appendChild(div_text);
    div_row.appendChild(div_group);

    element_liste.id = 'save_' + id;
    element_liste.setAttribute('data-number-save', learnedNumber);
    element_liste.setAttribute('data-id-save', id);
    element_liste.className = 'list-group-item';
    element_liste.appendChild(div_row);
    element_liste.onclick = function () {
        pixels = [];
        for (var x = 0; x < GRID_WIDTH; x++) {
            pixels[x] = [];
            for (var y = 0; y < GRID_HEIGHT; y++) {
                pixels[x][y] = learnedNumbers[id]['table'][x][y];
            }
        }
        drawPixels();
        process();
    };

    document.getElementById('listOfNumbers').appendChild(element_liste);
    var nbr = document.getElementById('listOfNumbers').childNodes.length;
    document.getElementById('nbr-save').innerHTML = "" + nbr;
}

function processClicked() {

    var processedNumbers = [];

    process();

    for (var i = 0; i < OUTPUT_COUNT; i++) {
        if (activation[i] >= ACTIVATION_THRESHOLD)
            processedNumbers.push(i);
    }

    showProcessedNumbers(processedNumbers);
}

function changeDataPixel(data) {
    for (var x = 0; x < GRID_WIDTH; x++) {
        pixels[x] = [];
        for (var y = 0; y < GRID_HEIGHT;y++) {
            pixels[x][y] = data[x][y];
        }
    }
}

function learnAllElements() {

    var learning_programm = [];
    var list_of_save = document.getElementById('listOfNumbers').childNodes;
    var nbrElementAApprendre = list_of_save.length;
    var i,j;

    for(i = 0; i < nbrElementAApprendre; i++) {
        learning_programm.push({
            'id' : list_of_save[i].getAttribute('data-id-save'),
            'number' : list_of_save[i].getAttribute('data-number-save')
        });
    }

    console.log(learning_programm);


    var infinitLoop = 0;
    var number;
    var id;
    var allCorrect = 0;
    var processedNumbers = [];

    while (allCorrect < nbrElementAApprendre && infinitLoop < 20) {

        allCorrect = 0;

        for (i = 0; i < nbrElementAApprendre; i++) {

            number = learning_programm[i]['number'];
            id = learning_programm[i]['id'];
            processedNumbers = [];
            changeDataPixel(learnedNumbers[id]['table']);
            process();

            for (j = 0; j < OUTPUT_COUNT; j++) {
                if (activation[j] >= ACTIVATION_THRESHOLD)
                    processedNumbers.push(j);
            }

            console.log("apprend le n°" + number + " -  processed = " + processedNumbers[0]);
            if (processedNumbers.length != 1 || processedNumbers[0] != number) {
                console.log("no!");
                learn(number);
            } else {
                allCorrect++;
            }
        }
        console.log("total = " + nbrElementAApprendre + "; correct = " + allCorrect);
        infinitLoop++;
    }

    if (infinitLoop > 50)
        console.log("sortie pas boucle infinit!");

    drawPixels();
}

function showProcessedNumbers(processedNumbers) {
    var result = "";
    for(var i = 0; i < processedNumbers.length; i++) {
        result += processedNumbers[i].toString() + ",";
    }
    if(result.length > 0) result = result.substring(0, result.length-1);
    $("#outputNumber").val(result);
}

/* ------  */

/**
 * A = somme(E*p) si E > seuil
 * P = P + t*(A-O)*E
 * @param {number} number
 */
function learn(number) {

    var i, x, posX, posY;
    var size = GRID_WIDTH * GRID_HEIGHT;

    process();

    for (i = 0; i < OUTPUT_COUNT; i++) {

        var A = (i == number) ? 1 : 0;
        var O = (activation[i] >= ACTIVATION_THRESHOLD) ? 1 : 0;
        var delta = A - O;

        for (x = 0; x < size; x++) {
            posX = x % GRID_WIDTH;
            posY = Math.floor(x / GRID_WIDTH);
            var E = pixels[posX][posY];
            neuralNetwork[x][i] += LEARNING * delta * E;
        }
    }
    console.log("learn");
    process();
}

function process() {

    // les sorties sont initialisées à 0
    for (var i = 0; i < OUTPUT_COUNT; i++)
        activation[i] = 0.0;

    for (var x = 0, size = GRID_HEIGHT * GRID_WIDTH; x < size; x++) {

        var posX = x % GRID_WIDTH;
        var posY = Math.floor(x / GRID_WIDTH);

        for (var y = 0; y < OUTPUT_COUNT; y++)
            activation[y] += neuralNetwork[x][y] * pixels[posX][posY];
    }

    console.log("process");
    console.log(activation);
    updateGraphic();
}

/* ------  */

function mouseCanvasPosition(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function pixelIndexAtPoint(point) {
    var pixelIndex = -1;
    var x = Math.floor(point.x/PIXEL_SIZE);
    var y = Math.floor(point.y/PIXEL_SIZE);
    if(x < GRID_WIDTH && y < GRID_HEIGHT) {
        pixelIndex = y * GRID_WIDTH + x;
    }
    return pixelIndex;
}

function setPixelValueAtPoint(point) {
    var x = Math.floor(point.x/PIXEL_SIZE);
    var y = Math.floor(point.y/PIXEL_SIZE);
    if(x < GRID_WIDTH && y < GRID_HEIGHT)
        drawNeighboursPixels(x, y);
}

function drawNeighboursPixels(x, y) {

    var write_mode = document.getElementById('pen_write').checked;
    pixels[x][y] = write_mode ? 1.0 : 0.0;

    for (var x2 = x - THICKNESS, xMax = x + THICKNESS; x2 < xMax; x2++) {

        if (x2 < 0 || x2 >= pixels.length)
            continue;

        for (var y2 = y - THICKNESS, yMax = y + THICKNESS; y2 < yMax; y2++) {

            if (y2 < 0 || y2 >= pixels[x2].length)
                continue;

            var deltaX = x2 - x;
            var deltaY = y2 - y;
            var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (dist > THICKNESS)
                continue;

            var value = write_mode ? 1.0 - (dist * 0.5 / THICKNESS) : 0.0;
            var value_pixel = pixels[x2][y2];

            if (write_mode && value_pixel < value || !write_mode)
                pixels[x2][y2] = value;
        }
    }
}


function resetCanvas() {
    document.getElementById('inputNumber').value = "";
    resetPixels();
    drawPixels();
}

function resetPerceptron() {
    for (var i = 0, size = GRID_WIDTH * GRID_HEIGHT; i < size; i++) {
        for (var j = 0; j < OUTPUT_COUNT; j++) {
            neuralNetwork[i][j] = 0.0;
        }
    }
    process();
    updateGraphic();
}

function resetPixels() {
    for(var x = 0; x < GRID_WIDTH; x++) {
        pixels[x] = [];
        for(var y = 0; y < GRID_HEIGHT; y++) {
            pixels[x][y] = 0;
        }
    }
}

function drawPixels() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(canvas.x, canvas.y, canvas.width, canvas.height);
    for(var y = 0; y < GRID_HEIGHT; y++) {
        for(var x = 0; x < GRID_WIDTH; x++) {
            context.beginPath();
            context.rect(x*PIXEL_SIZE, y*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
//                        context.rect(canvas.x + x*PIXEL_SIZE, canvas.y + y*PIXEL_SIZE, canvas.x + PIXEL_SIZE, canvas.y + PIXEL_SIZE);

            // couleur du pixel
            if (pixels[x][y] >= 0.9) context.fillStyle = '#2D2';
            if (pixels[x][y] < 0.9) context.fillStyle = '#2B2';
            if (pixels[x][y] < 0.8) context.fillStyle = '#292';
            if (pixels[x][y] < 0.7) context.fillStyle = '#272';
            if (pixels[x][y] < 0.6) context.fillStyle = '#252';
            if (pixels[x][y] < 0.5) context.fillStyle = '#555';

            context.fill();
        }
    }
}

$(document).ready(function() {
    init();
});