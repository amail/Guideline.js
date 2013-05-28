// Example Code - AlphaMail
// This is a sample of the guide created for AlphaMail. Currently running live on http://app.amail.io/.
// http://app.amail.io/js/guideline/guides.js

var guide = new Guideline.Guide("welcome", {
    skipOnStart: true
});

var homePage = guide.addPage("ProjectListCtrl");

homePage.addStep({
    type: "overlay",
    overlay: {
    	style: {
    	    opacity: 0.9
    	}
    },
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>Welcome to AlphaMail!</h1>"+
            "<p>Let's get familiar with the dashboard by creating <strong>a new project</strong>, <strong>build a template</strong> for it, and then <strong>send a test message</strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Get started</button>"+
            "<br/>"+
            "<a href='#' class='gl-skip'>or skip this</a>"+
        "</div>"
});

homePage.addStep({
    title: "First, create a new project...",
    showAt: "#create-new-project",
    align: "right middle",
    continueWhen: "click #create-new-project",
    showNextStep: false
});

homePage.addStep({
    title: "Look at that, you have now created your first project!",
    content: "Click on it to continue...",
    showAt: ".new-project",
    align: "right middle",
    continueWhen: "click .new-project",
    showNextStep: false
});

var projectDetailsPage = guide.addPage("ProjectDetailsCtrl");

projectDetailsPage.addStep({
    type: "overlay",
    overlay: {
    	style: {
    	    opacity: 0.9
    	}
    },
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>Your first project</h1>"+
            "<p>Each project should represent each type of email that you want to send. This project could for example be your <strong>welcome email</strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Continue</button>"+
        "</div>"
});

projectDetailsPage.addStep({
    title: "Let's change the name of the project!",
    content: "Double-click on the text to change the name.",
    showAt: "div[edit-field='project.name']",
    continueWhen: "dblclick div[edit-field='project.name']",
    align: "right middle",
    showNextStep: false
});

projectDetailsPage.addStep({
    title: "Nice, now give it a suitable name with min. 4 chars",
    content: "E.g. 'Welcome Email'. Click outside the field to save.",
    showAt: "div[edit-field='project.name'] input",
    continueWhen: function(){
        var element = $("div[edit-field='project.name']");
        
        if(element.length == 0 || element.text() == 'New Project'){
            return false;
        }

        return element.text().length >= 4;
    },
    align: "right middle",
    showNextStep: false
});

projectDetailsPage.addStep({
    title: "Let's change the subject of the project!",
    content: "Double-click on the text to change the subject.",
    showAt: "div[edit-field='project.subject']",
    continueWhen: "dblclick div[edit-field='project.subject']",
    align: "right middle",
    showNextStep: false
});

projectDetailsPage.addStep({
    title: "Nice, now write a describing subject line",
    content: "E.g. 'Thanks for signing up for our app!'. Write a subject longer than 10 characters to continue.",
    showAt: "div[edit-field='project.subject'] input",
    continueWhen: function(){
        var element = $("div[edit-field='project.subject']");
        
        if(element.length == 0){
            return false;
        }

        return element.text().length >= 10;
    },
    align: "right middle",
    showNextStep: false
});

projectDetailsPage.addStep({
    title: "Next, click on the image to edit the template",
    showAt: "#project-image",
    continueWhen: 'click #project-image>a',
    align: "right middle",
    showNextStep: false
});

var editorPage = guide.addPage("EmailEditorCtrl");

editorPage.addStep({
    type: "overlay",
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>The email editor</h1>"+
            "<p>This is where you <strong>create and edit</strong> your email templates with simple <strong>drag and drop</strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Create a template</button>"+
        "</div>"
});

editorPage.addStep({
    title: "Choose a layout for your email",
    content: "For example this one!",
    showAt: ".layout-item:nth-child(1)",
    continueWhen: 'click .layout-item',
    align: "center top",
    showNextStep: false
});

