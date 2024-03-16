

const GainMetrics = {
    CAN_GAIN: "can gain",
    COINS_AVAILABLE: "coins available",
    TURN: "turn",
    CARD_IN_DECK_COUNT: "# cards in deck",
}


function addCanGainRule(anchor, card){
    var cardDiv = document.createElement("div", {classList: "pure-g ordered-gain-rule"});
    //cardDiv.classList.add("pure-g");

    var ruleForm = document.createElement("form", {classList: "pure-form"});
    var gainText = document.createTextNode("gain ")
    var cardInput = document.createElement("input", {type: "gainCard", placeholder:"Province"} )
    cardInput.value = card;
    cardDiv.appendChild(ruleForm);
    cardDiv.appendChild(gainText);
    cardDiv.appendChild(cardInput);
    //anchor.appendChild(cardDiv);
    anchor.insertBefore(cardDiv, anchor.lastChild)
}

function setupDefaultRules(anchor, player_id){
    var orderedRulesDiv = document.createElement("div", id=`ordered-rules-${player_id}`);
    anchor.appendChild(orderedRulesDiv);

    var plusButton = document.createElement("button");
    plusButton.addEventListener("click", (event) => {
        addCanGainRule(event.target.parentElement);
    });
    plusButton.innerHTML = "Add Rule";
    orderedRulesDiv.appendChild(plusButton);
    
    addCanGainRule(orderedRulesDiv, 'Province');
    addCanGainRule(orderedRulesDiv, 'Gold');
    addCanGainRule(orderedRulesDiv, 'Silver');

}

function setupConditionGaining() {
    var p1anchor = document.getElementById("player-one-conditions");
    var p2anchor = document.getElementById("player-two-conditions");
    if (!p1anchor || !p2anchor){
        throw new Error("Could not find player condition anchors.");
    }
    setupDefaultRules(p1anchor, 1);
    setupDefaultRules(p2anchor, 2);
}

setupConditionGaining();