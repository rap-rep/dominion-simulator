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

function getResultElement(result) {
  var resultDiv = document.createElement("div");
  resultDiv.classList.add("pure-g");
  resultDiv.classList.add("query-result");

  let withClause = undefined;
  if (result.fromCard && result.fromCard !== ANY_CARD) {
    withClause = ` with ${result.fromCard}`;
  }

  let byTurnClause = undefined;
  if (result.byTurn && result.byTurn < 99) {
    byTurnClause = ` by turn ${result.byTurn}`;
  }

  const optionalClauses = [];
  for (const clause of [withClause, byTurnClause]) {
    if (clause !== undefined) {
      optionalClauses.push(clause);
    }
  }

  if (result.type === EventQueryType.DRAW_CARD) {
    resultDiv.innerHTML = `${result.playerName} average cards drawn${optionalClauses.join(" ")}: ${result.average}`;
  } else if (result.type === EventQueryType.WINS) {
    resultDiv.innerHTML = `${result.playerName} win ratio${optionalClauses.join(" ")}: ${result.average}`;
  } else if (result.type === EventQueryType.VP) {
    resultDiv.innerHTML = `${result.playerName} average VP${optionalClauses.join(" ")}: ${result.average}`;
  } else {
    throw new Error(`'${result.type}' result type not supported`);
  }

  return resultDiv;
}

function includeSampleLog() {
  var sampleLogSelect = document.getElementById("sample-log-select");
  return sampleLogSelect.checked;
}

function parseStartingCards(inputElementId) {
  cards = document.getElementById(inputElementId);
  list = cards.value.split(",");
  cardArray = new Array();
  for (card of list) {
    cardElems = card.trim().split(" ");
    cardAmount = Number(cardElems[0]);
    cardName = cardElems.slice(1, cardElems.length + 1).join(" ");
    cardArray.push(new Array(cardName, cardAmount));
  }
  return cardArray;
}

function parseTurnLimit() {
  turnLimitElement = document.getElementById("game-turn-limit");
  turnLimit = turnLimitElement.value;
  return turnLimit;
}

function displaySampleLog(log) {
  if (log === undefined) {
    return;
  } else {
    const anchor = document.getElementById("sample-log");
    const title = document.createElement("h4");
    title.innerHTML = "Sample Log";
    anchor.appendChild(title);
    for (const line of log) {
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("pure-g");
      lineDiv.classList.add("log-line");
      if (line === "") {
        lineDiv.innerHTML = "&nbsp;";
      } else {
        lineDiv.innerHTML = line;
      }

      anchor.appendChild(lineDiv);
    }
  }
}

function simGame(numGames) {
  const p1anchor = document.getElementById("player-one-conditions");
  const p1rules = getConditionRules(p1anchor);

  const p2anchor = document.getElementById("player-two-conditions");
  const p2rules = getConditionRules(p2anchor);

  const eventQueries = parseEventQueries();

  const includeSampleLogResult = includeSampleLog();

  const p1cards = parseStartingCards("p1-starting-deck");
  const p2cards = parseStartingCards("p2-starting-deck");

  const turnLimit = parseTurnLimit();

  data = {
    p1rules: p1rules,
    p2rules: p2rules,
    eventQueries: eventQueries,
    numGames: numGames,
    includeSampleLog: includeSampleLogResult,
    p1cards: p1cards,
    p2cards: p2cards,
    turnLimit: turnLimit,
  };

  var anchor = document.getElementById("game-results");
  var sampleLogAnchor = document.getElementById("sample-log");
  sampleLogAnchor.replaceChildren([]);

  const spinnerDiv = document.createElement("div");
  spinnerDiv.classList.add("lds-dual-ring");
  anchor.replaceChildren(spinnerDiv);

  Http.post("/api/game/post_run", data)
    .then((resp) => resp.json())
    .then((resp) => {
      var results = resp.results;
      var sampleLog = resp.log;
      anchor.replaceChildren([]);
      const title = document.createElement("h4");
      title.innerHTML = "Event Results";
      anchor.appendChild(title);
      for (const result of results) {
        anchor.appendChild(getResultElement(result));
      }
      displaySampleLog(sampleLog);
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
    const formElements = queryForm.children[0].children;
    const selectionType = formElements[0].value;
    if (selectionType === EventQueryType.DRAW_CARD) {
      fromCard = formElements[2].value;
      byTurn = parseInt(formElements[4].value);
      eventQueries.push(new EventQuery(selectionType, fromCard, byTurn));
    } else if (selectionType === EventQueryType.WINS) {
      byTurn = parseInt(formElements[2].value);
      eventQueries.push(new EventQuery(selectionType, undefined, byTurn));
    } else if (selectionType === EventQueryType.VP) {
      fromCard = formElements[2].value;
      eventQueries.push(new EventQuery(selectionType, fromCard));
    }
  }

  return eventQueries;
}

function setupRuleCollapseExpand() {
  const p1CollapseExpand = document.getElementById("p1-rule-collapse");
  const p1RuleBox = document.getElementById("player-one-conditions");

  const p2CollapseExpand = document.getElementById("p2-rule-collapse");
  const p2RuleBox = document.getElementById("player-two-conditions");

  const EXPAND = "[+]";
  const COLLAPSE = "[-]";

  function collapseExpand(event, ruleBox) {
    event.preventDefault();
    const boxText = event.target.innerHTML.trim();
    if (boxText === COLLAPSE) {
      ruleBox.style.display = "none";
      event.target.innerHTML = EXPAND;
    } else if (boxText === EXPAND) {
      ruleBox.style.display = "";
      event.target.innerHTML = COLLAPSE;
    } else {
      throw new Error("Invalid value in collapse/expand button: " + boxText);
    }
  }

  p1CollapseExpand.addEventListener("click", (event) => {
    collapseExpand(event, p1RuleBox);
  });

  p2CollapseExpand.addEventListener("click", (event) => {
    collapseExpand(event, p2RuleBox);
  });
}

// Section: UI Utility
setupRuleCollapseExpand();

// Section: Initializers
setupSimListeners();
