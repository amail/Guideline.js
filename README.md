Guideline.js
============

JavaScript library for creating non-invasive guides/tours.

### "Non-invasive"?

This means that you can create guides that integrate perfectly but doesn't invade your codebase.
Even though you have synchronization and events occuring at random, this library can take care of that.
Guideline treats all steps as synchronous steps. Even though their nature might be asynchronous.
How? It uses a polling technique. I.e. it polls callback functions or if a CSS selector is specified, it polls the selector until a match is available.

[>> **Show it in action!** <<](http://amail.io/assets/libraries/Guideline.js/examples/github/) ([see the code for it here](https://github.com/comfirm/Guideline.js/tree/master/examples/github))

## Example

### Create a guide

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
        title: "Guideline was actually created for AlphaMail!",
        content: "If you head to <a href='http://app.amail.io/'>AlphaMail</a> and signup, you'll actually get the welcome guide the first time you login!",
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
    
### Trigger a page

Tell Guideline.js which page you're on.

    Guideline.setCurrentPage("repository");
    
### Start the guide

    Guideline.getGuide("github").start();

## Real world example

### AlphaMail (http://app.amail.io/)

Have a look at AlphaMail's welcome guide. It's the same one that runs when you sign in for the first time!

http://app.amail.io/js/guideline/guides.js

## Documentation

### Guideline

>The namespace in which everything "Guideline" is present. This is an object and not a prototype so it cannot be instantiated.

#### Methods

* void setCurrentPage(pageName)
> Sets the name of the current page. Should be called on each page change.

* Guide getGuide(guideName)
> Retrieve a guide by name. Requires that it has been registered.

* void registerGuide(guide)
> Registers a guide to retrieve page changes. Automatically done on guide intiailization.

### Guide

>A guide is a logical representation of pages and steps.

  ```var guide = new Guideline.Guide(name[, options]);```
  
#### Constructor

Guideline.Guide(name[, options]);

> The parameter 'name' is used when determining what page a guide is residing on. I.e. it's important that this value is kept unqiue.
> The parameter 'options' can be used to specify futher settings for this guide.

<sub><i>Where options is:</i></sub>

    {
        startOnUrl: '/home', // The URL on which the first page resists. Default: null
        skipAsDefault: true   // Whether or not the guide should initialize as 'skipped'. Meaning you must actively call the guide.start() method to start it. Default: true,
        memoizeLasStep: false   // Default: false
    }

#### Events

  E.g. ```guide.on('complete', function(sender){ /*handle event*/ });```

* start(Guide sender)
> Occurrs when the guide starts.

* skip(Guide sender)
> Occurrs when the user skips the guide.

* restart(Guide sender)
> Occurrs when the guide is restarted.

* complete(Guide sender)
> Occurrs when the guide ends (without being skipped).

#### Methods

* Guide on(eventName, handler)
> Subscribe to a specific event.

* Page addPage(name[, options])
> Adds a new page to the guide. Refer to the Guideline.Page contructor for available options.

* void start()
> Start the guide. Notice! If the option 'startOnUrl' is present and the guide is not on the same page as the first page in the guide, the guide is redirected to the URL specified by 'startOnUrl'.

* void restart()
> Restart the story.

* void skip()
> Skip the guide.

* void register()
> Registers the guide so that it is globally accessible and so that it can receive page change events. Notice! This should always be the last call when you finish your guide.

### Page

>A page is logical representation of steps.

  ```var page = new Guideline.Page(options);```
  
> The parameter 'options' is used to specify how a page will be setup.

<sub><i>Where options is:</i></sub>

    {
        name: 'home',      // The name of this page. This value is mandatory!
        guide: someGuide   // A reference to the owning guide. This is automatically provided when calling 'guide.addPage(...)' (which is the recommended way to add a new page).
    }
  
#### Methods

* Step addStep(options)
> Adds a new step to the page. Refer to the Guideline.Step contructor for available options.

* Step[] getSteps()
> Retrieves all steps added to this page.

### Step

>A step is a logical representation of actions on a page.

  ```var step = new Guideline.Step(options);```
  
> The parameter 'options' is used to specify how a step will be setup.

<sub><i>Where options is:</i></sub>

    {
        type: 'bubble',                // The type of step. Can either be 'bubble' or 'overlay'. Default is 'bubble'.
        title: 'My amazing step!',     // Adds a headline (h1-tag) to the content. Not shown if value is 'null'. Default: null
        content: 'This is just...',    // Adds content (text/html) to the step! Not shown if value is 'null'. Default null
        showSkip: true,                // Whether or not to show a 'Skip this step' button. Default: true
        showContinue: false,           // Whether or not to show a 'Continue' button on the step. Default: false
        showPrevious: false,           // Whether or not to show a 'Previous' button on the step. Default: false
        showAt: '#button',             // Selector for element to 'bubble' or 'overlay'. E.g. 'ul#menu li:first-child'. Can also be a callback function. If a function is provided, it will be polled until the function returns an element. Default: 'document'
        align: 'left middle',          // Determines how the bubble/overlay is aligned. Format '[x] [y]'. X = [left, center, right], Y = [top, middle, bottom]. E.g. 'center middle' or 'right bottom'. Default: 'right bottom'.
        continueWhen: 'click #button', // Condition, when met, automatically continues to the next step on the page. Can be either a string in the format of '[event name] [css selector]', e.g. 'dblclick div#bottom li:last-child'. Can also be a callback function. If a function is provided, it will be polled until the function returns true. When the function returns true, the step continues. Default: 'click [showAt]' (but only if showAt is a string)
        continueAfter: 0,              // Number of seconds until the step will continue. A small progress bar will visualize the elapsed/remaining time. If <= 0 then not shown/used. Default: 0
        guide: someGuide               // A reference to the owning guide. This is automatically provided when calling 'page.addStep(...)' (which is the recommended way to add a new step).
    }
  
#### Events

  E.g. ```step.on('show', function(sender){ /*handle event*/ });```

* show(Step sender)
> Occurrs when the step is shown.

* hide(Step sender)
> Occurrs when the step is hidden.

#### Methods

* Step on(eventName, handler)
> Subscribe to a specific event.

* void show()
> Show the step.

* void hide()
> Hide the step.

* void changeToNextStep()
> If connected to a page, change to the next step on that page. Caveats: only works if the step is shown and if it hasn't been changed yet.

## Dependencies

### Libraries

* [jQuery](http://jquery.com/) - Used throughout the library. Recommended jQuery version >=1.9.1.
* [LightShow.js](https://github.com/comfirm/LightShow.js) - Used whenever there is an overlay present.
* [jquery.scrollTo](https://github.com/flesler/jquery.scrollTo) - Used when scrolling to a certain window position.
* [jQuery Cookie](https://github.com/carhartl/jquery-cookie)
