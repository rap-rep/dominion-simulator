// Section: ordered condition gaining parsing for passing to Game creation

class ConditionSet {
  constructor(conditionSet, cardToGain) {
    this.conditionSet = conditionSet;
    this.cardToGain = cardToGain;
  }
}

class Condition {
  constructor(
    gainMetric,
    comparator = undefined,
    amount = undefined,
    cardList = undefined,
    joiner = undefined,
  ) {
    this.gainMetric = gainMetric;
    this.comparator = comparator;
    this.amount = amount;
    this.cardList = cardList;
    this.joiner = joiner;
  }
}

class PlayerRules {
  constructor() {
    this.conditionSetList = [];
  }
}

function getLogicalJoinerIfExists(conditionChildren, expectedPosition) {
  if (conditionChildren.length - 1 === expectedPosition) {
    return conditionChildren[expectedPosition].value;
  }
  return undefined;
}

function parseRules(ruleAnchor) {
  const ruleElements = ruleAnchor.lastChild.children;
  const cardToGainOffset = 5;
  const cardToGain = ruleElements[ruleElements.length - cardToGainOffset];

  let idx = ruleElements.length - cardToGainOffset;
  let conditions = [];
  while (idx >= 0) {
    const elem = ruleElements[idx];
    if (elem.classList.contains("select-condition")) {
      let conditionType = elem.value;
      const conditionElements = ruleElements[idx + 1].children;
      if (conditionType === "add_condition" && conditions.length === 0) {
        conditions.push(new Condition(GainMetrics.CAN_GAIN));
      } else if (conditionType === "add_condition") {
        break;
      } else if (
        conditionType === GainMetrics.COINS_AVAILABLE ||
        conditionType === GainMetrics.TURN
      ) {
        const comparator = conditionElements[0].value;
        const number = parseInt(conditionElements[1].value, 10);
        const joiner = getLogicalJoinerIfExists(conditionElements, 2);
        conditions.push(
          new Condition(conditionType, comparator, number, [], joiner),
        );
      } else if (conditionType === GainMetrics.CARD_IN_DECK_COUNT) {
        const card1 = conditionElements[0].value;
        const comparator = conditionElements[1].value;
        const number = parseInt(conditionElements[2].value, 10);
        const joiner = getLogicalJoinerIfExists(conditionElements, 3);
        conditions.push(
          new Condition(conditionType, comparator, number, [card1], joiner),
        );
      } else if (conditionType === GainMetrics.DIFF_IN_DECK) {
        const card1 = conditionElements[0].value;
        const card2 = conditionElements[2].value;
        const comparator = conditionElements[3].value;
        const number = parseInt(conditionElements[4].value, 10);
        const joiner = getLogicalJoinerIfExists(conditionElements, 5);
        conditions.push(
          new Condition(
            conditionType,
            comparator,
            number,
            [card1, card2],
            joiner,
          ),
        );
      } else {
        throw new Error(
          `Gain metric ${conditionType} not supported in parsing of rules`,
        );
      }
    }
    idx--;
  }
  const conditionSet = new ConditionSet(conditions, cardToGain.value);
  return conditionSet;
}

function getConditionRules(playerAnchor) {
  const playerRules = new PlayerRules();
  for (const child of playerAnchor.lastChild.children) {
    playerRules.conditionSetList.push(parseRules(child));
  }
  return playerRules;
}

function getResultElement(result){
    var resultDiv = document.createElement("div");
    resultDiv.classList.add("pure-g");
    resultDiv.classList.add("query-result")

    let byTurnClause = "";
    if (byTurn !== 99){
      byTurnClause =  ` by turn ${result.byTurn}`
    }
    if (result.type === EventQueryType.DRAW_CARD){
      resultDiv.innerHTML = `${result.playerName} average cards drawn with ${result.fromCard}${byTurnClause}: ${result.average}`;
    }
    else{
      throw new Error(`'${result.type}' result type not supported`)
    }
  
    return resultDiv;
}

function simGame(numGames){
  const p1anchor = document.getElementById("player-one-conditions");
  const p1rules = getConditionRules(p1anchor);

  const p2anchor = document.getElementById("player-two-conditions");
  const p2rules = getConditionRules(p2anchor);

  const eventQueries = parseEventQueries();

  data = { p1rules: p1rules, p2rules: p2rules, eventQueries: eventQueries, numGames: numGames };

  Http.post("/api/game/post_run", data)
    .then((resp) => resp.json())
    .then((resp) => {
      var results = resp.results;
      var anchor = document.getElementById("game-results");
      anchor.replaceChildren([]);

      for (const result of results){
          anchor.appendChild(getResultElement(result));
      }
      
    });
}

function setupSimListeners() {
  var playButton = document.getElementById("play-game-btn");

  playButton.addEventListener("click", (event) => {
    event.preventDefault();
    simGame(1);
  });


  var playButton100 = document.getElementById("play-game-btn-100");
  playButton100.addEventListener("click", (event) => {
    event.preventDefault();
    simGame(100);
  });


  var playButton1000 = document.getElementById("play-game-btn-1000");
  playButton1000.addEventListener("click", (event) => {
    event.preventDefault();
    simGame(1000);
  });
}

// Section: event querying parsing for passing to Game creation

class EventQuery {
  constructor(
    type, // EventQueryType (string)
    fromCard, // string
    byTurn, // number
    toCard, // string (optional)
  ) {
    this.type = type;
    this.fromCard = fromCard;
    this.byTurn = byTurn;
    this.toCard = toCard;
  }
}

function parseEventQueries() {
  const eventQueries = [];

  const queryDiv = document.getElementById("event-queries");
  for (const queryForm of queryDiv.children) {
    const formElements = queryForm.children;
    const selectionType = formElements[0].value;
    if (selectionType === EventQueryType.DRAW_CARD) {
      fromCard = formElements[2].value;
      byTurn = parseInt(formElements[4].value);
      eventQueries.push(new EventQuery(selectionType, fromCard, byTurn));
    }
  }

  return eventQueries;
}

// Section: Initializers
setupSimListeners();
