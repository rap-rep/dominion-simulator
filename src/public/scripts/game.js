function getGame() {
  Http.get("/api/game/run")
    .then((resp) => resp.json())
    .then((resp) => {
      var turns = resp.turns;
      var anchor = document.getElementById("game-results");
      anchor.innerHTML = "<ul><li>Turns: " + turns + "</li></ul>";
    });
}

getGame();
