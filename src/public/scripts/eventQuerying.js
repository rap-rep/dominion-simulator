const EventQueryType = {
  WINS: "wins",
  VP: "vp",
  DRAW_CARD: "cards drawn",
};

const ANY_CARD = "All";

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

function getEventCardInputElements() {
  var cardInput = document.createElement("input");
  cardInput.classList.add("medium-card-input");
  const inputId = guidGenerator();
  cardInput.id = inputId;
  cardInput.type = "text";
  cardInput.value = ANY_CARD;

  var label = document.createElement("label");
  label.classList.add("event-with-label");
  label.for = inputId;
  label.innerHTML = " with ";

  return [label, cardInput];
}

function getByTurnInputElements() {
  var numberInput = document.createElement("input");
  numberInput.classList.add("number-input");

  const inputId = guidGenerator();
  numberInput.id = inputId;
  numberInput.type = "number";
  numberInput.value = 99;

  var label = document.createElement("label");
  label.classList.add("by-turn-label");
  label.for = inputId;
  label.innerHTML = " by turn ";

  return [label, numberInput];
}

function addQueryListener(addQuerySelect) {
  addQuerySelect.addEventListener("change", (event) => {
    const parent = event.target.parentElement;
    parent.replaceChildren(event.target);
    if (event.target.value === EventQueryType.DRAW_CARD) {
      const cardInputElements = getEventCardInputElements();
      const cardLabel = cardInputElements[0];
      const cardInput = cardInputElements[1];
      parent.appendChild(cardInput);
      parent.insertBefore(cardLabel, cardInput);

      const turnInputElements = getByTurnInputElements();
      const turnLabel = turnInputElements[0];
      const turnInput = turnInputElements[1];
      parent.appendChild(turnInput);
      parent.insertBefore(turnLabel, turnInput);
    } else if (event.target.value === EventQueryType.WINS) {
      const turnInputElements = getByTurnInputElements();
      const turnLabel = turnInputElements[0];
      const turnInput = turnInputElements[1];
      parent.appendChild(turnInput);
      parent.insertBefore(turnLabel, turnInput);
    } else if (event.target.value === EventQueryType.VP) {
      const cardInputElements = getEventCardInputElements();
      const cardLabel = cardInputElements[0];
      const cardInput = cardInputElements[1];
      parent.appendChild(cardInput);
      parent.insertBefore(cardLabel, cardInput);
    } else {
      throw new Error(
        `Unable to handle EventQueryType value '${event.target.value}''`,
      );
    }

    // event.target.disabled = true;
  });
}

function getAddQueryElement() {
  var form = document.createElement("form");
  form.classList.add("pure-form");
  form.classList.add("result-query-form");

  var formDiv = document.createElement("div");
  formDiv.classList.add("pure-g");
  formDiv.classList.add("result-query-form-div");

  var addQuerySelect = document.createElement("select");
  addQuerySelect.classList.add("select-query");

  for (const eventQueryType of Object.values(EventQueryType)) {
    var option = document.createElement("option");
    option.value = eventQueryType;
    option.text = eventQueryType;
    addQuerySelect.appendChild(option);
  }
  addQueryListener(addQuerySelect);
  formDiv.appendChild(addQuerySelect);

  const turnInputElements = getByTurnInputElements();
  const turnLabel = turnInputElements[0];
  const turnInput = turnInputElements[1];
  formDiv.appendChild(turnInput);
  formDiv.insertBefore(turnLabel, turnInput);

  form.appendChild(formDiv);
  return form;
}

function setupDefaultQueries(anchor) {
  const queryElem = getAddQueryElement();
  anchor.appendChild(queryElem);
}

function setupEventQueries() {
  var anchor = document.getElementById("event-queries");
  setupDefaultQueries(anchor);

  var addButton = document.getElementById("add-event-query");
  addButton.addEventListener("click", (event) => {
    event.preventDefault();
    anchor.appendChild(getAddQueryElement());
  });
}

setupEventQueries();
