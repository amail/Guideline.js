Guideline.js
============

Guideline.js is a simple JavaScript library for creating on-site guides/tours!

## TLDR;

### Create a guide

    var guide = new Guideline.Guide("welcome");

    var homePage = guide.addPage("home");
    
    homePage.addStep({
      title: "Click on the 'create' button to create a new project",
    	content: "hehe this is very veri nice of you",
    	showAt: "#create-project",
    	align: "right middle",
    	continueWhen: "click #create-project",
    	continueAfter: 5,
    	showNextStep: false
    });
    
    homePage.addStep({
    	title: "Other stuff",
    	showAt: "#other-stuff",
    	align: "center bottom",
    	continueWhen: "click #other-stuff",
    	continueAfter: 5
    });

    guide.begin();
    
### Trigger a page

Start the guide by triggering it's first page.

    Guideline.setCurrentPage("home");

## Documentation

### Guide

>A guide is a logical representation of pages and steps.

  ```var guide = new Guideline.Guide(name);```

### Page

>A page is logical representation of steps.

  ```var page = new Guideline.Page(options);```

### Step

>A step is a logical representation of actions on a page.

  ```var step = new Guideline.Step(options);```
