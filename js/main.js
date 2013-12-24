
/**
 * Created with IntelliJ IDEA.
 * User: eptwalabha
 * Date: 24/12/13
 * Time: 20:05
 */

$.ready(function() {

//    création du module d'affichage
    var canvasDisplay = new CanvasDisplay(document.getElementById("canvas"), 15, 20);
    canvasDisplay.resetCanvas();

//    création du perceptron
    var perceptron = new Perceptron();
    perceptron.initializePerceptron();

});