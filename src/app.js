const startButton = document.querySelector(".btn-start");
const rightButton = document.querySelector(".d-pad__btn--right");
const leftButton = document.querySelector(".d-pad__btn--left");
const downButton = document.querySelector(".d-pad__btn--down");
const upButton = document.querySelector(".d-pad__btn--up");
const selectButton = document.querySelector(".btn-select");
const guideButton = document.querySelector(".btn-guide");
let iframe = document.getElementById("iframe");
let iframeDocument;
let selectionList;
let selectionListItems;
let menuList;
let numItems;
let menuItems;
let totalItems;
let totalPokemon;
let numClicks = 0;
let m_numClicks = 0;
let b_numClicks = 0;
let yP_numClicks = 0;
let optionsList;
let optionsListItems;
let dialogue;
let player;
let opponent;
let oppHealthValue;
let playerHealthValue;
let oppHealthFill;
let playerHealthFill;
let playerPokemon;
let oppPokemon;
let oppTotalHealth;
let playerTotalHealth;
let oppAttack;
let playerAttack;
let oppDefense;
let playerDefense;
let playagainList;
let bagItems;
let yourPkmn;

var state = {
  pokemonList: {},
  curSelectPokemon: {},
  opponentPokemon: {},
  selectedAnswer: "yes",
  screen: "",
  optionSelected: "attack",
  attackSelected: "",
  bag: {
    Potion: 5,
    "Super Potion": 5,
    Pokeball: 10,
  },
  curPkmIndex: 0,
  yourPkmn: [],
  itemsAllowed: 5,
  captured: false,
  switchPkmn: 10,
  wins: 0,
  typeChart: {},
  attackTypes: {},
  uiSkin: "",
  introSelection: "play",
  menuSelection: "",
};

const sound = {
  click: new Audio("./src/sounds/splits.mp3"),
  click2: new Audio(
    "./src/sounds/608432__plasterbrain__pokemon-ui-select-enter.flac"
  ),
  intro: new Audio("./src/sounds/514155__edwardszakal__game-music.mp3"),
  attack: new Audio(
    "./src/sounds/213149__complex-waveform__8bit-style-bonus-effect.wav"
  ),
  heal: new Audio("./src/sounds/562292__colorscrimsontears__heal-rpg.wav"),
  smash: new Audio("./src/sounds/323417__sethroph__glass-slide-7.wav"),
  catch: new Audio("./src/sounds/464904__plasterbrain__8bit-beam.flac"),
  fail: new Audio("./src/sounds/159408__noirenex__life-lost-game-over.wav"),
  error: new Audio("./src/sounds/648425__krokulator__error1.wav"),
  winGame: new Audio("./src/sounds/win-video-game-sound.wav"),
  lostGame: new Audio("./src/sounds/538151__fupicat__8bit-fall.wav"),
  gameOver: new Audio("./src/sounds/617466__cwright13__pokemoncenter.mp3"),
  battle: new Audio("./src/sounds/338817__sirkoto51__rpg-battle-loop-1.wav"),
  switch: new Audio(
    "./src/sounds/274180__littlerobotsoundfactory__jingle-win-synth-00.wav"
  ),
};

//Timer to slow effect
const delay = (time) => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve();
    }, time);
  });
};

/*Displays*/
//Function to load different Screens
const displayScreen = (screenUpdate, screenFunc) => {
  state.screen = screenUpdate;
  document.getElementsByName("screen-display")[0].src = state.screen + ".html";
  delay(2000)
    .then(() => {
      screenFunc();
      numClicks = 0;
    })
    .catch((err) => console.log(err));
};

const introScreen = () => {
  console.log("Intro screen started...");
  iframeDocument = iframe.contentWindow.document;
  pressStartList = iframeDocument.querySelector(".press-start").children;
  numItems = pressStartList.length - 1;
};

//Loads iframe of player Selection Screen
const selectionScreen = () => {
  iframeDocument = iframe.contentWindow.document;
  //Get Selection List of cards (children)
  selectionList = iframeDocument.querySelector(".selection__list");
  selectionListItems = selectionList.children;
  numItems = selectionListItems.length - 1;
  //Update state with Pokemon list
  const pokemonList = iframe.contentWindow.selectionState.pokemonList;
  state.pokemonList = pokemonList;
  //Set default pokemon //Need Update to yourPokemon with 3 Pokemon
  state.curSelectPokemon = pokemonList[0];
  sound.intro.play();
  sound.intro.volume = 0.1;
  sound.intro.loop = true;
};

//In Selected Mode, if user chooses no to the selected pokemon, revert infobox, allow user to select another pokemon
const backToSelection = () => {
  state.screen = "selection-screen";
  state.selectedAnswer = "yes";
  iframeDocument = iframe.contentWindow.document;
  iframeDocument
    .querySelector(".infobox__text-choose")
    .classList.remove("hide");
  iframeDocument.querySelector(".infobox__text-selected").classList.add("hide");
  iframeDocument.querySelector(".option__yes-arrow").classList.remove("hide");
  iframeDocument.querySelector(".option__no-arrow").classList.add("hide");
};

//Selected Pokemon
const selectedPokemon = () => {
  state.screen = "selected-mode";
  state.selectedAnswer = "yes";
  iframeDocument = iframe.contentWindow.document;
  //Switch text to: Select this Pokemon?
  iframeDocument.querySelector(".infobox__text-choose").classList.add("hide");
  iframeDocument
    .querySelector(".infobox__text-selected")
    .classList.remove("hide");
};

//Loads iframe of Opponent Selection Screen
async function oppSelectionScreen() {
  //Restore your pokemon health;
  const yourTeam = state.yourPkmn;
  yourTeam.forEach((el) => {
    el.health_active = el.health_total;
    sound.click.play();
    sound.gameOver.pause();
    sound.gameOver.currentTime = 0;
  });

  //Wait for content to load
  const nextScreen = await iframe.contentWindow.oppScreenLoad();
  //Get Opponent Pokemon and store in state
  const oppState = iframe.contentWindow.oppState;
  state.opponentPokemon = oppState.opponentPokemon;
  //Loads next screen
  displayScreen(nextScreen, battleScreen);
}

