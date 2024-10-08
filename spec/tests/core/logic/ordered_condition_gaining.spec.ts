import { NULL_CARD_NAME } from "@src/core/card";
import { Smithy } from "@src/core/cards/base/smithy";
import { Village } from "@src/core/cards/base/village";
import { Copper } from "@src/core/cards/basic/copper";
import { Duchy } from "@src/core/cards/basic/duchy";
import { Province } from "@src/core/cards/basic/province";
import { Silver } from "@src/core/cards/basic/silver";
import { Game } from "@src/core/game";
import {
  LogicalJoiner,
  GainMetric,
  OrderedConditionGainSelector,
  OrderedGainCondition,
  ThresholdType,
} from "@src/core/logic/ordered_condition_gaining";

describe("A single rule to buy silver with more than 3", () => {
  const game = new Game();
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.COINS_AVAILABLE,
      ThresholdType.GREATER_OR_EQUAL,
      3,
    ),
    Silver.NAME,
  );
  game.p1.coins = 3;
  const card = gainRules.getGainName(game.p1, 3);
  it("selects silver when more than 3 is avialable", () => {
    expect(card).toEqual(Silver.NAME);
  });
});

describe("A single rule to buy silver with more than 3", () => {
  const game = new Game();
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.COINS_AVAILABLE,
      ThresholdType.GREATER_OR_EQUAL,
      3,
    ),
    Silver.NAME,
  );
  game.p1.coins = 2;
  const card = gainRules.getGainName(game.p1, 2);
  it("selects nothing when 2 is available", () => {
    expect(card).toEqual(NULL_CARD_NAME);
  });
});

describe("A single rule with multiple conditionals", () => {
  const game = new Game();
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addConditionSet(
    [
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        10,
      ),
      new OrderedGainCondition(
        GainMetric.COINS_AVAILABLE,
        ThresholdType.GREATER_OR_EQUAL,
        5,
        LogicalJoiner.AND,
      ),
    ],
    Duchy.NAME,
  );
  game.p1.coins = 5;
  const card = gainRules.getGainName(game.p1, 5);
  it("selects nothing when coin is available but turn is too early", () => {
    expect(card).toEqual(NULL_CARD_NAME);
  });
});

describe("A single rule with multiple conditionals", () => {
  const game = new Game();
  game.turn = 15;
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addConditionSet(
    [
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        10,
      ),
      new OrderedGainCondition(
        GainMetric.COINS_AVAILABLE,
        ThresholdType.GREATER_OR_EQUAL,
        5,
        LogicalJoiner.AND,
      ),
    ],
    Duchy.NAME,
  );
  game.p1.coins = 5;
  const card = gainRules.getGainName(game.p1, 5);
  it("selects Duchy when 5 is available and turn is late enough", () => {
    expect(card).toEqual(Duchy.NAME);
  });
});

describe("A rule with multiple matching conditionals", () => {
  const game = new Game();
  game.turn = 15;
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addConditionSet(
    [
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        10,
      ),
      new OrderedGainCondition(
        GainMetric.COINS_AVAILABLE,
        ThresholdType.GREATER_OR_EQUAL,
        5,
        LogicalJoiner.AND,
      ),
    ],
    Duchy.NAME,
  );
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.COINS_AVAILABLE,
      ThresholdType.GREATER_OR_EQUAL,
      0,
    ),
    Copper.NAME,
  );
  game.p1.coins = 5;
  const card = gainRules.getGainName(game.p1, 5);
  it("select the first matching one", () => {
    expect(card).toEqual(Duchy.NAME);
  });
});

