/* =========================
   1. PROJECT STATE
   ========================= */

/*
  This object stores the user's choices.

  Each value begins as null, which means
  that the user has not answered that question yet.

  The project does not collect names, addresses,
  medical histories, or other personal information.
*/
const answers = {
  walking: null,
  appearance: null,
  change: null
};

/*
  These labels turn the short JavaScript values
  into readable sentences for the result screen.
*/
const answerLabels = {
  walking: {
    easy: "You took a few steps about as you usually do.",
    hard: "You took a few steps, but with a new limp or support.",
    none: "You could not take a few steps.",
    unknown: "You have not tried, or cannot assess this safely."
  },

  appearance: {
    little: "You notice little or no visible change.",
    some: "You notice some swelling or bruising.",
    major: "The ankle looks very different or is changing quickly."
  },

  change: {
    same: "It feels about the same or less uncomfortable.",
    worse: "It feels more uncomfortable than before.",
    unsure: "You are not sure how it has changed."
  }
};

/* =========================
   2. FIND HTML ELEMENTS
   ========================= */

/*
  querySelector finds one matching HTML element.
  querySelectorAll finds every matching element.
*/
const screens = document.querySelectorAll(".screen");
const choiceButtons = document.querySelectorAll(".choice-button");
const backButtons = document.querySelectorAll(".back-button");
const continueButtons = document.querySelectorAll(".continue-button");

const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");

const progressBar = document.querySelector("#progress-bar");
const progressTrack = document.querySelector("#progress-track");
const screenStatus = document.querySelector("#screen-status");

const answerSummary = document.querySelector("#answer-summary");
const adultMessage = document.querySelector("#adult-message");
const nextStepMessage = document.querySelector("#next-step-message");
const nextStepCard = document.querySelector("#next-step-card");

/*
  JavaScript counts the screens from 0 to 4.
  Screen 0 is the start screen.
*/
let currentScreen = 0;

/* =========================
   3. SCREEN-CHANGING LOGIC
   ========================= */

function showScreen(screenNumber) {
  /*
    First, hide every screen.
  */
  screens.forEach(function (screen) {
    screen.hidden = true;
  });

  /*
    Find the screen whose data-screen value
    matches the requested number.
  */
  const newScreen = document.querySelector(
    `[data-screen="${screenNumber}"]`
  );

  /*
    Show the requested screen.
  */
  newScreen.hidden = false;
  currentScreen = screenNumber;

  /*
    JavaScript begins counting at 0,
    but users expect the first screen to be Screen 1.
  */
  const visibleScreenNumber = screenNumber + 1;
  const totalScreens = screens.length;

  /*
    Example for Screen 3 of 5:
    3 divided by 5, multiplied by 100, equals 60%.
  */
  const progressPercent =
    (visibleScreenNumber / totalScreens) * 100;

  /*
    Update the written progress and the bar width.
  */
  screenStatus.textContent =
    `Step ${visibleScreenNumber} of ${totalScreens}`;

  progressBar.style.width = `${progressPercent}%`;

  /*
    Update the accessible progress value
    for screen readers.
  */
  progressTrack.setAttribute(
    "aria-valuenow",
    visibleScreenNumber
  );

  /*
    Move focus to the new screen's heading.
    This helps keyboard and screen-reader users
    notice that the screen changed.
  */
  const heading = newScreen.querySelector("h1, h2");

  if (heading) {
    heading.focus();
  }
}

/* =========================
   4. SAVE A USER'S ANSWER
   ========================= */

function saveAnswer(question, value) {
  /*
    Example:
    If question is "walking" and value is "hard",
    this becomes answers.walking = "hard".
  */
  answers[question] = value;

  /*
    Find all buttons belonging to this question.
  */
  const buttonsForQuestion = document.querySelectorAll(
    `[data-question="${question}"]`
  );

  /*
    Mark the selected button as pressed.
    Mark the other choices as not pressed.
  */
  buttonsForQuestion.forEach(function (button) {
    const isSelected = button.dataset.value === value;

    button.setAttribute("aria-checked", isSelected);
    button.tabIndex = isSelected ? 0 : -1;
  });

  const currentSection = document.querySelector(
    `[data-screen="${currentScreen}"]`
  );
  const continueButton = currentSection.querySelector(".continue-button");

  if (continueButton) {
    continueButton.disabled = false;
  }

}

/* =========================
   5. CREATE THE RESULT SCREEN
   ========================= */