//Loads iframe of Battle Screen
async function battleScreen() {
  state.optionSelected = "attack";
  iframeDocument = iframe.contentWindow.document;
  dialogue = iframeDocument.querySelector(".infobox__text");
  optionsList = iframeDocument.querySelector(".infobox__container--red");
  //Get list of all options in infobox box red
  optionsListItems = optionsList.children;
  numItems = optionsListItems.length - 1;
  loadPokemon();
  sound.intro.pause();
  sound.intro.currentTime = 0;
  sound.battle.play();
  sound.battle.volume = 0.1;
  sound.battle.loop = true;
  const response = await fetch("./src/typechart.json").catch((err) =>
    console.log(err)
  );
  const data = await response.json().catch((err) => console.log(err));
  state.typeChart = data[0];

  const response2 = await fetch("./src/attackTypes.json").catch((err) =>
    console.log(err)
  );
  const data2 = await response2.json().catch((err) => console.log(err));
  state.attackTypes = data2[0];
}

const gameoverScreen = () => {
  iframeDocument = iframe.contentWindow.document;
  if (state.wins >= 3) {
    iframeDocument.querySelector(".lost").classList.add("lost--hide");
    iframeDocument.querySelector(".win").classList.add("win--show");
  }
  playagainList = iframeDocument.querySelector(".playagain").children;
  numItems = playagainList.length - 1;
  sound.battle.pause();
  sound.battle.currentTime = 0;
  sound.gameOver.play();
  sound.gameOver.volume = 0.1;
  sound.gameOver.loop = true;
};

/*Pokemon Class*/
const loadPokemon = () => {
  //Pokemon Class Instance
  player = "player";
  opponent = "opponent";
  oppAttack = state.opponentPokemon.attack;
  playerAttack = state.yourPkmn[state.curPkmIndex].attack;
  oppDefense = state.opponentPokemon.defense;
  playerDefense = state.yourPkmn[state.curPkmIndex].defense;
  oppState = state.opponentPokemon;
  playerState = state.yourPkmn[state.curPkmIndex];
  oppTotalHealth = state.opponentPokemon.health_total;
  playerTotalHealth = state.yourPkmn[state.curPkmIndex].health_total;
  oppHealthFill = iframeDocument.querySelector(".opponent-health__bar--fill");
  playerHealthFill = iframeDocument.querySelector(".player-health__bar--fill");
  oppType = state.opponentPokemon.type;
  playerType = state.yourPkmn[state.curPkmIndex].type;
  oppPokemon = new Pokemon(
    opponent,
    oppAttack,
    oppDefense,
    oppTotalHealth,
    oppState,
    oppHealthFill,
    playerType
  );
  playerPokemon = new Pokemon(
    player,
    playerAttack,
    playerDefense,
    playerTotalHealth,
    playerState,
    playerHealthFill,
    oppType
  );
};

//*Buttons*//
//------------------------Control Buttons------------------------//
startButton.addEventListener("click", () => {
  sound.click2.play();
  let color = "";
  const removeAllSkin =()=>{
    const gb_active = document.getElementById("gb");
    const im_active = document.getElementById("im");
    gb_active === null ? null : gb_active.remove();
    im_active === null ? null : im_active.remove();
  }
  if (state.introSelection === "play") {
    //Only enable start selection screen page if is not the current page loaded
    if (state.screen === "intro-screen") {
      //set screen in state to equal selection-screen
      displayScreen("selection-screen", selectionScreen);
    }
  } else if (state.introSelection === "menu" && state.menuSelection === "") {
    //Start Menu Panel
    state.screen = "menu-panel";
    const elemDiv = iframeDocument.createElement("div");
    elemDiv.classList.add("menu-panel", "menu-panel--show");
    elemDiv.innerHTML = `<h2>Press Start</h2>
      <div class="menu">
            <p class="menu-item"><span class="arrow arrow--blink arrow--selected">&#9658;</span>Default Color</p>
            <p class="menu-item"><span class="arrow arrow--blink">&#9658;</span>Gameboy Color</p>
            <p class="menu-item"><span class="arrow arrow--blink">&#9658;</span>Iron Man Color</p>
            <p class="menu-item"><span class="arrow arrow--blink">&#9658;</span>Fight Boss</p>
            <p class="menu-item"><span class="arrow arrow--blink">&#9658;</span>Exit</p>
          </div>
      `;
    iframeDocument.body.appendChild(elemDiv);
    menuList = iframeDocument.querySelector(".menu").children;
    menuItems = menuList.length - 1;
  } else if (state.menuSelection === "Gameboy Color") {
    removeAllSkin();
    //Gameboy Color skin
    color = `<link rel="stylesheet" id="gb" type="text/css" href="gameboyskin.css" />`;
    document
      .getElementsByTagName("title")[0]
      .insertAdjacentHTML("beforebegin", color);
  } else if (state.menuSelection === "Iron Man Color") {
    removeAllSkin();
    //iron Man skin
    color = `<link rel="stylesheet" id="im" type="text/css" href="ironmanskin.css" />`;
    document
      .getElementsByTagName("title")[0]
      .insertAdjacentHTML("beforebegin", color);
  } else if (state.menuSelection === "Default Color") {
    //Default PokeDex Color skin
    removeAllSkin();
  } else if (state.menuSelection === "Fight Boss") {
    state.wins = 2;
  } else if (state.menuSelection === "Exit") {
    //Exit panel
    iframeDocument.querySelector(".menu-panel").remove();
    state.menuSelection = "";
    state.screen = "intro-screen";
    m_numClicks = 0;
  } 
  
  if(state.screen === "battle-screen") {
    //Start Menu Panel
    state.screen = "menu-panel";
    const elemDiv = iframeDocument.createElement("div");
    elemDiv.classList.add("menu-panel", "menu-panel--show");
    elemDiv.innerHTML = `<h2>Press Start</h2>
      <div class="menu">
            <p class="menu-item"><span class="arrow arrow--blink arrow--selected">&#9658;</span>Exit</p>
            <p class="menu-item"><span class="arrow arrow--blink">&#9658;</span>Quit Game</p>
          </div>
      `;
    iframeDocument.body.appendChild(elemDiv);
    menuList = iframeDocument.querySelector(".menu").children;
    menuItems = menuList.length - 1;
    state.menuSelection = "Exit";
  } else if (state.menuSelection === "Quit Game") {
    location.reload();
  } else if (state.menuSelection === "Exit") {
    //Exit panel
    iframeDocument.querySelector(".menu-panel").remove();
    state.menuSelection = "";
    state.screen = "battle-screen";
    m_numClicks = 0;
  } 
});

