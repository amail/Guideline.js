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
    title: "This is the exact code that is running right now!",
    showAt: function(){
        var heading = $("h3 a[name='create-a-guide']");
        return heading.length == 1 ? heading.parent() : false;
    },
    align: "center top",
    continueAfter: 8 // seconds
});

repositoryPage.addStep({
    title: "Guideline was actually created for AlphaMail",
    content: "If you head to <a href='http://app.amail.io/'>AlphaMail</a> and signup, you'll actually get the a welcome guide the first time you login.",
    showAt: function(){
        var heading = $("h2 a[name='real-world-example']");
        return heading.length == 1 ? heading.parent() : false;
    },
    align: "center top",
    continueAfter: 8 // seconds
});

repositoryPage.addStep({
    title: "You need to call setCurrentPage on every page change",
    content: "With this Guideline can track which page you're on and know what to show and when to show it.",
    showAt: function(){
        var heading = $("h4 a[name='methods']");
        return heading.length == 1 ? heading.parent().next().find("li:first-child") : false;
    },
    align: "center top",
    continueAfter: 9 // seconds
});

repositoryPage.addStep({
    title: "Guideline.getGuide(name)-method allows you to retrieve a guide from anywhere",
    content: "You can retrieve the guide using it's name. The guide is accessible this way once the guide.register()-method has been called.",
    showAt: function(){
        var heading = $("h4 a[name='methods']");
        return heading.length == 1 ? heading.parent().next().find("li:nth-child(2)") : false;
    },
    align: "center top",
    continueAfter: 9 // seconds
});

repositoryPage.addStep({
    title: "Start the guide manually",
    content: "If you're on another page, and you want to start the guide manually, you can use this method.<br />Remember to specify the 'startOnUrl'-parameter for auto redirection.",
    showAt: function(){
        var heading = $("h4 a[name='methods-1']");
        return heading.length == 1 ? heading.parent().next().find("li:nth-child(3)") : false;
    },
    align: "center top",
    continueAfter: 9 // seconds
});

repositoryPage.addStep({
    type: "overlay",
    title: "And that's it! Did you like it?",
    content: (
        '<p><a style="vertical-align:bottom;" href="https://twitter.com/intent/tweet?button_hashtag=guidelinejs&text=JavaScript%20library%20for%20creating%20non-invasive%20guides/tours." class="twitter-hashtag-button" data-lang="en" data-related="jasoncosta">Tweet #guidelinejs</a> or contribute!</p>' +
        '<p><button class="btn btn-large btn-primary btn-alpha-blue hide-button"><i class="icon-circle-arrow-right"></i> Amazing. Thanks!</button></p>' +
        '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
    ),
    overlayOptions: {
        style: {
            opacity: 0.9
        }
    }
});

githubGuide.register();