describe("A rule with multiple conditionals", () => {
  const game = new Game();
  game.turn = 2;
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addConditionSet(
    [
      new OrderedGainCondition(
        GainMetric.TURN,
        ThresholdType.GREATER_OR_EQUAL,
        10,
      ),
    ],
    Duchy.NAME,
  );
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.COINS_AVAILABLE,
      ThresholdType.GREATER_OR_EQUAL,
      0,
    ),
    Copper.NAME,
  );
  game.p1.coins = 3;
  const card = gainRules.getGainName(game.p1, 3);
  it("select the first rule that evaluates to true", () => {
    expect(card).toEqual(Copper.NAME);
  });
});

describe("Buy rule", () => {
  const game = new Game();
  const gainRules = new OrderedConditionGainSelector(game.currentPlayer);
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.TURN,
      ThresholdType.GREATER_OR_EQUAL,
      1,
    ),
    Province.NAME,
  );
  game.p1.coins = 2;
  const card = gainRules.getGainName(game.p1, 2);
  it("does not lead to buying a card that can not be bought", () => {
    expect(card).toEqual(NULL_CARD_NAME);
  });
});

describe("Buy rule based on cards in deck", () => {
  const game = new Game();
  const coins = 3;
  const gainRules = new OrderedConditionGainSelector(game.p1);
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.CARD_IN_DECK_COUNT,
      ThresholdType.GREATER_OR_EQUAL,
      7,
      undefined,
      undefined,
      undefined,
      [Copper.NAME],
    ),
    Silver.NAME,
  );
  game.p1.coins = coins;
  const card = gainRules.getGainName(game.p1, coins);
  it("buys a silver when the required amount of copper is in the deck", () => {
    expect(card).toEqual(Silver.NAME);
  });
});

describe("Buy rule based on cards in deck", () => {
  const game = new Game();
  const coins = 3;
  const gainRules = new OrderedConditionGainSelector(game.p1);
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.CARD_IN_DECK_COUNT,
      ThresholdType.GREATER_OR_EQUAL,
      77,
      undefined,
      undefined,
      undefined,
      [Copper.NAME],
    ),
    Silver.NAME,
  );
  game.p1.coins = coins;
  const card = gainRules.getGainName(game.p1, coins);
  it("buys nothing if required amount of copper is not in the deck", () => {
    expect(card).toEqual(NULL_CARD_NAME);
  });
});

describe("Buy rule based on cards diff", () => {
  const game = new Game();
  const coins = 3;
  const gainRules = new OrderedConditionGainSelector(game.p1);
  game.p1.effectResolver.gainCard(game.p1, Village.NAME);
  game.p1.effectResolver.gainCard(game.p1, Smithy.NAME);
  // Buy Village if Village - Smithy >= 1
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.CARD_IN_DECK_COUNT,
      ThresholdType.GREATER_OR_EQUAL,
      1,
      undefined,
      undefined,
      undefined,
      [Village.NAME, Smithy.NAME],
    ),
    Village.NAME,
  );
  game.p1.coins = coins;
  const card = gainRules.getGainName(game.p1, coins);
  it("does not buy the card if the diff is not great enough", () => {
    expect(card).toEqual(NULL_CARD_NAME);
  });
});

describe("Buy rule based on cards diff", () => {
  const game = new Game();
  const coins = 3;
  const gainRules = new OrderedConditionGainSelector(game.p1);
  for (let i = 0; i < 2; i++) {
    game.p1.effectResolver.gainCard(game.p1, Village.NAME);
  }
  game.p1.effectResolver.gainCard(game.p1, Smithy.NAME);
  // Buy Village if Village - Smithy >= 1
  gainRules.addCondition(
    new OrderedGainCondition(
      GainMetric.CARD_IN_DECK_COUNT,
      ThresholdType.GREATER_OR_EQUAL,
      1,
      undefined,
      undefined,
      undefined,
      [Village.NAME, Smithy.NAME],
    ),
    Village.NAME,
  );
  game.p1.coins = coins;
  const card = gainRules.getGainName(game.p1, coins);
  it("does buy a card if the diff is great enough", () => {
    expect(card).toEqual(Village.NAME);
  });
});
