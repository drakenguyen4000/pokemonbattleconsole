const gameoverScreen = () => {
  console.log("gameover screen started...");
  setTimeout(() => {
    //Hide loading screen
    document
      .querySelector(".loading-screen")
      .classList.add("loading-screen--hide");
  }, 2000);
};

window.onload = gameoverScreen;