const guideText = () => {
  const general = `<h1>Poke Dex</h1>
  <div>
  <h4>Note: Click Guide button to scroll through.</h4>
  <ol>
  <li>In Selection Screen, select 3 Pokemon to bring into battle. Use direction pad to move about screen.  Use Select button to choose Pokemon and confirm choice.</li>
  <li>You will need fight 3 opponents become Pokemon Master.</li>
  <li>Each Pokemon is weak against certain types of attacks.</li>
  <li>You have 10 chance to switch Pokemon per battle.</li>
  <li>Items are avaible to use for healing.</li>
  <li>Pokeball can be thrown to catch Pokemon and end a battle.  The lower the Pokemon's health the higher chance of capture.</li></div>
  </ol>`;
  const oppPkmn = state.opponentPokemon;
  const oppGuide = `<h1>Poke Dex</h1>
  <div>
  <h4>Note: Click Guide button to scroll through.</h4>
  <img style="border:1px solid gray; border-radius: 5px; padding 20%; background-color:rgb(155, 253, 155); height: 100%;max-height:62px;" src="${oppPkmn.image}"/>
  <p>Pokemon: ${oppPkmn.name}</p>
  <p>Type: ${oppPkmn.type}</p>
  <p>Weakness: ${oppPkmn.weakness}</p>
  <p>Attack: ${oppPkmn.attack}</p>
  <p>Defense: ${oppPkmn.defense}</p>
  <p>Health: ${oppPkmn.health_total}</p>
  <p>Summary: ${oppPkmn.summary}</p></div>`;
  return state.screen === "oppGuide" ? oppGuide : general;
};
const battleGuide = () => {
  if (state.screen === "battle-screen") {
    state.screen = "oppGuide";
    let elemDiv = iframeDocument.createElement("div");
    elemDiv.classList.add("panel", "panel--show");
    elemDiv.innerHTML = guideText();
    iframeDocument.body.appendChild(elemDiv);
  } else if (state.screen === "oppGuide") {
    iframeDocument.querySelector(".panel").remove();
    state.screen = "generalGuide";
    let elemDiv = iframeDocument.createElement("div");
    elemDiv.classList.add("panel", "panel--show");
    elemDiv.innerHTML = guideText();
    iframeDocument.body.appendChild(elemDiv);
  } else {
    state.screen = "battle-screen";
    iframeDocument.querySelector(".panel").remove();
  }
};

const generalGuide = () => {
  const panel_active = iframeDocument.querySelector(".panel");
  if (panel_active) {
    iframeDocument.querySelector(".panel").remove();
  } else {
    var elemDiv = iframeDocument.createElement("div");
    elemDiv.classList.add("panel", "panel--show");
    elemDiv.innerHTML = guideText();
    iframeDocument.body.appendChild(elemDiv);
  }
};

guideButton.addEventListener("click", () => {
  iframeDocument = iframe.contentWindow.document;
  if (state.screen === "intro-screen" || state.screen === "selection-screen") {
    generalGuide();
  }
  if (
    state.screen === "battle-screen" ||
    state.screen === "oppGuide" ||
    state.screen === "generalGuide"
  ) {
    battleGuide();
  }
});

selectButton.addEventListener("click", () => {
  sound.click2.play();
  //Selects Pokemon in Selection Screen
  if (state.screen === "selected-mode" && state.selectedAnswer === "yes") {
    //Pokemon team selection. Player cannot select same Pokemon on team.
    if (state.yourPkmn.find((e) => e.name === state.curSelectPokemon.name)) {
      backToSelection();
      iframeDocument.querySelector(".infobox__text-choose").textContent =
        "You already selected this Pokemon. Select another.";
      sound.error.play();
      sound.error.volume = 0.4;
    } else {
      state.yourPkmn.push(state.curSelectPokemon);
      state.yourPkmn.length === 3
        ? displayScreen("opp-selection-screen", oppSelectionScreen)
        : null;
      let remainingNum = 3 - state.yourPkmn.length;
      iframeDocument.querySelector(
        ".infobox__text-choose"
      ).textContent = `Select ${remainingNum} more Pokemon for battle.`;
      selectionListItems[numClicks].classList.add("selection__card--unavaible");
      backToSelection();
    }
  } //Start Opponent Selection screen
  else if (state.screen === "selected-mode" && state.selectedAnswer === "no") {
    //Cancel pokemon selection
    backToSelection();
  } else if (state.screen === "selection-screen") {
    selectedPokemon();
  } else if (
    state.screen === "gameover-screen" &&
    state.selectedAnswer === "yes"
  ) {
    sound.gameOver.pause();
    sound.gameOver.currentTime = 0;
    resetOptions();
    displayScreen("selection-screen", selectionScreen);
  } else if (
    state.screen === "gameover-screen" &&
    state.selectedAnswer === "no"
  ) {
    sound.gameOver.pause();
    sound.gameOver.currentTime = 0;
    resetOptions();
    displayScreen("intro-screen", introScreen);
  }
  //===attack option selected===//
  else if (
    (state.screen === "battle-screen" && state.optionSelected === "attack") ||
    state.screen === "attack-mode"
  ) {
    attackOption();
  }
  //===bag (items)===//
  else if (
    state.optionSelected === "bag" ||
    state.optionSelected === "bag-opened"
  ) {
    bagOption();
  }
  //===Pkmon option===//
  else if (
    state.optionSelected === "pkmon" ||
    state.optionSelected === "pkmn-switch"
  ) {
    pkmonOption();
  }
  //===run option===//
  else if (state.optionSelected === "run") {
    runOption();
  }
});

rightButton.addEventListener("click", () => {
  sound.click.play();
  //Only works in selection screen, not selected-mode
  const pokemonList = Object.keys(state.pokemonList).length;
  if (state.screen === "selection-screen" && pokemonList !== 0) {
    console.log("I'm running right button")
    numClicks += 1;
    //Set equal to # of selections available, if numClicks exceeds it, before changing direction
    numClicks > numItems
      ? (numClicks = numItems)
      : selectPageController("right");
  }
  //Only works in battle screen
  else if (state.screen === "battle-screen") {
    numClicks += 1;
    //Set equal to # of selections available, if numClicks exceeds it, before changing direction
    numClicks > numItems
      ? (numClicks = numItems)
      : battleOptionsController("right");
  } else if (state.screen === "yourPkmn") {
    yP_numClicks += 1;
    //Set equal to # of selections available, if numClicks exceeds it, before changing direction
    yP_numClicks > totalPokemon
      ? (yP_numClicks = totalPokemon)
      : yourPkmnController("right");
  }
});

//Left button moves selection border one over to the left
leftButton.addEventListener("click", () => {
  sound.click.play();
  const pokemonList = Object.keys(state.pokemonList).length;
  if (state.screen === "selection-screen" && pokemonList !== 0) {
    numClicks -= 1;
    //Set numClicks equal to zero, if numClicks goes below zero, before changing direction
    numClicks < 0 ? (numClicks = 0) : selectPageController("left");
  }
  if (state.screen === "battle-screen") {
    numClicks -= 1;
    //Set numClicks equal to zero, if numClicks goes below zero, before changing direction
    numClicks < 0 ? (numClicks = 0) : battleOptionsController("left");
  } else if (state.screen === "yourPkmn") {
    yP_numClicks -= 1;
    yP_numClicks < 0 ? (yP_numClicks = 0) : yourPkmnController("left");
  }
});