function createResult() {
  /*
    Remove an old answer summary before creating a new one.
  */
  answerSummary.innerHTML = "";

  /*
    Object.keys creates this list:
    ["walking", "appearance", "change"]

    The loop uses each question to find the stored answer.
  */
  Object.keys(answers).forEach(function (question) {
    const selectedValue = answers[question];

    /*
      Create a new HTML list item.
    */
    const listItem = document.createElement("li");

    /*
      Use the readable sentence that matches
      the question and selected value.
    */
    listItem.textContent =
      answerLabels[question][selectedValue];

    /*
      Add the sentence to the result-screen list.
    */
    answerSummary.appendChild(listItem);
  });

  /*
    SMARTER RESULT LOGIC

    These rules do not diagnose an injury.
    They only change the wording used to encourage
    communication with a trusted adult.

    JavaScript checks the rules from top to bottom.
  */

  /*
    PATH 1:
    The user cannot put weight on the ankle
    OR notices a major visible change.
  */
  if (
    answers.walking === "none" ||
    answers.appearance === "major"
  ) {
    nextStepCard.dataset.level = "now";
    adultMessage.textContent =
      "You could say: “I hurt my ankle, and I am having a lot of difficulty using it or noticing a major change. Can you help me decide what to do next?”";

    nextStepMessage.textContent =
      "Ask a trusted adult for help now. Show them your answers so they can help decide the next responsible step.";
  }

  /*
    PATH 2:
    The user reports difficulty walking,
    some visible change, worsening discomfort,
    or uncertainty.
  */
  else if (
    answers.walking === "hard" ||
    answers.walking === "unknown" ||
    answers.appearance === "some" ||
    answers.change === "worse" ||
    answers.change === "unsure"
  ) {
    nextStepCard.dataset.level = "soon";
    adultMessage.textContent =
      "You could say: “I hurt my ankle, and this is what I am noticing. Can we look at it together and decide what support I need?”";

    nextStepMessage.textContent =
      "Tell a trusted adult soon and explain what you selected. Let them know if anything changes or becomes harder.";
  }

  /*
    PATH 3:
    None of the earlier conditions matched.

    The message still avoids saying that
    the user is fine.
  */
  else {
    nextStepCard.dataset.level = "share";
    adultMessage.textContent =
      "You could say: “I hurt my ankle. These are the things I noticed when I checked it. Can I keep you updated and ask for help if anything changes?”";

    nextStepMessage.textContent =
      "Tell a trusted adult what happened and share what you noticed. The checklist does not confirm that the ankle is fine.";
  }
}

/* =========================
   6. START BUTTON
   ========================= */

startButton.addEventListener("click", function () {
  showScreen(1);
});

/* =========================
   7. CHOICE BUTTONS
   ========================= */

choiceButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    /*
      Read the data attributes from the clicked button.
    */
    const question = button.dataset.question;
    const value = button.dataset.value;

    /*
      Store the selected answer.
    */
    saveAnswer(question, value);

  });
});

document.querySelectorAll('[role="radiogroup"]').forEach(function (group) {
  group.addEventListener("keydown", function (event) {
    const radioButtons = Array.from(
      group.querySelectorAll('[role="radio"]')
    );
    const currentIndex = radioButtons.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % radioButtons.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + radioButtons.length) % radioButtons.length;
    } else {
      return;
    }

    event.preventDefault();
    radioButtons[nextIndex].click();
    radioButtons[nextIndex].focus();
  });
});

continueButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const nextScreen = Number(button.dataset.continueScreen);

    if (nextScreen === 4) {
      createResult();
    }

    showScreen(nextScreen);
  });
});

/* =========================
   8. BACK BUTTONS
   ========================= */

backButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const previousScreen = Number(
      button.dataset.backScreen
    );

    showScreen(previousScreen);
  });
});

/* =========================
   9. RESTART BUTTON
   ========================= */

restartButton.addEventListener("click", function () {
  /*
    Clear the stored answers.
  */
  answers.walking = null;
  answers.appearance = null;
  answers.change = null;

  /*
    Remove the selected state from every choice button.
  */
  choiceButtons.forEach(function (button) {
    button.setAttribute("aria-checked", "false");
  });

  document.querySelectorAll('[role="radiogroup"]').forEach(function (group) {
    group.querySelectorAll('[role="radio"]').forEach(function (button, index) {
      button.tabIndex = index === 0 ? 0 : -1;
    });
  });

  continueButtons.forEach(function (button) {
    button.disabled = true;
  });


  /*
    Clear the old result content.
  */
  answerSummary.innerHTML = "";
  adultMessage.textContent = "";
  nextStepMessage.textContent = "";

  /*
    Return to the start screen.
  */
  showScreen(0);
});

/* =========================
   10. INITIAL PAGE SETUP
   ========================= */

/*
  Make sure the first screen is displayed
  when the page first loads.
*/
showScreen(0);
