/*!
 * perceptron.js
 * https://github.com/Adrael/GHaLDoS/blob/master/perceptron.js
 * 
 *
 * Copyright (C) 2013
 */

 'use strict';

/**
 *	Constructor for Perceptron
 * 
 *	@param {} none
 */
function Perceptron() {

	this.PIXEL_SIZE 		  = 15;		// Size of a canvas pixel in screen's pixels
	this.GRID_WIDTH 		  = 0;		// 
	this.GRID_HEIGHT 		  = 0;		// 
	this.OUTPUT_COUNT 		  = 10;		// Numbers that are recognized by the perceptron, starting at 0
	this.THICKNESS 			  = 4;		// 
	this.ACTIVATION_THRESHOLD = 0.8;	// The threshold the perceptron is activated with
	this.LEARNING 			  = 0.001;	// 
	this.SAVE_ID 			  = 0;		// 

	// Data arrays
	this.pixels 		= [];
	this.learnedNumbers = [];
	this.neuralNetwork  = [];
	this.activation 	= [];

	// Mouse controls
	this.mousePressed 	 = false;
	this.mousePixelIndex = -1;

	// The chart that is displayed at the bottom showing the results
	this.graphicsChart = undefined;
}

/**
 *	Iniatializes the objects that are needed
 *	for the perceptron to work
 * 
 *	@param {} none
 */