//Down button moves selection border one below
downButton.addEventListener("click", () => {
  sound.click.play();
  const pokemonList = Object.keys(state.pokemonList).length;
  if (state.screen === "selection-screen" && pokemonList !== 0) {
    numClicks += 3;
    //Reverse numClicks by -3, if numClicks exceeds # of selections available, before changing direction
    numClicks > numItems ? (numClicks -= 3) : selectPageController("down");
  } else if (state.screen === "selected-mode") {
    iframeDocument.querySelector(".option__yes-arrow").classList.add("hide");
    iframeDocument.querySelector(".option__no-arrow").classList.remove("hide");
    state.selectedAnswer = "no";
  } else if (state.screen === "battle-screen") {
    numClicks += 2;
    //Reverse numClicks by -2, if numClicks exceeds # of selections available, before changing direction
    numClicks > numItems ? (numClicks -= 2) : battleOptionsController("down");
  } else if (state.screen === "attack-mode") {
    numClicks += 1;
    numClicks > 2 ? (numClicks = 2) : attackController("down");
  } else if (state.optionSelected === "bag-opened") {
    b_numClicks += 1;
    b_numClicks > totalItems
      ? (b_numClicks = totalItems)
      : bagController("down");
  } else if (state.screen === "yourPkmn") {
    yP_numClicks += 3;
    yP_numClicks > totalPokemon
      ? (yP_numClicks -= 3)
      : yourPkmnController("down");
  } else if (state.screen === "gameover-screen") {
    numClicks += 1;
    numClicks > numItems ? (numClicks = numItems) : gameOverController("down");
  } else if (state.screen === "intro-screen") {
    numClicks += 1;
    numClicks > numItems ? (numClicks = numItems) : introController("down");
  } else if (state.screen === "menu-panel") {
    m_numClicks += 1;
    m_numClicks > menuItems
      ? (m_numClicks = menuItems)
      : menuController("down");
  }
});

//Switch to yes with up button
upButton.addEventListener("click", () => {
  sound.click.play();
  const pokemonList = Object.keys(state.pokemonList).length;
  if (state.screen === "selection-screen" && pokemonList !== 0) {
    numClicks -= 3;
    //Reverse numClicks by +3, if numClicks goes below zero, before changing direction
    numClicks < 0 ? (numClicks += 3) : selectPageController("up");
  } else if (state.screen === "selected-mode") {
    iframeDocument.querySelector(".option__yes-arrow").classList.remove("hide");
    iframeDocument.querySelector(".option__no-arrow").classList.add("hide");
    state.selectedAnswer = "yes";
  } else if (state.screen === "battle-screen") {
    numClicks -= 2;
    //Reverse numClicks by +2, if numClicks goes below zero, before changing direction
    numClicks < 0 ? (numClicks += 2) : battleOptionsController("up");
  } else if (state.screen === "attack-mode") {
    numClicks -= 1;
    numClicks < 0 ? (numClicks = 0) : attackController("up");
  } else if (state.optionSelected === "bag-opened") {
    b_numClicks -= 1;
    b_numClicks < 0 ? (b_numClicks = 0) : bagController("up");
  } else if (state.screen === "yourPkmn") {
    yP_numClicks -= 3;
    yP_numClicks < 0 ? (yP_numClicks += 3) : yourPkmnController("up");
  } else if (state.screen === "gameover-screen") {
    numClicks -= 1;
    numClicks < 0 ? (numClicks = 0) : gameOverController("up");
  } else if (state.screen === "intro-screen") {
    numClicks -= 1;
    numClicks < 0 ? (numClicks = 0) : introController("up");
  } else if (state.screen === "menu-panel") {
    m_numClicks -= 1;
    m_numClicks < 0 ? (m_numClicks = 0) : menuController("up");
  }
});

/*Switch*/
//----Enable Direction Pad Controls for Selection Screen----//
const selectPageController = (direction) => {
  switch (direction) {
    case "right":
      //removes selection border from previous selection
      selectionListItems[numClicks - 1].classList.remove(
        "selection__card--selected"
      );
      //adds selection border to current selection
      selectionListItems[numClicks].classList.add("selection__card--selected");
      //Switches infobox details based on pokemon selection
      iframeDocument.querySelector(".info-list2").innerHTML =
        getDataSet(numClicks);
      break;
    case "left":
      selectionListItems[numClicks + 1].classList.remove(
        "selection__card--selected"
      );
      selectionListItems[numClicks].classList.add("selection__card--selected");
      iframeDocument.querySelector(".info-list2").innerHTML =
        getDataSet(numClicks);
      break;
    case "down":
      selectionListItems[numClicks - 3].classList.remove(
        "selection__card--selected"
      );
      selectionListItems[numClicks].classList.add("selection__card--selected");
      iframeDocument.querySelector(".info-list2").innerHTML =
        getDataSet(numClicks);
      break;
    case "up":
      selectionListItems[numClicks + 3].classList.remove(
        "selection__card--selected"
      );
      selectionListItems[numClicks].classList.add("selection__card--selected");
      iframeDocument.querySelector(".info-list2").innerHTML =
        getDataSet(numClicks);
      break;
  }
};

//----Enable Direction Pad Controls for Battle Screen----//

//battle options D-Pad Control
const battleOptionsController = (direction) => {
  switch (direction) {
    case "right":
      //displays & removes arrow
      optionsListItems[numClicks - 1].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");

      //Update state with player choice
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      break;
    case "left":
      optionsListItems[numClicks + 1].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      break;
    case "down":
      optionsListItems[numClicks - 2].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      break;
    case "up":
      optionsListItems[numClicks + 2].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      break;
  }
};

//attack options D-Pad Control
const attackController = (direction) => {
  switch (direction) {
    case "down":
      //displays & removes arrow
      optionsListItems[numClicks - 1].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");
      //Update state with player choice
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      state.attackSelected = `attack_${numClicks + 1}`;
      break;
    case "up":
      optionsListItems[numClicks + 1].children[0].classList.remove(
        "arrow--selected"
      );
      optionsListItems[numClicks].children[0].classList.add("arrow--selected");
      state.optionSelected = optionsListItems[numClicks].lastChild.data;
      state.attackSelected = `attack_${numClicks + 1}`;
      break;
  }
};

