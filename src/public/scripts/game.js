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

function getGame() {
  var playButton = document.getElementById("play-game-btn");

  playButton.addEventListener("click", (event) => {
    event.preventDefault();

    const p1anchor = document.getElementById("player-one-conditions");
    const p1rules = getConditionRules(p1anchor);

    const p2anchor = document.getElementById("player-two-conditions");
    const p2rules = getConditionRules(p2anchor);

    data = { p1rules: p1rules, p2rules: p2rules };

    Http.post("/api/game/post_run", data)
      .then((resp) => resp.json())
      .then((resp) => {
        var turns = resp.turns;
        var anchor = document.getElementById("game-results");
        anchor.innerHTML = "<ul><li>Turns: " + turns + "</li></ul>";
      });
  });
}

getGame();