Perceptron.prototype.initialize = function() {

    var canvas 		 = document.getElementById("canvas");
    this.GRID_WIDTH  = Math.floor(canvas.width  / this.PIXEL_SIZE);
    this.GRID_HEIGHT = Math.floor(canvas.height / this.PIXEL_SIZE);
    var nbr_pixel    = this.GRID_HEIGHT * this.GRID_WIDTH;

    this.LEARNING = 5 / nbr_pixel;
    this.ACTIVATION_THRESHOLD = 0.6;
    this.THICKNESS = Math.floor(this.GRID_WIDTH / 20) > 1 ? Math.floor(this.GRID_WIDTH / 20) : 1;

    this.resetCanvas();

    for (var x = 0; x < nbr_pixel; x++) {
        this.neuralNetwork[x] = [];
        for (var y = 0; y < this.OUTPUT_COUNT; y++) {
            this.neuralNetwork[x][y] = 0.0;
        }
    }

    var self = this;

    canvas.addEventListener("click", function(e) {
        var mousePoint = self.mouseCanvasPosition(e);
        self.setPixelValueAtPoint(mousePoint);
        self.drawPixels();
    });

    canvas.addEventListener("mousedown", function() {
        self.mousePressed = true;
    }, false);

    canvas.addEventListener("mouseup", function() {
        self.mousePressed = false;
    }, false);

    canvas.addEventListener("mousemove", function(e) {
        if(self.mousePressed) {
            var mousePoint = self.mouseCanvasPosition(e);
            var pixelIndex = self.pixelIndexAtPoint(mousePoint);
            if(pixelIndex != self.mousePixelIndex) {
                self.setPixelValueAtPoint(mousePoint);
                self.drawPixels();
                self.mousePixelIndex = pixelIndex;
            }
        }
    });

    document.getElementById("resetCanvas").onclick  = function() {self.resetCanvas();};
    document.getElementById("learnClicked").onclick	 = function() {self.learnClicked();};
    document.getElementById("processClicked").onclick = function() {self.processClicked();};
    document.getElementById("resetPerceptron").onclick = function() {self.resetPerceptron();};
    document.getElementById("learnAllElements").onclick = function() {self.learnAllElements();};
    document.getElementById("saveNumberClicked").onclick = function() {self.saveNumberClicked();};

    var activationSlider = document.getElementById('activation_slider');
    var trainingSlider   = document.getElementById('training_slider');
    var thicknessSlider  = document.getElementById('thickness_slider');

    activationSlider.min = 0.2;
    activationSlider.max = 1;
    activationSlider.step = 0.05;
    activationSlider.value = this.ACTIVATION_THRESHOLD;
    activationSlider.onchange = function() {
        self.ACTIVATION_THRESHOLD = activationSlider.value;
        document.getElementById('activation_display').innerHTML = activationSlider.value;
        self.updateGraphic()
    };

    trainingSlider.min = 1 / (nbr_pixel);
    trainingSlider.max = 10 / nbr_pixel;
    trainingSlider.step = 1 / (nbr_pixel * 10);
    trainingSlider.value = this.LEARNING;
    trainingSlider.onchange = function() {
        self.LEARNING = trainingSlider.value;
        document.getElementById('training_display').innerHTML = trainingSlider.value;
    };

    thicknessSlider.min = 0;
    thicknessSlider.max = Math.ceil(this.GRID_WIDTH / 10);
    thicknessSlider.step = 1;
    thicknessSlider.value = this.THICKNESS;
    thicknessSlider.onchange = function() {
        self.THICKNESS = thicknessSlider.value;
        document.getElementById('thickness_display').innerHTML = thicknessSlider.value;
    };

    document.getElementById('activation_display').innerHTML = "" + this.ACTIVATION_THRESHOLD;
    document.getElementById('training_display').innerHTML = "" + this.LEARNING;
    document.getElementById('thickness_display').innerHTML = "" + this.THICKNESS;

    // le graphique
    this.graphicsChart = new Highcharts.Chart({
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
                value: this.ACTIVATION_THRESHOLD,
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

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.updateGraphic = function() {
    this.graphicsChart.series[0].update({
        data: this.activation
    }, true);

    this.graphicsChart.yAxis[0].removePlotLine('activation_threshold');
    this.graphicsChart.yAxis[0].addPlotLine({
        value: this.ACTIVATION_THRESHOLD,
        color: 'rgb(255, 0, 0)',
        width: 2,
        id: 'activation_threshold'
    });
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.learnClicked = function() {
	var component = document.getElementById("inputNumber");

    if(component.value.length === 0) {
    	alert("You have to enter a number first!");
    } else {
    	var learnedNumber = parseInt(component.value);
	    this.learn(learnedNumber);
	    this.processClicked();
	}
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.saveNumberClicked = function() {

	var component = document.getElementById("inputNumber");

	if(component.value.length === 0) {
    	alert("You have to enter a number first!");
    } else {
    	var learnedNumber = parseInt(component.value);

	    if (learnedNumber >= 0 && learnedNumber < this.OUTPUT_COUNT) {
	        this.learnedNumbers[this.SAVE_ID] = [];
	        this.learnedNumbers[this.SAVE_ID]['table'] = [];
	        this.learnedNumbers[this.SAVE_ID]['number'] = learnedNumber;
	        for (var x = 0; x < this.GRID_WIDTH; x++) {
	            this.learnedNumbers[this.SAVE_ID]['table'][x] = [];
	            for (var y = 0; y < this.GRID_HEIGHT;y++) {
	                this.learnedNumbers[this.SAVE_ID]['table'][x][y] = this.pixels[x][y];
	            }
	        }
	        this.refreshList(learnedNumber, this.SAVE_ID);
	        this.SAVE_ID++;
    	}
	}
}

/**
 *	
 * 
 *	@param {number} learnedNumber - ...
 *	@param {number} id - ...
 */
Perceptron.prototype.refreshList = function(learnedNumber, id) {

    var element_liste = document.createElement('div');
    var div_row = document.createElement('div');
    var div_text = document.createElement('div');
    var div_group = document.createElement('div');
    var button = document.createElement('button');
    var button_span = document.createElement('span');

    button_span.className = 'glyphicon glyphicon-remove';

    button.className = 'btn btn-danger btn-xs';
    button.type = 'button';

    var self = this;
    button.onclick = function(e) {
        self.learnedNumbers[id] = [];
        document.getElementById('save_' + id).remove();

        self.updateListCount();

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
    element_liste.style.cursor = "pointer";
    element_liste.appendChild(div_row);
    element_liste.onclick = function() {
        self.pixels = [];
        for (var x = 0; x < self.GRID_WIDTH; x++) {
            self.pixels[x] = [];
            for (var y = 0; y < self.GRID_HEIGHT; y++) {
                self.pixels[x][y] = self.learnedNumbers[id]['table'][x][y];
            }
        }
        self.drawPixels();
        self.process();
    };

    document.getElementById('listOfNumbers').appendChild(element_liste);
    this.updateListCount();
}

/**
 *	Updates the list count near the list title
 * 
 *	@param {} none
 */
Perceptron.prototype.updateListCount = function() {
	var nbr = document.getElementById('listOfNumbers').childNodes.length;
    var component = document.getElementById('nbr-save');

        if(nbr < 1) {
        	component.style.opacity = 0;
        }
        else {
        	component.style.opacity = 1;
        	component.innerHTML = "" + nbr;
        }
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.processClicked = function() {

	if(this.activation.length === 0) {
		alert("You have to learn a number in a first place!");
	} else {
	    var processedNumbers = [];

	    this.process();

	    for (var i = 0; i < this.OUTPUT_COUNT; i++) {
	        if (this.activation[i] >= this.ACTIVATION_THRESHOLD)
	            processedNumbers.push(i);
	    }

	    this.showProcessedNumbers(processedNumbers);
	}
}

/**
 *	
 * 
 *	@param {numbers array} data - ....
 */
Perceptron.prototype.changeDataPixel = function(data) {
    for (var x = 0; x < this.GRID_WIDTH; x++) {
        this.pixels[x] = [];
        for (var y = 0; y < this.GRID_HEIGHT;y++) {
            this.pixels[x][y] = data[x][y];
        }
    }
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.learnAllElements = function() {

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
            this.processedNumbers = [];
            this.changeDataPixel(this.learnedNumbers[id]['table']);
            this.process();

            for (j = 0; j < this.OUTPUT_COUNT; j++) {
                if (this.activation[j] >= this.ACTIVATION_THRESHOLD)
                    this.processedNumbers.push(j);
            }

            console.log("apprend le n°" + number + " -  processed = " + this.processedNumbers[0]);
            if (this.processedNumbers.length != 1 || this.processedNumbers[0] != number) {
                console.log("no!");
                this.learn(number);
            } else {
                allCorrect++;
            }
        }
        console.log("total = " + nbrElementAApprendre + "; correct = " + allCorrect);
        infinitLoop++;
    }

    if (infinitLoop > 50)
        console.log("sortie pas boucle infinit!");

   this.drawPixels();
}

/**
 *	
 * 
 *	@param {numbers array} processedNumbers - ...
 */
Perceptron.prototype.showProcessedNumbers = function(processedNumbers) {
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
 *
 * @param {number} number - ...
 */
Perceptron.prototype.learn = function(number) {

    var i, x, posX, posY;
    var size = this.GRID_WIDTH * this.GRID_HEIGHT;

    this.process();

    for (i = 0; i < this.OUTPUT_COUNT; i++) {

        var A = (i == number) ? 1 : 0;
        var O = (this.activation[i] >= this.ACTIVATION_THRESHOLD) ? 1 : 0;
        var delta = A - O;

        for (x = 0; x < size; x++) {
            posX = x % this.GRID_WIDTH;
            posY = Math.floor(x / this.GRID_WIDTH);
            var E = this.pixels[posX][posY];
            this.neuralNetwork[x][i] += this.LEARNING * delta * E;
        }
    }
    console.log("learn");
    this.process();
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.process = function() {

    // les sorties sont initialisées à 0
    for (var i = 0; i < this.OUTPUT_COUNT; i++)
        this.activation[i] = 0.0;

    for (var x = 0, size = this.GRID_HEIGHT * this.GRID_WIDTH; x < size; x++) {

        var posX = x % this.GRID_WIDTH;
        var posY = Math.floor(x / this.GRID_WIDTH);

        for (var y = 0; y < this.OUTPUT_COUNT; y++)
            this.activation[y] += this.neuralNetwork[x][y] * this.pixels[posX][posY];
    }

    console.log("process");
    console.log(this.activation);
    this.updateGraphic();
}

/* ------  */

/**
 *	
 * 
 *	@param {event} e - unused
 */
Perceptron.prototype.mouseCanvasPosition = function(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/**
 *	
 * 
 *	@param {object} point - ...
 */
Perceptron.prototype.pixelIndexAtPoint = function(point) {
    var pixelIndex = -1;
    var x = Math.floor(point.x / this.PIXEL_SIZE);
    var y = Math.floor(point.y / this.PIXEL_SIZE);
    if(x < this.GRID_WIDTH && y < this.GRID_HEIGHT) {
        pixelIndex = y * this.GRID_WIDTH + x;
    }
    return pixelIndex;
}

/**
 *	
 * 
 *	@param {object} point - ...
 */
Perceptron.prototype.setPixelValueAtPoint = function(point) {
    var x = Math.floor(point.x / this.PIXEL_SIZE);
    var y = Math.floor(point.y / this.PIXEL_SIZE);
    if(x < this.GRID_WIDTH && y < this.GRID_HEIGHT)
        this.drawNeighboursPixels(x, y);
}

/**
 *	
 * 
 *	@param {number} x - ...
 *	@param {number} y - ...
 */
Perceptron.prototype.drawNeighboursPixels = function(x, y) {

    var write_mode = document.getElementById('pen_write').checked;
    this.pixels[x][y] = write_mode ? 1.0 : 0.0;

    for (var x2 = x - this.THICKNESS, xMax = x + this.THICKNESS; x2 < xMax; x2++) {

        if (x2 < 0 || x2 >= this.pixels.length)
            continue;

        for (var y2 = y - this.THICKNESS, yMax = y + this.THICKNESS; y2 < yMax; y2++) {

            if (y2 < 0 || y2 >= this.pixels[x2].length)
                continue;

            var deltaX = x2 - x;
            var deltaY = y2 - y;
            var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (dist > this.THICKNESS)
                continue;

            var value = write_mode ? 1.0 - (dist * 0.5 / this.THICKNESS) : 0.0;
            var value_pixel = this.pixels[x2][y2];

            if (write_mode && value_pixel < value || !write_mode)
                this.pixels[x2][y2] = value;
        }
    }
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.resetCanvas = function() {
    document.getElementById('inputNumber').value = "";
    this.resetPixels();
    this.drawPixels();
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.resetPerceptron = function() {
    for (var i = 0, size = this.GRID_WIDTH * this.GRID_HEIGHT; i < size; i++) {
        for (var j = 0; j < this.OUTPUT_COUNT; j++) {
            this.neuralNetwork[i][j] = 0.0;
        }
    }
    this.process();
    this.updateGraphic();
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.resetPixels = function() {
    for(var x = 0; x < this.GRID_WIDTH; x++) {
        this.pixels[x] = [];
        for(var y = 0; y < this.GRID_HEIGHT; y++) {
            this.pixels[x][y] = 0;
        }
    }
}

/**
 *	
 * 
 *	@param {} none
 */
Perceptron.prototype.drawPixels = function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(canvas.x, canvas.y, canvas.width, canvas.height);
    for(var y = 0; y < this.GRID_HEIGHT; y++) {
        for(var x = 0; x < this.GRID_WIDTH; x++) {
            context.beginPath();
            context.rect(x * this.PIXEL_SIZE, y * this.PIXEL_SIZE, this.PIXEL_SIZE, this.PIXEL_SIZE);
//                        context.rect(canvas.x + x*PIXEL_SIZE, canvas.y + y*PIXEL_SIZE, canvas.x + PIXEL_SIZE, canvas.y + PIXEL_SIZE);

            // couleur du pixel
            if (this.pixels[x][y] >= 0.9) context.fillStyle = '#2D2';
            if (this.pixels[x][y] < 0.9)  context.fillStyle = '#2B2';
            if (this.pixels[x][y] < 0.8)  context.fillStyle = '#292';
            if (this.pixels[x][y] < 0.7)  context.fillStyle = '#272';
            if (this.pixels[x][y] < 0.6)  context.fillStyle = '#252';
            if (this.pixels[x][y] < 0.5)  context.fillStyle = '#555';

            context.fill();
        }
    }
}