//Bag items D-Pad Control
const bagController = (direction) => {
  switch (direction) {
    case "down":
      bagItems[b_numClicks - 1].classList.remove("bag-item--selected");
      bagItems[b_numClicks].classList.add("bag-item--selected");
      bagItems[b_numClicks - 1].children[1].classList.remove(
        "bag-item-img--selected"
      );
      bagItems[b_numClicks].children[1].classList.add("bag-item-img--selected");
      state.selectedAnswer =
        bagItems[b_numClicks].children[1].nextElementSibling.textContent;
      break;
    case "up":
      bagItems[b_numClicks + 1].classList.remove("bag-item--selected");
      bagItems[b_numClicks].classList.add("bag-item--selected");
      bagItems[b_numClicks + 1].children[1].classList.remove(
        "bag-item-img--selected"
      );
      bagItems[b_numClicks].children[1].classList.add("bag-item-img--selected");
      state.selectedAnswer =
        bagItems[b_numClicks].children[1].nextElementSibling.textContent;
      break;
  }
};

//Switch out Pokemon D-Pad Control
const yourPkmnController = (direction) => {
  switch (direction) {
    case "right":
      //removes selection border from previous selection
      yourPkmn[yP_numClicks - 1].classList.remove("selection__card--selected");
      //adds selection border to current selection
      yourPkmn[yP_numClicks].classList.add("selection__card--selected");
      //Update state with currently highlighted pokemon
      state.curPkmIndex = yP_numClicks;
      break;
    case "left":
      yourPkmn[yP_numClicks + 1].classList.remove("selection__card--selected");
      yourPkmn[yP_numClicks].classList.add("selection__card--selected");
      state.curPkmIndex = yP_numClicks;
      break;
    case "down":
      yourPkmn[yP_numClicks - 3].classList.remove("selection__card--selected");
      yourPkmn[yP_numClicks].classList.add("selection__card--selected");
      state.curPkmIndex = yP_numClicks;
      break;
    case "up":
      yourPkmn[yP_numClicks + 3].classList.remove("selection__card--selected");
      yourPkmn[yP_numClicks].classList.add("selection__card--selected");
      state.curPkmIndex = yP_numClicks;
      break;
  }
};

//Game-over selection D-Pad Control
const gameOverController = (direction) => {
  switch (direction) {
    case "down":
      playagainList[numClicks - 1].children[0].classList.remove(
        "arrow--selected"
      );
      playagainList[numClicks].children[0].classList.add("arrow--selected");
      state.selectedAnswer = playagainList[numClicks].lastChild.data;
      break;
    case "up":
      playagainList[numClicks + 1].children[0].classList.remove(
        "arrow--selected"
      );
      playagainList[numClicks].children[0].classList.add("arrow--selected");
      state.selectedAnswer = playagainList[numClicks].lastChild.data;
      break;
  }
};

//Intro Controller
const introController = (direction) => {
  switch (direction) {
    case "down":
      pressStartList[numClicks - 1].children[0].classList.remove(
        "arrow--selected"
      );
      pressStartList[numClicks].children[0].classList.add("arrow--selected");
      state.introSelection = pressStartList[numClicks].lastChild.data;
      break;
    case "up":
      pressStartList[numClicks + 1].children[0].classList.remove(
        "arrow--selected"
      );
      pressStartList[numClicks].children[0].classList.add("arrow--selected");
      state.introSelection = pressStartList[numClicks].lastChild.data;
      break;
  }
};

//Menu Controller
const menuController = (direction) => {
  switch (direction) {
    case "down":
      menuList[m_numClicks - 1].children[0].classList.remove("arrow--selected");
      menuList[m_numClicks].children[0].classList.add("arrow--selected");
      state.menuSelection = menuList[m_numClicks].lastChild.data;
      break;
    case "up":
      menuList[m_numClicks + 1].children[0].classList.remove("arrow--selected");
      menuList[m_numClicks].children[0].classList.add("arrow--selected");
      state.menuSelection = menuList[m_numClicks].lastChild.data;
      break;
  }
};

