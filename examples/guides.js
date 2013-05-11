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

homePage.addStep({
	title: "Other stuff",
	showAt: "#other-stuff-2",
	align: "center top",
	continueWhen: "click #other-stuff-2",
	continueAfter: 5
});

homePage.addStep({
	title: "Continue to page 2",
	showAt: "#continue-to-page-2",
	align: "center top",
	continueWhen: "click #continue-to-page-2",
	showNextStep: false
});

var otherPage = guide.addPage("other");

otherPage.addStep({
	title: "Other stuff",
	showAt: "#other-stuff-2",
	align: "center top",
	continueWhen: "click #other-stuff-2",
	continueAfter: 5
});

otherPage.addStep({
	title: "Other stuff",
	showAt: "#other-stuff-2",
	align: "center top",
	continueWhen: "click #other-stuff-2",
	continueAfter: 5
});

guide.begin();