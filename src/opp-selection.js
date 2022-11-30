var oppState = {
  opponentPokemon: {},
  pkmnBoss: {},
  wins: 0,
};

//Creates list of info details
const getDataSet = () => {
  return `<li>${oppState.opponentPokemon.type}</li>
<li>${oppState.opponentPokemon.health_total}</li>
<li>${oppState.opponentPokemon.attack}</li>
<li>${oppState.opponentPokemon.defense}</li>
<li>${oppState.opponentPokemon.weakness}</li>`;
};

//Timer to slow effect
const slowLoop = (time) => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve();
    }, time);
  });
};

async function oppScreenLoad(){
  //Displays List of Pokemons
  console.log("opp-selection-screen started...");
  //Update wins
  oppState.wins = window.parent.state.wins;

  let response;
  //Load Boss Pokemon only after 2 wins
  if(oppState.wins === 2){
      //Boss Pokemon
      response = await fetch("./src/boss.json").catch((err)=>{
      console.log(err)
    });
  } else {
    //All Pokemon
    response = await fetch("./src/pokemonList.json").catch((err) =>
    console.log(err));
  }

  const data = await response.json().catch((err) => console.log(err));
  oppState.opponentPokemon = data;

  //Randomly Picks Pokemon from JSON List
  let randomPokemon;
  randomPokemon = Math.floor(Math.random() * data.length);
  
  //Store picked Pokemon in state
  oppState.opponentPokemon = data[randomPokemon];

  //Takes JSON data and create list
  let list = "";
  data.forEach((item, i) => {
    list += `<li id="card_${i}" class="selection__card selection__mystery-card--show"
  >
<img
  src="${item.image}"
  class="selection__img--hide"
  alt="${item.name}"
/>
<p class="selection__name--hide">${item.name}</p>
<p class="selection__mystery-sign--show">?</p>
</li>`;
  });

  //Load list
  document.querySelector(".selection__list").innerHTML = list;
  //Resize selection grid for boss pokemon
  if(oppState.wins === 2){
    document.querySelector(".selection__list").classList.add("selection__list--boss");
  }
  //Display Loading screen
  document
    .querySelector(".loading-screen")
    .classList.add("loading-screen--hide");

  //Highlights first card with orange border
  document.getElementById("card_0").classList.add("selection__card--selected");
  //run through two loops before landing on selected card.
  let opponentListItems = document.querySelector(".selection__list").children;

  //Picks a Random Card position to display (randomly picked Pokemon)
  const randomPosition = Math.floor(Math.random() * data.length);

  //Wait time animation completes before return next screen to load
  return new Promise((resolve) => {
    //Loops through cards displayed and highlights current selection
    setTimeout(async () => {
      for (let j = 0; j < randomPosition; j++) {
        await slowLoop(500);
        opponentListItems[j].classList.remove("selection__card--selected");
        opponentListItems[j + 1].classList.add("selection__card--selected");
      }

      //Create a list item with the randomly picked pokemon
      const opponentPokemonLi = `<li id="card_${randomPosition}" class="selection__card selection__card--selected"
  data-name=${oppState.opponentPokemon.name}
  data-abilities=${oppState.opponentPokemon.abilities}
  data-summary=${oppState.opponentPokemon.summary}
  data-type=${oppState.opponentPokemon.type}
  data-weakness=${oppState.opponentPokemon.weakness}
  data-health=${oppState.opponentPokemon.health_total}
  data-attack=${oppState.opponentPokemon.attack}
  data-defense=${oppState.opponentPokemon.defense}
  data-evolve=${oppState.opponentPokemon.evolve}
  >
<img
  src="${oppState.opponentPokemon.image}"
  class="selection__img"
  alt="${oppState.opponentPokemon.name}"
/>
<p class="selection__name">${oppState.opponentPokemon.name}</p>
<p class="selection__mystery-sign">?</p>
</li>`;
      //Replace current list item with item of randomly picked pokemon
      opponentListItems[randomPosition].outerHTML = opponentPokemonLi;
      opponentListItems[randomPosition].classList.add(
        "selection__mystery-card--hide"
      );
      //Resize selection grid for boss pokemon
      if(oppState.wins === 2){
        document.querySelector(".selection__img").classList.add("selection__img--boss");
      }
      //Update infobox with Opponent Pokemon's details
      document.querySelector(".info-list2").innerHTML = getDataSet();
      setTimeout(() => {
        resolve("battle-screen");
      }, 4000);
    }, 2000);
  });
}