//Options functionalities
const attackOption = () => {
  //Set Attack Option Grid layout as list
  iframeDocument
    .querySelector(".option-grid")
    .classList.add("option-grid--list");
  if (state.optionSelected === "attack") {
    state.screen = "attack-mode";
    state.optionSelected = state.yourPkmn[state.curPkmIndex].attack_1;
    state.attackSelected = "attack_1";
    dialogue.textContent = "Select an attack!";
    //Display attacks in infobox red
    optionsListItems[0].lastChild.data =
      state.yourPkmn[state.curPkmIndex].attack_1;
    optionsListItems[1].lastChild.data =
      state.yourPkmn[state.curPkmIndex].attack_2;
    optionsListItems[2].lastChild.data =
      state.yourPkmn[state.curPkmIndex].attack_3;
    optionsListItems[3].lastChild.data = "";
  } else if (state.screen === "attack-mode" && state.screen !== "hold-mode") {
    //Displays user command in infobox yellow
    let playerCommands = `${state.yourPkmn[state.curPkmIndex].name}, use ${
      state.optionSelected
    } attack on ${state.opponentPokemon.name}!`;
    dialogue.textContent = playerCommands;
    state.screen = "hold-mode";
    const energy = state.yourPkmn[state.curPkmIndex][`${state.attackSelected}`];
    const attack_num = state.attackSelected;

    delay(1000)
      .then(() => {
        attack_num === "attack_3" ? sound.smash.play() : sound.attack.play();
        iframeDocument
          .querySelector(".player__img")
          .classList.add(`player-${attack_num}`);
        iframeDocument
          .querySelector(".player-energy")
          .classList.add(`player-energy--show`, `player-${energy}--animate`);
        iframeDocument
          .querySelector(".opponent__img")
          .classList.add("opponent--stagger");
      })
      .then(() => {
        delay(4000)
          .then(() => {
            iframeDocument
              .querySelector(".player__img")
              .classList.remove(`player-${attack_num}`);
            iframeDocument
              .querySelector(".player-energy")
              .classList.remove(
                `player-energy--show`,
                `player-${energy}--animate`
              );
            iframeDocument
              .querySelector(".opponent__img")
              .classList.remove("opponent--stagger");
            let attack = Math.floor(
              playerPokemon.attackPower(`${attack_num}`, `${energy}`)
            );
            oppPokemon.damage(attack);
            iframe.contentWindow.updateValues();
            oppTurn();
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
};

const bagOption = () => {
  //Open bag
  if (state.optionSelected === "bag" && state.itemsAllowed !== 0 && state.menuSelection === "") {
    bagItems = iframeDocument.querySelector(".bag-list").children;
    totalItems = bagItems.length - 1;
    //Display bag item quantity
    var bagItemElements = 0;
    var bagObject = state.bag;
    for (const prop in bagObject) {
      bagItemElements += 1;
      bagItems[
        bagItemElements
      ].firstElementChild.textContent = `${bagObject[prop]}x`;
    }
    state.selectedAnswer = "Exit";
    state.screen = "hold-mode";
    state.optionSelected = "bag-opened";
    iframeDocument.querySelector(".backpack").classList.add("backpack--show");
    iframeDocument.querySelector(".bag").classList.add("bag--show");
  } else if (state.optionSelected === "bag-opened") {
    //Execute item selected
    let item = state.selectedAnswer;
    //Only call itemSelected function if item quantity is not zero.
    state.bag[item] > 0 || state.selectedAnswer === "Exit"
      ? itemSelected(item)
      : null;
  } else if (state.optionSelected === "bag" && state.itemsAllowed === 0) {
    dialogue.textContent =
      "You already used an item this turn. Choose another option.";
    sound.error.play();
    sound.error.volume = 0.4;
  }
};

const runOption = () => {
  dialogue.textContent = `You can't run! Keep fighting!`;
  sound.error.play();
  sound.error.volume = 0.4;
};

const pkmonOption = () => {
  if (state.optionSelected === "pkmon" && state.switchPkmn > 0) {
    //Always default your Pokemon to first on list
    state.curPkmIndex = 0;
    iframeDocument.querySelector(".backpack").classList.add("backpack--show");
    iframeDocument
      .querySelector(".yourPkmnList")
      .classList.add("yourPkmnList--show");
    //**Your Pokemon Panel**//
    //display pokemon from yourPkmn List
    const pkmonList = state.yourPkmn;
    let list = "";
    pkmonList.forEach((pokemon, i) => {
      list += `<li id="card_${i}" class="selection__card"><img
      src="${pokemon.image}"
      class="selection__img"
       alt="${pokemon.name}"
       />
      <p class="selection__name">${pokemon.name}</p>
      <p class="selection__mystery-sign">?</p>
      </li>`;
    });
    iframeDocument.querySelector(".yourPkmnList").innerHTML = list;
    yourPkmn = iframeDocument.querySelector(".yourPkmnList").children;
    iframeDocument
      .querySelector(".yourPkmnList")
      .firstElementChild.classList.add("selection__card--selected");
    state.screen = "yourPkmn";
    totalPokemon = yourPkmn.length - 1;
    state.optionSelected = "pkmn-switch";
  } else if (state.optionSelected === "pkmn-switch" && state.switchPkmn > 0) {
    //Load switched in Pokemon
    iframeDocument
      .querySelector(".backpack")
      .classList.remove("backpack--show");
    iframeDocument
      .querySelector(".yourPkmnList")
      .classList.remove("yourPkmnList--show");
    iframe.contentWindow.switchPokemon();
    state.switchPkmn -= 1;
    dialogue.textContent = `I choose, ${
      state.yourPkmn[state.curPkmIndex].name
    }!`;
    loadPokemon();
    sound.switch.play();
    sound.switch.volume = 0.4;
    playerPokemon.switchPkmnHeatlh();
    delay(3000)
      .then(() => {
        oppTurn();
      })
      .catch((err) => console.log(err));
  } else {
    dialogue.textContent = `You already switched out a Pokemon this battle. Select another option.`;
    sound.error.play();
    sound.error.volume = 0.4;
  }
};

//Executes Bag Item selected
const itemSelected = (item) => {
  closeBag();
  switch (item) {
    case "Pokeball":
      throwPokeBall();
      break;
    case "Potion":
    case "Super Potion":
      playerPokemon.recover(item);
      break;
    default:
      null;
  }
};

//Turn off bag display
const closeBag = () => {
  iframeDocument.querySelector(".backpack").classList.remove("backpack--show");
  iframeDocument.querySelector(".bag").classList.remove("bag--show");
  bagItems[b_numClicks].classList.remove("bag-item--selected");
  bagItems[b_numClicks].children[1].classList.remove("bag-item-img--selected");
  state.optionSelected = "bag";
  b_numClicks = 0;
  bagItems[b_numClicks].classList.add("bag-item--selected");
  bagItems[b_numClicks].children[1].classList.add("bag-item-img--selected");
  //Keep in hold-mode if Pokeball is used
  if (state.selectedAnswer !== "Pokeball") {
    state.screen = "battle-screen";
  }
};

//Display current pokemon data to infbox
const getDataSet = (numClicks) => {
  //Update state with currently highlighted pokemon
  state.curSelectPokemon = state.pokemonList[numClicks];
  //List info of current pokemon
  return `<li>${selectionListItems[numClicks].dataset.type}</li>
      <li>${selectionListItems[numClicks].dataset.health}</li>
      <li>${selectionListItems[numClicks].dataset.attack}</li>
      <li>${selectionListItems[numClicks].dataset.defense}</li>
      <li>${selectionListItems[numClicks].dataset.weakness}</li>`;
};

//Resets infobox Red options list
const resetOptions = () => {
  if (state.screen === "gameover-screen") {
    state.yourPkmn = [];
    state.curPkmIndex = 0;
    numItems = 0;
    totalItems = 0;
    totalPokemon = 0;
    state.wins = 0;
  } else {
    dialogue.textContent = `It's your move!`;
    //Resets options list
    optionsListItems[0].lastChild.data = "attack";
    optionsListItems[1].lastChild.data = "bag";
    optionsListItems[2].lastChild.data = "pkmon";
    optionsListItems[3].lastChild.data = "run";
    //Reset numClicks and arrow icon
    optionsListItems[numClicks].children[0].classList.remove("arrow--selected");
    iframeDocument
      .querySelector(".option-grid")
      .classList.remove("option-grid--list");
    numClicks = 0;
    b_numClicks = 0;
    yP_numClicks = 0;
    optionsListItems[numClicks].children[0].classList.add("arrow--selected");
    state.screen = "battle-screen";
    state.itemsAllowed = 5;
  }
  state.optionSelected = "attack";
  state.attackSelected = "";
  state.selectedAnswer = "yes";
};

//Duplicate Power allows Mewtwo to copy all Opponents attacks & determine which attack is most potent to the players current Pokemon in use
const duplicatePower = () => {
  //Find current player pokemon types
  const playerPkmnTypes = state.yourPkmn[state.curPkmIndex].type.split("/");
  const list = state.yourPkmn;
  //Get all player's pokemon attacks
  const allAttacks = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < 2; j++) {
      const attack = list[i][`attack_${j + 1}`];
      allAttacks.push(attack);
    }
  }
  //Stores all attacks in rank of damage to player's current Pokemon (attack vs current Pokemon types)
  const attackRank = {
    highest: {},
    medium: {},
    low: {},
    nodamage: {},
  };
  //Randomly pick from an attack from attackRank
  const randomNum = (attackList) => {
    return Math.floor(Math.random() * attackList.length);
  };
  //Takes all attacks stored and compares against player's pokemon Types.  Then ranks and stores them in their rank tier.
  allAttacks.forEach((attack) => {
    const attackType = state.attackTypes[attack];
    playerPkmnTypes.forEach((playerPkmnType) => {
      const rank = state.typeChart[`${attackType}`][`${playerPkmnType}`];
      if (rank === 2) {
        attackRank.highest[attack] = "";
      } else if (rank === 1) {
        attackRank.medium[attack] = "";
      } else if (rank === 0.5) {
        attackRank.low[attack] = "";
      } else {
        attackRank.nodamage[attack] = "";
      }
    });
  });
  //Converts attackRank tier objects into array
  for (const rank in attackRank) { 
    let attackList = [];
    for(const attack in attackRank[rank]) {
      attackList.push(attack)
    }
    attackRank[rank] = attackList;
  }
  //Return a randomly picked attack from highest attack rank tier that exist
  let num;
  if (attackRank.highest.length !== 0) {
    num = randomNum(attackRank.highest);
    return attackRank.highest[num];
  } else if (attackRank.medium.length !== 0) {
    num = randomNum(attackRank.medium);
    return attackRank.medium[num];
  } else if (attackRank.low.length !== 0) {
    num = randomNum(attackRank.low);
    return attackRank.low[num];
  } else {
    //Mewtwo will use Tackle in place of no damage attacks.
    return "Tackle";
  }
};

const ranAttack = (num) => {
  return Math.floor(Math.random() * num) + 1;
};

const oppTurn = () => {
  if (state.screen !== "gameover-screen") {
    delay(2000)
      .then(() => {
        let energy;
        // If Mewtwo is the boss, there are 4 attacks to pick from, all other Pokemon have only 3 attacks to randomly pick from.
        const ranNum =
          state.opponentPokemon.name === "Mewtwo (Boss)"
            ? ranAttack(4)
            : ranAttack(3);
        // const ranNum = 4;
        state.attackSelected = `attack_${ranNum}`;
        //MewTwo Attack 4 is Duplicate Power (Copies all opponents attack)
        if (state.opponentPokemon.name === "Mewtwo (Boss)" && ranNum === 4) {
          energy = duplicatePower();
          dialogue.textContent = `${state.opponentPokemon.name} duplicated ${energy} attack.`;
        } else {
          energy = state.opponentPokemon[`${state.attackSelected}`];
          dialogue.textContent = `${state.opponentPokemon.name} uses ${energy} attack.`;
        }
        const attack_num = state.attackSelected;
        attack_num === "attack_3" ? sound.smash.play() : sound.attack.play();
        iframeDocument
          .querySelector(".opponent__img")
          .classList.add(`opponent-${attack_num}`);
        iframeDocument
          .querySelector(".opponent-energy")
          .classList.add(
            `opponent-energy--show`,
            `opponent-${energy}--animate`
          );
        iframeDocument
          .querySelector(".player__img")
          .classList.add("player--stagger");
        delay(4000)
          .then(() => {
            iframeDocument
              .querySelector(".opponent__img")
              .classList.remove(`opponent-${attack_num}`);
            iframeDocument
              .querySelector(".opponent-energy")
              .classList.remove(
                `opponent-energy--show`,
                `opponent-${energy}--animate`
              );
            iframeDocument
              .querySelector(".player__img")
              .classList.remove("player--stagger");
            let attack = Math.floor(
              oppPokemon.attackPower(`${attack_num}`, `${energy}`)
            );
            playerPokemon.damage(attack);
            delay(3000)
              .then(() => resetOptions())
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
};

//Determines catch success rate probability based on health of opponent
const throwPokeBall = () => {
  state.bag.Pokeball -= 1;
  state.itemsAllowed -= 1;
  const healthPercent = Math.floor(
    (oppPokemon.pkmState.health_active / oppPokemon.pkmState.health_total) * 100
  );
  if (healthPercent > 40) {
    return catchSuccess(100);
  } else if (healthPercent < 40 && healthPercent > 30) {
    return catchSuccess(10);
  } else if (healthPercent < 30 && healthPercent > 20) {
    return catchSuccess(5);
  } else if (healthPercent < 20 && healthPercent > 10) {
    return catchSuccess(3);
  } else {
    return catchSuccess(2);
  }
};

//Randomly catch success based on number range
const catchSuccess = (n) => {
  let matchNum = Math.floor(Math.random() * n) + 1;
  let successNum = Math.floor(Math.random() * n) + 1;
  if (matchNum === successNum) {
    return pokemonCaught("success");
  }
  return pokemonCaught("fail");
};

//Pokeball catching Pokemon
const pokemonCaught = (caught) => {
  iframeDocument.querySelector(".opponent__img").classList.add("pokeBallHit");
  dialogue.textContent = "'Go pokeball!'";
  delay(2000)
    .then(() => {
      sound.catch.play();
      iframeDocument
        .querySelector(".opponent__img")
        .classList.remove("pokeBallHit");
      iframeDocument.querySelector(".opponent__img").classList.add("pokeBall");
      iframeDocument.querySelector(".opponent__img").src =
        "https://www.serebii.net/itemdex/sprites/pgl/pokeball.png";
      dialogue.textContent = `You caught ${oppPokemon.pkmState.name}...`;
      state.captured = true;
    })
    .then(() => {
      delay(3500)
        .then(() => {
          //If fail, release pokemon
          if (caught === "fail") {
            sound.fail.play();
            sound.fail.volume = 0.3;
            state.captured = false;
            dialogue.textContent = `${oppPokemon.pkmState.name} broke free! It's too strong! What's your next move?`;
            iframeDocument
              .querySelector(".opponent__img")
              .classList.remove("pokeBall");
            iframeDocument.querySelector(".opponent__img").src =
              state.opponentPokemon.oppSprite;
            state.screen = "battle-screen";
          } else if (caught === "success") {
            //Reduce Opponent Pokemon if caught success during battle.
            oppPokemon.damage(90000);
          } else {
            playerPokemon.win();
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

//Pokemon status
class Pokemon {
  constructor(side, attack, defense, totalHealth, state, healthFill, defender) {
    this.side = side;
    this.attackpt = attack;
    this.defense = defense;
    this.totHealth = totalHealth;
    this.pkmState = state;
    this.healthFillEl = healthFill;
    this.defenderType = defender;
  }

  attackPower(attackNum, attack) {
    //Gets attack type
    const attackType = state.attackTypes[`${attack}`];
    const defenderTypeList = this.defenderType.split("/");
    //Check all opponent's type.  Store highest hit factor (damage rating).
    let hitFactor = 0;
    defenderTypeList.forEach((type) => {
      let rating = state.typeChart[`${attackType}`][`${type}`];
      if (rating > hitFactor) {
        hitFactor = rating;
      }
    });

    //Effectiveness
    let effect;
    if (hitFactor === 2) {
      effect = "It's super effective!";
    } else if (hitFactor === 1) {
      effect = "It's effective!";
    } else if (hitFactor === 0.5) {
      effect = "It's not very effective!";
    } else {
      effect = "No damage!";
    }
    dialogue.textContent = `${effect}`;

    const accuracy = Math.random() * (1 - 0.5) + 0.5;
    if (attackNum === "attack_1") {
      return Math.floor(this.attackpt * 0.2 * hitFactor * accuracy * 1);
    } else if (attackNum === "attack_2") {
      return Math.floor(this.attackpt * 0.2 * hitFactor * accuracy * 1.03);
    } else if (attackNum === "attack_4") {
      return Math.floor(this.attackpt * 0.1 * hitFactor * accuracy * 0.8);
    } else {
      //Else is attack 3 (tackle) will be considered as normal attack
      return Math.floor(this.attackpt * 0.2 * hitFactor * accuracy * 1.03);
    }
  }
  damage(attack) {
    let defensePt = this.defense * 0.025;
    let damage = attack - defensePt;
    if (damage < 0) {
      damage = 0;
    }
    // let damage = 106; //temp damage test
    let currHealth = Math.floor(this.pkmState.health_active - damage);
    if (currHealth <= 0) {
      currHealth = 0;
    }
    this.value = currHealth;
    this.update();
  }
  recover(potion) {
    //Determines which potion numClicks to reduce
    potion === "Potion"
      ? (state.bag.Potion -= 1)
      : (state.bag["Super Potion"] -= 1);
    //Determines which potion to use
    let healPoints = potion === "Potion" ? 15 : 25;
    let currHealth = Math.floor(this.pkmState.health_active + healPoints);
    state.itemsAllowed -= 1;
    if (currHealth >= this.pkmState.health_total) {
      currHealth = this.pkmState.health_total;
    }
    this.value = currHealth;
    dialogue.textContent = `Your ${potion} restored ${this.pkmState.name}'s health to ${currHealth}.`;
    this.update();
    sound.heal.play();
    sound.heal.volume = 0.1;
  }
  delayLoadingScreen(screen, screenFunc) {
    state.switchPkmn = 10;
    delay(4000)
      .then(() => {
        displayScreen(screen, screenFunc);
      })
      .catch((err) => console.log(err));
  }
  switchPkmnHeatlh() {
    //Updates health bar to switched in Pokemon
    this.value = this.pkmState.health_active;
    this.update();
  }
  update() {
    //Updates health
    const percentage = Math.floor((this.value / this.totHealth) * 100) + "%";
    //Health value
    this.pkmState.health_active = this.value;
    iframe.contentWindow.updateValues();
    //Health bar level
    this.healthFillEl.style.width = percentage;
    if (this.pkmState.health_active === 0 && this.side === "opponent") {
      //You win
      state.screen = "gameover-screen";
      dialogue.textContent = `It's health is 0.`;
      delay(1500)
        .then(() => {
          //If Pokemon has not been captured, use Pokeball.
          state.captured === false ? pokemonCaught(null) : this.win();
        })
        .catch((err) => console.log(err));
    } else if (this.pkmState.health_active === 0) {
      this.lose();
    }
  }
  win() {
    sound.winGame.play();
    state.wins += 1;
    //Receive an extra item randomly
    const ranNum = Math.floor(Math.random() * 3);
    const bagItemsArr = ["Potion", "Super Potion", "Pokeball"];
    const itemWon = bagItemsArr[ranNum];
    state.bag[itemWon] += 1;
    //display winning item infobox red
    dialogue.textContent = `You win ${state.wins} round.`;
    sound.winGame.play();
    //Add Caught Pokemon to your team
    state.yourPkmn.push(state.opponentPokemon);
    //Reset
    state.captured = false;
    //Restore all pokemon when new round starts
    // dialogue.textContent = `You gained an extra ${itemWon} this battle.`
    if (state.wins >= 3) {
      //You win a Pokemon badge //Gameover
      this.delayLoadingScreen("gameover-screen", gameoverScreen);
    } else {
      //Continue Battle Rounds
      this.delayLoadingScreen("opp-selection-screen", oppSelectionScreen);
    }
  }
  lose() {
    sound.lostGame.play();
    dialogue.textContent = "You lost!";
    state.screen = "gameover-screen";
    this.delayLoadingScreen("gameover-screen", gameoverScreen);
  }
}

async function init() {
  console.log("starting up app...");
  //--------Load Intro Screen--------//
  displayScreen("intro-screen", introScreen);
  delay(1500)
    .then(() => {
      state.screen = "intro-screen";
      document.getElementsByName("screen-display")[0].src =
        state.screen + ".html";
    })
    .catch((err) => console.log(err));

  // --Opponent Screen Testing--//
  // displayScreen("opp-selection-screen", oppSelectionScreen);

  // --Battle Screen Testing---//
  // const response1 = await fetch("./src/player.json").catch((err) =>
  //   console.log(err)
  // );
  // const data1 = await response1.json().catch((err) => console.log(err));
  // state.curSelectPokemon = data1[0];
  // console.log(data1)

  // const response2 = await fetch("./src/opponent.json").catch((err) =>
  //   console.log(err)
  // );
  // const data2 = await response2.json().catch((err) => console.log(err));
  // state.opponentPokemon = data2[0];
  // state.screen = "battle-screen";
  // document.getElementsByName("screen-display")[0].src = state.screen + ".html";
  // displayScreen("battle-screen", battleScreen);

  // // ==Temp load a pokemon team==//
  // // Grab from state 3 pokemon
  // const response3 = await fetch("./src/pokemonList.json").catch((err) =>
  //   console.log(err)
  // );
  // const data = await response3.json().catch((err) => console.log(err));
  // for (let i = 6; i < 9; i++) {
  //   state.yourPkmn.push(data[i]);
  // }

  //---Gameover Test Load---//
  // displayScreen("gameover-screen", gameoverScreen);
}

init();
