// Example Guide

var githubGuide = new Guideline.Guide("github");

var repositoryPage = githubGuide.addPage("repository");

repositoryPage.addStep({
    type: "overlay",
    title: "This is Guideline.js running on GitHub!",
    content: (
        "<p>Works without changing <u>anything</u> in the GitHub code</p>"+
        "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Amazing... Show me more!</button>"+
        "<br/>"+
        "<a href='#' class='gl-skip'>I don't care. Skip this.</a>"
    ),
    overlayOptions: {
        style: {
            opacity: 0.9
        }
    }
});

repositoryPage.addStep({
    title: "This is the repository name. Remember it!",
    showAt: ".js-current-repository",
    align: "right middle",
    continueAfter: 5 // seconds
});

repositoryPage.addStep({
    title: "Click on 'SSH' to show the GIT address.",
    content: "You need to click on the button to continue.",
    showAt: ".public_clone_url",
    align: "center top"
});

repositoryPage.addStep({
    title: "This is the GIT address! Clone it and contribute!",
    content: "Just 'git clone git@github.com:comfirm/Guideline.js.git'",
    showAt: "input.js-url-field",
    align: "center top",
    continueAfter: 7 // seconds
});

repositoryPage.addStep({
    title: "This is our total number of commits.",
    showAt: ".frame-meta .history-link",
    align: "right middle",
    continueAfter: 4 // seconds
});

repositoryPage.addStep({
    title: "If you're in a rush...",
    content: "TLDR; \"Too long, didn't read\". This is the fastest way to get a grip on Guideline.js without reading the documentation.",
    showAt: function(){
    	var heading = $("h2 a[name='tldr']");
    	return heading.length == 1 ? heading.parent() : false;
    },
    align: "center top",
    continueAfter: 12 // seconds
});

repositoryPage.addStep({
    title: "Guideline was actually created for AlphaMail!",
    content: "If you head to <a href='http://app.amail.io/'>AlphaMail</a> and signup, you'll actually get the welcome guide the first time you login!",
    showAt: function(){
    	var heading = $("h2 a[name='real-world-example']");
    	return heading.length == 1 ? heading.parent() : false;
    },
    align: "center top",
    continueAfter: 12 // seconds
});

githubGuide.register();