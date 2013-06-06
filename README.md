Guideline.js
============

A non-invasive JavaScript library for creating on-site guides/tours.

## TLDR;

### Create a guide

    var welcomeGuide = new Guideline.Guide("welcome");
    
    var homePage = welcomeGuide.addPage("ProjectListCtrl");
    
    homePage.addStep({
        type: "overlay",
        overlay: {
            style: {
                opacity: 0.9
            }
        },
        showContinue: false,
        content: "<div class='gl-overlay'>" + "<h1>Welcome to AlphaMail!</h1>" + "<p>Let's get familiar with the dashboard by creating <strong>a new project</strong>, <strong>build a template</strong> for it, and then <strong>send a test message</strong>.</p>" + "<button class='btn btn-large btn-primary btn-alpha-blue hide-button'><i class='icon-circle-arrow-right'></i> Get started</button>" + "<br/>" + "<a href='#' class='gl-skip'>or skip this</a>" + "</div>"
    });
    
    homePage.addStep({
        title: "First, create a new project...",
        showAt: "#create-new-project",
        align: "right middle",
        continueWhen: "click #create-new-project",
        showContinue: false
    });

    welcomeGuide.register();
    
### Trigger a page

Tell Guideline.js which page you're on.

    Guideline.setCurrentPage("home");
    
### Start the guide

    Guideline.getGuide("welcome").start();

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

#### Events

  ```e.g. welcomeGuide.on('complete', function(sender){ /*...*/ });```

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
> Adds a new page to the guide.

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
  
#### Methods

* Step addStep(options)
> Adds a new step to the page.

* Step[] getSteps()
> Retrieves all steps added to this page.

### Step

>A step is a logical representation of actions on a page.

  ```var step = new Guideline.Step(options);```
  
#### Events

  ```e.g. someStep.on('show', function(sender){ /*...*/ });```

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
> If connected to a page, change to the next step on that page. Caveats: only works if the step is shown and if it hasn't been changed yed.