editorPage.addStep({
    title: "Now, drag an image into the template to the right",
    content: "Place it in the first placeholder on top of the white area.",
    showAt: ".module-item:nth-child(1)",
    continueWhen: function(){
        return $(".edit-area [am-image]").length >= 1;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Next, add a Space below the image",
    content: "This will make some space between the image and the white area.",
    showAt: ".module-item:nth-child(9)",
    continueWhen: function(){
        return $('.edit-area [am-space]').length == 1;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Add another one right above the image",
    showAt: ".module-item:nth-child(9)",
    continueWhen: function(){
        return $('.edit-area [am-space]').length == 2;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Good, now add a Heading 1",
    content: "Place this one in the white area.",
    showAt: ".module-item:nth-child(7)",
    continueWhen: function(){
        return $('.edit-area [am-text-size="h1"]').length >= 1;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "And last, add a block of text",
    content: "Put this below the heading.",
    showAt: ".module-item:nth-child(3)",
    continueWhen: function(){
        return $('.edit-area [am-text-size="normal"]').length >= 1;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Click on the image to edit it",
    showAt: "[am-image]",
    continueWhen: "click [am-image]",
    align: "left middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Enter the URL to your company logo",
    content: "Or just leave it as it is.",
    showAt: '[edit-image="src"]',
    continueWhen: false,
    align: "right middle",
    showNextStep: true,
    continueHtml: '<button class="btn btn-alpha-blue btn-small"><i class="icon-circle-arrow-right"></i> Continue</button>'
});

editorPage.addStep({
    title: "Click on the space to edit it",
    showAt: "[am-space]",
    continueWhen: "click [am-space]",
    align: "left middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Increase the space",
    content: "Make it at least 30px to continue.",
    showAt: "[edit-space]",
    continueWhen: function(){
        return parseInt($('[edit-space]').val()) >= 30;
    },
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Sweet, now click on the heading to change it",
    showAt: '[am-text-size="h1"]',
    continueWhen: 'click [am-text-size="h1"]',
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Enter a nice title containing '<# payload.name #>'",
    content: "E.g. 'Welcome, <# payload.name #>!'.",
    showAt: "iframe",
    continueWhen: function(){
    	var result = false;
    	
    	$('[am-text-size="h1"] .comlang-tag').each(function() {
    		if ($(this).attr("code") == "payload.name") {
    			result = true;
    		}
    	});
 	
 	return result;
    },
    align: "center bottom",
    showNextStep: false
});

editorPage.addStep({
    title: "Neat, now click on the text",
    showAt: '[am-text-size="normal"]',
    continueWhen: 'click [am-text-size="normal"]',
    align: "center top",
    showNextStep: false
});

editorPage.addStep({
    title: "Enter a suitable text",
    content: "E.g. 'Thank you for signing up...'.",
    showAt: "iframe",
    continueWhen: false,
    align: "center bottom",
    showNextStep: true,
    continueHtml: '<button class="btn btn-alpha-blue btn-small"><i class="icon-circle-arrow-right"></i> Continue</button>'
});

editorPage.addStep({
    title: "Click on the 'Styles' tab to continue",
    showAt: ".nav-tabs > li:last-child",
    continueWhen: "click .nav-tabs > li:last-child > a",
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Change the background color",
    content: "Click and select another color, e.g. dark blue.",
    showAt: '[colorpicker="edit.amBg"]',
    continueWhen: function() {
    	var color = $('[colorpicker="edit.amBg"] .color-picker-palette').css("background-color");
        return (color != "#f8f8f8" && color != "rgb(248, 248, 248)");
    },
    align: "center top",
    showNextStep: false
});

editorPage.addStep({
    title: "Let's create a text version!",
    content: "(This is good for deliverability)",
    showAt: ".btn-group.btn-switch button:last-child",
    continueWhen: "click .btn-group.btn-switch button:last-child",
    align: "left middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Click on 'Auto Generate' if you are lazy!",
    showAt: '[ng-click="generateTextVersion()"]',
    continueWhen: function() {
    	return $("#text-source").val().length > 5;
    },
    align: "left middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Great! Switch back to the HTML version",
    showAt: ".btn-group.btn-switch button:first-child",
    continueWhen: "click .btn-group.btn-switch button:first-child",
    align: "left middle",
    showNextStep: false
});

editorPage.addStep({
    title: "You've just created your first email template",
    content: "Awesome! Now save your work.",
    showAt: ".form-actions button:first-child",
    continueWhen: "click .form-actions button:first-child",
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    type: "overlay",
    overlay: {
    	style: {
    	    opacity: 0.9
    	}
    },
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>Your template has been saved!</h1>"+
            "<p>But to be able to send it, you first need to <strong>publish it</strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Ok, show me how...</button>"+
        "</div>"
});

editorPage.addStep({
    title: "Click on 'Publish'",
    content: "Click on the button to publish your template.",
    showAt: ".form-actions button:nth-child(2)",
    continueWhen: "click .form-actions button:nth-child(2)",
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Click 'Publish' again",
    showAt: ".modal-footer button:last-child",
    continueWhen: "click .modal-footer button:last-child",
    align: "right middle",
    showNextStep: false
});

editorPage.addStep({
    title: "Let's leave the editor!",
    content: "Click on the button to go back to the project.",
    showAt: ".form-actions button:nth-child(3)",
    continueWhen: "click .form-actions button:nth-child(3)",
    align: "center top",
    showNextStep: false
});

var sendPage = guide.addPage("ProjectDetailsCtrl");

sendPage.addStep({
    type: "overlay",
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>Your template is ready!</h1>"+
            "<p>It's time to <strong>send a test message</strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Go on!</button>"+
        "</div>"
});

sendPage.addStep({
    title: "Click on the envelope...",
    content: "...to send a test message.",
    showAt: 'a[ng-click="composeEmail()"]',
    continueWhen: 'click a[ng-click="composeEmail()"]',
    align: "right middle",
    showNextStep: false
});

sendPage.addStep({
    title: "Click on 'Send' to send it to yourself",
    showAt: ".modal-footer button.compose-send",
    continueWhen: "click .modal-footer button.compose-send",
    align: "right middle",
    showNextStep: false
});

sendPage.addStep({
    type: "overlay",
    showNextStep: false,
    content:
        "<div class='gl-overlay'>"+
            "<h1>Congratulations!</h1>"+
            "<p>You've just created and sent your first email with AlphaMail! Questions on integration?</p>"+
            "<p>Check out our <strong><a href='#/docs/' target='_blank'>developer documentation</a></strong> or send us an email at <strong><a href='mailto:support@amail.io'>support@amail.io</a></strong>.</p>"+
            "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-thumbs-up'></i> Thanks!</button>"+
        "</div>"
});

guide.register();