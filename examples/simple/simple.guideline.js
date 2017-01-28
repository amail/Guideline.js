// Example Guide

var simpleGuide = new Guideline.Guide("simple");

var maypage = simpleGuide.addPage("maypage");

maypage.addStep({
    type: "overlay",
    title: "My application",
    showSkip: false,
    content: (
        "<p>This is a simple example with <strong>Guideline.js</strong></p>"+
        "<button class='gl-continue btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Amazing... Show me more!</button>"+
        "<br/>"+
        "<a href='#' class='gl-skip'>I don't care. Skip this.</a>"
    )
});


var next_btn = "<button type='button' class='btn btn-xs btn-primary'>"+
                  "Next"+
                "</button>"

var prev_btn = "<button type='button' class='btn btn-xs btn-primary'>"+
                  "Previous"+
                "</button>"

var stepControlContainer = "<div class='btn-group btn-group-xs step-control-container'/>"

maypage.addStep({
    title: "Home!",
    content: (
        "<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>"+
        "<br/>"
    ),
    showAt: "#home-tab",
    align: "center top",
    continueHtml: next_btn,
    previousHtml: prev_btn,
    stepControlContainer,
    showContinue: true,
    showPrevious: true
});

maypage.addStep({
    type: "overlay",
    title: "Profile!",
    content: (
        "<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>"+
        "<br/>"
    ),
    showAt: "#profile-tab",
    align: "right middle",
    continueHtml: next_btn,
    previousHtml: prev_btn,
    stepControlContainer,
    showContinue: true,
    showPrevious: true
});


maypage.addStep({
    type: "overlay",
    title: "Learn more!",
    content: (
        "<p>For more infirmtions.</p>"+
        "<br/>"
    ),
    showAt: "#btn-more",
    align: "center bottom",
    continueHtml: next_btn,
    previousHtml: prev_btn,
    stepControlContainer,
    showContinue: true,
    showPrevious: true
});

simpleGuide.register();

$(document).ready(function(){
  Guideline.setCurrentPage("maypage");
})