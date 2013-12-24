/**
 * Created with IntelliJ IDEA.
 * User: eptwalabha
 * Date: 24/12/13
 * Time: 21:12
 */
function CanvasDisplay(canvas, x, y) {
    this.canvas = canvas;

    var pixelNumber = {
        x : x,
        y : y
    };
    var pixelSize = {
        x : canvas.width / x,
        y : canvas.height / y
    };

    this.thickness = 0;
    this.pixels = [];

    /**
     *  Returns the index of the pixel where the point belong
     *	@param {object} point
     */
    this.pixelIndexAtPoint = function(point) {
        var pixelIndex = -1;
        var x = Math.floor(point.x / pixelSize.x);
        var y = Math.floor(point.y / pixelSize.y);
        if (x < this.canvas.width && y < this.canvas.height)
            pixelIndex = y * canvas.width + x;
        return pixelIndex;
    };

    /**
     *
     *	@param {object} point - ...
     *  @param {int} value.
     */
    this.setPixelValueAtPoint = function(point, value) {
        var x = Math.floor(point.x / pixelSize.x);
        var y = Math.floor(point.y / pixelSize.y);
        if (x < this.canvas.width && y < this.canvas.height)
            this.drawNeighboursPixels(x, y, value);
    };

    /**
     * Initialize the pixels table
     */
    this.resetCanvas = function () {

        this.pixels = [];

        for (var x = 0; x < pixelNumber.x; x++) {
            this.pixels[x] = [];
            for (var y = 0; y < pixelNumber.y; y++)
                this.pixels[x][y] = 0;
        }

        this.drawPixels();
    };

    /**
     * Returns a list of all the pixel's values.
     */
    this.getPixelsValue = function () {

        var posX, posY, input = [];
        for (var i = 0, size = pixelNumber.x * pixelNumber.y; i < size; i++) {
            posX = i % pixelNumber.x;
            posY = Math.floor(i / pixelNumber.x);
            input[i] = this.pixels[posX][posY];
        }
        return input;
    };

    /**
     * Copy the given matrix into the pixel matrix
     * @param newPixelsValues
     */
    this.setPixelsValues = function (newPixelsValues) {

        this.pixels = [];
        for (var x = 0, sizeX = newPixelsValues.length; x < sizeX; x++) {
            this.pixels[x] = [];
            for (var y = 0, sizeY = newPixelsValues[x].length; y < sizeY; y++)
                this.pixels[x][y] = newPixelsValues[x][y];
        }
    };

    /**
     * Set the pixel at position (x, y) the given value,<br>
     * If the pixels value goes below 0, it is then set to 0.
     * @param {int} x
     * @param {int} y
     * @param {int} value
     */
    this.drawNeighboursPixels = function(x, y, value) {

        if (this.pixels.length == 0)
            this.resetCanvas();

        var writeMode = value > 0;
        var absValue = Math.abs(value);
        var coeffValue = Math.abs(value) / (2 * this.thickness);

        if (this.pixels[x][y] + value > 0)
            this.pixels[x][y] += value;
        else
            this.pixels[x][y] = 0;

        for (var x2 = x - this.thickness, xMax = x + this.thickness; x2 < xMax; x2++) {

            if (x2 < 0 || x2 >= pixelNumber.x)
                continue;

            for (var y2 = y - this.thickness, yMax = y + this.thickness; y2 < yMax; y2++) {

                if (y2 < 0 || y2 >= pixelNumber.y)
                    continue;

                var deltaX = x2 - x;
                var deltaY = y2 - y;
                var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (dist > this.thickness)
                    continue;

                var reviewedValue = absValue - (dist * coeffValue);

                if (!writeMode)
                    reviewedValue *= -1;

                if (this.pixels[x2][y2] + reviewedValue > 0)
                    this.pixels[x2][y2] += reviewedValue;
                else
                    this.pixels[x2][y2] = 0;
            }
        }
    };

    /**
     *  Draw the pixel matrix on the canvas
     */
    this.drawPixels = function() {

        var context = this.canvas.getContext("2d");
        context.clearRect(this.canvas.x, this.canvas.y, this.canvas.width, this.canvas.height);

        for(var y = 0; y < this.canvas.height; y++) {
            for(var x = 0; x < this.canvas.width; x++) {
                context.beginPath();
                context.rect(x * pixelSize.x, y * pixelSize.y, pixelSize.x, pixelSize.y);

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
    };
}
