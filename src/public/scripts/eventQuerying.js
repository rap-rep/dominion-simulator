const EventQueryType = {
  DRAW_CARD: "cards drawn",
};

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
  cardInput.value = "All";

  var label = document.createElement("label");
  label.for = inputId;
  label.innerHTML = " by ";

  return [label, cardInput];
}

function getEventNumericalInputElements() {
  var numberInput = document.createElement("input");
  numberInput.classList.add("number-input");

  const inputId = guidGenerator();
  numberInput.id = inputId;
  numberInput.type = "number";
  numberInput.value = 99;

  var label = document.createElement("label");
  label.for = inputId;
  label.innerHTML = " by turn ";

  return [label, numberInput];
}

function addQueryListener(addQuerySelect) {
  addQuerySelect.addEventListener("change", (event) => {
    const parent = event.target.parentElement;
    if (event.target.value === EventQueryType.DRAW_CARD) {
      const cardInputElements = getEventCardInputElements();
      const cardLabel = cardInputElements[0];
      const cardInput = cardInputElements[1];
      parent.appendChild(cardInput);
      parent.insertBefore(cardLabel, cardInput);

      const turnInputElements = getEventNumericalInputElements();
      const turnLabel = turnInputElements[0];
      const turnInput = turnInputElements[1];
      parent.appendChild(turnInput);
      parent.insertBefore(turnLabel, turnInput);
    } else {
      throw new Error(
        `Unable to handle EventQueryType value '${event.target.value}''`,
      );
    }

    event.target.disabled = true;
  });
}

function getAddQueryElement() {
  var form = document.createElement("form");
  form.classList.add("pure-form");
  form.classList.add("result-query-form");

  var addQuerySelect = document.createElement("select");
  addQuerySelect.classList.add("select-query");

  var menuTitle = document.createElement("option");
  menuTitle.value = "+ Result query";
  menuTitle.text = "+ Result query";
  menuTitle.style = "display:none";

  addQuerySelect.appendChild(menuTitle);
  for (const eventQueryType of Object.values(EventQueryType)) {
    var option = document.createElement("option");
    option.value = eventQueryType;
    option.text = eventQueryType;
    addQuerySelect.appendChild(option);
  }

  addQueryListener(addQuerySelect);

  form.appendChild(addQuerySelect);

  return form;
}

function setupDefaultQueries(anchor) {
  const queryElem = getAddQueryElement();
  anchor.appendChild(queryElem);
}

function setupEventQueries() {
  var anchor = document.getElementById("event-queries");
  setupDefaultQueries(anchor);
}

setupEventQueries();
