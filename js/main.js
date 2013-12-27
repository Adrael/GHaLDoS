/**
 * Created with IntelliJ IDEA.
 * User: eptwalabha
 * Date: 24/12/13
 * Time: 20:05
 */
$(document).ready(function() {

    var NBR_PIXEL_X = 15;
    var NBR_PIXEL_Y = 20;
    var VALUE = 1.0;
    var mousePressed = false;
    var idSave = 0;
    var canvasHistoric = [];

    var canvas = document.getElementById("canvas");
//    création du module d'affichage
    var canvasDisplay = new CanvasDisplay(canvas, NBR_PIXEL_X, NBR_PIXEL_Y);
    canvasDisplay.resetCanvas();

//    création du perceptron
    var perceptron = new Perceptron(NBR_PIXEL_X * NBR_PIXEL_Y, 10);
    perceptron.initializePerceptron();

//    gestion des évènements de la souris par le canvas
    canvas.addEventListener("click", function(e) {
        var mousePoint = canvasDisplay.mouseCanvasPosition(e);
        canvasDisplay.setPixelValueAtPoint(mousePoint, VALUE);
        canvasDisplay.drawPixels();
    });

    canvas.addEventListener("mousedown", function() {
        mousePressed = true;
    }, false);

    canvas.addEventListener("mouseup", function() {
        mousePressed = false;
    }, false);

    canvas.addEventListener("mousemove", function(e) {
        if (mousePressed) {
            var mousePoint = canvasDisplay.mouseCanvasPosition(e);
            var pixelIndex = canvasDisplay.pixelIndexAtPoint(mousePoint);
            if (pixelIndex != canvasDisplay.lastMousePixelIndex) {
                canvasDisplay.setPixelValueAtPoint(mousePoint, VALUE);
                canvasDisplay.drawPixels();
                canvasDisplay.lastMousePixelIndex = pixelIndex;
            }
        }
    });

    document.getElementById("resetCanvas").onclick  = function() {
        canvasDisplay.resetCanvas();
        document.getElementById("inputNumber").value = "";
    };
    document.getElementById("resetPerceptron").onclick = function() {
        perceptron.initializePerceptron();
        updateGraphic(perceptron.activation);
    };

    document.getElementById("learnClicked").onclick	 = function() {
        // the number to learn
        var component = document.getElementById("inputNumber");

        if(component.value.length === 0) {
            alert("You have to enter a number first!");
        } else {
            var learnedNumber = parseInt(component.value);
            var values = canvasDisplay.getPixelsValue();
            perceptron.learnInput(values, learnedNumber);

        }
    };

    document.getElementById("processClicked").onclick = function() {
        perceptron.processInput(canvasDisplay.getPixelsValue());
        var processedNumbers = perceptron.activation;
        var result = [];
        for (var i = 0, size = processedNumbers.length; i < size; i++) {
            if (processedNumbers[i] > perceptron.activationThreshold)
                result.push(i);
        }
        document.getElementById("outputNumber").value = result.join(", ");

        updateGraphic(perceptron.activation);
        console.log(perceptron.activation);
    };

    document.getElementById("learnAllElements").onclick = function() {
        perceptron.learnAllInput(canvasHistoric);
        // TODO ici la fonction pour mettre à jour le graphique (rapport d'apprentissage)
        updateGraphicTraining(perceptron.trainingReport);
        console.log(perceptron.trainingReport);
    };

    document.getElementById("saveNumberClicked").onclick = function() {
        var component = document.getElementById("inputNumber");
        var learnedNumber = parseInt(component.value);
        var id = idSave;
        idSave++;

        canvasHistoric.push({
            'id' : id,
            'number' : learnedNumber,
            'table' : canvasDisplay.getPixelsValue()
        });

        var element_liste = document.createElement('div');
        var div_row = document.createElement('div');
        var div_text = document.createElement('div');
        var div_group = document.createElement('div');
        var button = document.createElement('button');
        var button_span = document.createElement('span');

        button_span.className = 'glyphicon glyphicon-remove';

        button.className = 'btn btn-danger btn-xs';
        button.type = 'button';

        // suppression de l'enregistrement
        button.onclick = function(e) {

            canvasHistoric[id]['table'] = [];
            document.getElementById('save_' + id).remove();

            updateListCount();

            e.stopPropagation();
        };

        button.appendChild(button_span);

        div_text.className = 'col-md-8 pull-left';
        div_text.innerHTML = learnedNumber.toString();

        div_group.className = 'col-md-4 pull-right text-right';
        div_group.appendChild(button);

        div_row.className = 'row';
        div_row.appendChild(div_text);
        div_row.appendChild(div_group);

        element_liste.id = 'save_' + id;
        element_liste.setAttribute('data-number-save', learnedNumber.toString());
        element_liste.setAttribute('data-id-save', id.toString());
        element_liste.className = 'list-group-item';
        element_liste.style.cursor = "pointer";
        element_liste.appendChild(div_row);
        element_liste.onclick = function() {
            canvasDisplay.setPixelsValuesFromList(canvasHistoric[id]['table']);
            canvasDisplay.drawPixels();
            perceptron.processInput(canvasHistoric[id]['table']);
            updateGraphic(perceptron.activation);
            console.log(perceptron.activation);
        };

        document.getElementById('listOfNumbers').appendChild(element_liste);
        updateListCount();
    };

    var activationSlider = document.getElementById('activation_slider');
    var trainingSlider   = document.getElementById('training_slider');
    var thicknessSlider  = document.getElementById('thickness_slider');

    activationSlider.min = 0.2;
    activationSlider.max = 1;
    activationSlider.step = 0.05;
    activationSlider.value = perceptron.activationThreshold = 0.8;
    activationSlider.onchange = function() {
        perceptron.activationThreshold = activationSlider.value;
        document.getElementById('activation_display').innerHTML = activationSlider.value;
    };

    var nbrPixel = canvasDisplay.pixelNumber.x * canvasDisplay.pixelNumber.y;
    trainingSlider.min = 1 / (nbrPixel);
    trainingSlider.max = 10 / nbrPixel;
    trainingSlider.step = 1 / (nbrPixel * 10);
    trainingSlider.value = perceptron.trainingRate = 4 / nbrPixel;
    trainingSlider.onchange = function() {
        perceptron.trainingRate = trainingSlider.value;
        document.getElementById('training_display').innerHTML = trainingSlider.value;
    };

    thicknessSlider.min = 0;
    thicknessSlider.max = Math.ceil(canvasDisplay.pixelNumber.x / 10);
    thicknessSlider.step = 1;
    thicknessSlider.value = 0;
    thicknessSlider.onchange = function() {
        canvasDisplay.thickness = thicknessSlider.value;
        document.getElementById('thickness_display').innerHTML = thicknessSlider.value;
    };

    document.getElementById('activation_display').innerHTML = perceptron.activationThreshold.toString();
    document.getElementById('training_display').innerHTML = perceptron.trainingRate.toString();
    document.getElementById('thickness_display').innerHTML = canvasDisplay.thickness.toString();

    $("#pen_mode input").change(function() {
        canvasDisplay.writeMode = document.getElementById("pen_write").checked;
    });

    // le graphique
    var graphicsChart = new Highcharts.Chart({
        chart: {
            renderTo: 'chartContainerOutput',
            type: 'column'
        },
        title: {text: null},
        legend: {enabled: false},
        xAxis: {categories: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']},
        yAxis: {
            title: {text: null},
            plotLines: [{
                value: perceptron.activationThreshold,
                color: 'rgb(255, 0, 0)',
                width: 2,
                id: 'activation_threshold'
            }]
        },
        series: [{data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}]
    });

    // le graphique
    var graphicsChart2 = new Highcharts.Chart({
        chart: {
            renderTo: 'chartContainerTrainingReport'
        },
        title: {text: null},
        legend: {enabled: false},
        series: [{data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}]
    });

    function updateListCount() {

        var nbr = document.getElementById('listOfNumbers').childNodes.length;
        var component = document.getElementById('nbr-save');

        if(nbr < 1) {
            component.style.opacity = 0;
        } else {
            component.style.opacity = 1;
            component.innerHTML = "" + nbr;
        }
    }

    function updateGraphic(data) {
        graphicsChart.series[0].update({
            data: data
        }, true);

        graphicsChart.yAxis[0].removePlotLine('activation_threshold');
        graphicsChart.yAxis[0].addPlotLine({
            value: perceptron.activationThreshold,
            color: 'rgb(255, 0, 0)',
            width: 2,
            id: 'activation_threshold'
        });
    }

    function updateGraphicTraining(data) {
        graphicsChart2.series[0].update({
            data: data
        }, true);
    }


});
