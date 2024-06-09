const GainMetrics = {
  CAN_GAIN: "can_gain",
  COINS_AVAILABLE: "coins_available",
  TURN: "turn",
  CARD_IN_DECK_COUNT: "in_deck",
  DIFF_IN_DECK: "diff_in_deck",
};

const Comparisons = {
  GREATER_OR_EQUAL: ">=",
  LESS_OR_EQUAL: "<=",
};

const LogicalJoiners = {
  AND: "AND",
  OR: "OR",
};

function getComparisonElement() {
  var comparisonSelect = document.createElement("select");
  for (const comparison of Object.values(Comparisons)) {
    var option = document.createElement("option");
    option.value = comparison;
    option.text = comparison;
    comparisonSelect.appendChild(option);
  }
  return comparisonSelect;
}

function getDeleteRuleIcon() {
  var button = document.createElement("button");
  button.classList.add("pure-button");
  button.classList.add("delete-rule");

  button.innerHTML = "X";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    const allRulesDiv = event.target.parentElement.parentElement.parentElement;
    allRulesDiv.removeChild(event.target.parentElement.parentElement);
  });

  return button;
}

function getAddRuleIcon() {
  var button = document.createElement("button");
  button.classList.add("add-rule");
  button.classList.add("pure-button");
  button.innerHTML = "+ Rule";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    const ruleDiv = getCanGainRule("Province");
    event.target.parentElement.parentElement.parentElement.insertBefore(
      ruleDiv,
      event.target.parentElement.parentElement,
    );
  });

  return button;
}

function getMoveUpRuleIcon() {
  var button = document.createElement("button");
  button.classList.add("pure-button");
  button.classList.add("move-rule-up");

  button.innerHTML = "^";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    // Delete the rule associated with the icon
    const ruleElement = event.target.parentElement.parentElement;
    const currentIdx = Array.from(ruleElement.parentElement.children).indexOf(
      ruleElement,
    );

    if (currentIdx > 0) {
      ruleElement.parentElement.insertBefore(
        ruleElement,
        ruleElement.parentElement.children[currentIdx - 1],
      );
    }
  });

  return button;
}

function getMoveDownRuleIcon() {
  var button = document.createElement("button");
  button.classList.add("pure-button");
  button.classList.add("move-rule-down");

  button.innerHTML = "v";

  button.addEventListener("click", (event) => {
    event.preventDefault();
    // Delete the rule associated with the icon
    const ruleElement = event.target.parentElement.parentElement;
    //event.target.parentElement.parentElement.parentElement.removeChild(event.target.parentElement.parentElement);
    const currentIdx = Array.from(ruleElement.parentElement.children).indexOf(
      ruleElement,
    );

    if (currentIdx < ruleElement.parentElement.children.length - 1) {
      ruleElement.parentElement.insertBefore(
        ruleElement,
        ruleElement.parentElement.children[currentIdx + 2],
      );
    }
  });

  return button;
}

function getLogicalJoinerElement() {
  var joinerSelect = document.createElement("select");
  joinerSelect.classList.add("logical-joiner");
  for (const joiner of Object.values(LogicalJoiners)) {
    var option = document.createElement("option");
    option.value = joiner;
    option.text = joiner;
    joinerSelect.appendChild(option);
  }

  return joinerSelect;
}

function getNumericalInput() {
  var numberInput = document.createElement("input");
  numberInput.classList.add("number-input");
  numberInput.type = "number";
  numberInput.value = 1;
  return numberInput;
}

function getCardInput() {
  var cardInput = document.createElement("input");
  cardInput.classList.add("smaller-card-input");
  cardInput.type = "text";
  cardInput.value = "Silver";

  return cardInput;
}

function getDiffIndicatorElement() {
  var diffSpan = document.createElement("diffSpan");
  diffSpan.innerHTML = "-";
  return diffSpan;
}

function addConditionListener(addConditionSelect) {
  addConditionSelect.addEventListener("change", (event) => {
    var isFirstAdded = true;
    var isAChangeToCurrentRule = false;
    if (event.target.parentElement.children.length > 7) {
      isFirstAdded = false;
    }

    event.target.classList.remove("add-condition-selector");

    if (!isFirstAdded) {
      // Remove the existing condition (unless coming from "Add Condition" state)
      const ruleElements = event.target.parentElement.children;
      const thisSelectorPosition = Array.prototype.indexOf.call(
        ruleElements,
        event.target,
      );
      if (thisSelectorPosition > 0) {
        // Not the leftmost "Add Condition" selector
        isAChangeToCurrentRule = true;
        const thisSelectorRules = ruleElements[thisSelectorPosition + 1];
        event.target.parentElement.removeChild(thisSelectorRules);
      }
    }

    const conditionDiv = document.createElement("div");
    conditionDiv.classList.add("rule-condition");

    if (
      event.target.value === GainMetrics.TURN ||
      event.target.value === GainMetrics.COINS_AVAILABLE
    ) {
      conditionDiv.appendChild(getComparisonElement());
      conditionDiv.appendChild(getNumericalInput());
    } else if (event.target.value === GainMetrics.CARD_IN_DECK_COUNT) {
      conditionDiv.appendChild(getCardInput());
      conditionDiv.appendChild(getComparisonElement());
      conditionDiv.appendChild(getNumericalInput());
    } else if (event.target.value === GainMetrics.CARD_IN_DECK_COUNT) {
      conditionDiv.appendChild(getCardInput());
      conditionDiv.appendChild(getComparisonElement());
      conditionDiv.appendChild(getNumericalInput());
    } else if (event.target.value === GainMetrics.DIFF_IN_DECK) {
      conditionDiv.appendChild(getCardInput());
      conditionDiv.appendChild(getDiffIndicatorElement());
      conditionDiv.appendChild(getCardInput());
      conditionDiv.appendChild(getComparisonElement());
      conditionDiv.appendChild(getNumericalInput());
    } else {
      throw new Error(
        `Unable to handle GainMetrics value '${event.target.value}''`,
      );
    }
    if (!isFirstAdded) {
      conditionDiv.appendChild(getLogicalJoinerElement());
    }
    var insertPosition = 1;
    if (isAChangeToCurrentRule) {
      insertPosition = 2;
    }
    event.target.parentElement.insertBefore(
      conditionDiv,
      event.target.parentElement.children[insertPosition],
    );

    //event.target.disabled = true;
    if (!isAChangeToCurrentRule) {
      event.target.parentElement.insertBefore(
        getAddConditionElement(),
        event.target.parentElement.firstChild,
      );
    }
  });
}

function getAddConditionElement() {
  var addConditionSelect = document.createElement("select");
  addConditionSelect.classList.add("select-condition");
  addConditionSelect.classList.add("add-condition-selector");

  var menuTitle = document.createElement("option");
  menuTitle.value = "add_condition";
  menuTitle.text = "+ Condition";
  menuTitle.style = "display:none";

  addConditionSelect.appendChild(menuTitle);
  for (const gainMetric of Object.values(GainMetrics)) {
    if (gainMetric !== GainMetrics.CAN_GAIN) {
      var option = document.createElement("option");
      option.value = gainMetric;
      option.text = gainMetric;
      addConditionSelect.appendChild(option);
    }
  }

  addConditionListener(addConditionSelect);

  return addConditionSelect;
}

function getCanGainRule(card) {
  var form = document.createElement("form");
  form.classList.add("pure-form");
  var ruleDiv = document.createElement("div");
  ruleDiv.classList.add("pure-g");
  ruleDiv.classList.add("ordered-gain-rule");

  var addConditionSelect = getAddConditionElement();

  /*
  var gainText = document.createElement("button");
  gainText.classList.add("gain-arrow-text");
  gainText.classList.add("pure-button");
  //gainText.classList.add("pure-button-active");
  gainText.innerHTML = "gain ->";
  */
  var gainText = document.createElement("div");
  gainText.classList.add("gain-arrow-text");
  gainText.innerHTML = "gain ->";

  var cardInput = document.createElement("input");
  cardInput.classList.add("card-input");
  cardInput.type = "text";
  cardInput.value = card;

  ruleDiv.appendChild(addConditionSelect);
  ruleDiv.appendChild(gainText);
  ruleDiv.appendChild(cardInput);
  ruleDiv.appendChild(getDeleteRuleIcon());
  ruleDiv.appendChild(getMoveUpRuleIcon());
  ruleDiv.appendChild(getMoveDownRuleIcon());
  ruleDiv.appendChild(getAddRuleIcon());

  form.appendChild(ruleDiv);

  return form;
}

function addCanGainRule(anchor, card) {
  const ruleDiv = getCanGainRule(card);
  anchor.appendChild(ruleDiv);
}

function setupDefaultRules(anchor, player_id) {
  var orderedRulesDiv = document.createElement("div");
  orderedRulesDiv.classList.add("ordered-rules");
  anchor.appendChild(orderedRulesDiv);

  /*var plusButton = document.createElement("button");
  plusButton.addEventListener("click", (event) => {
    addCanGainRule(event.target.parentElement);
  });
  plusButton.innerHTML = "Add Rule";
  orderedRulesDiv.appendChild(plusButton);*/

  addCanGainRule(orderedRulesDiv, "Province");
  addCanGainRule(orderedRulesDiv, "Gold");
  addCanGainRule(orderedRulesDiv, "Silver");
}

function setupConditionGaining() {
  var p1anchor = document.getElementById("player-one-conditions");
  var p2anchor = document.getElementById("player-two-conditions");
  if (!p1anchor || !p2anchor) {
    throw new Error("Could not find player condition anchors.");
  }
  setupDefaultRules(p1anchor, 1);
  setupDefaultRules(p2anchor, 2);
}

setupConditionGaining();
