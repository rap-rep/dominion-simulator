import { NullCard } from "@src/core/cards/basic/null_card";
import { Province } from "@src/core/cards/basic/province";
import { Silver } from "@src/core/cards/basic/silver";
import { Peddler } from "@src/core/cards/prosperity/peddler";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";
import { ConditionSetList, GainMetric, GainMetricFrontend, ThresholdType } from "@src/core/logic/ordered_condition_gaining";

describe("Default action selection", () => {
  const game = new Game();
  it("Returns null if no action available", () => {
    expect(PlayerHelper.selectAnyAction(game.p1)?.name).toBe(NullCard.NAME);
  });
});

describe("Default action selection", () => {
  const game = new Game();
  game.p1.addCardToHand(new Peddler());
  it("Returns an action if one is available", () => {
    expect(PlayerHelper.selectAnyAction(game.p1)?.name).toBe(Peddler.NAME);
  });
});


describe("Rule input mapping", () => {
  const input: ConditionSetList = {
    conditionSetList: 
      [{conditionSet: [{gainMetric: GainMetricFrontend.CAN_GAIN}], cardToGain: Province.NAME}]
  }
  const coins = 8;
  const game = new Game({p1gainRules: input, logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.DEBUG});
  game.currentPlayer.coins = coins;
  game.currentPlayer.playBuyPhase();
  it("Maps a simple can gain rule", () => {
    expect(game.currentPlayer.selector.conditionSets.length).toBe(1);
    expect(game.currentPlayer.selector.conditionSets[0].set[0].metric).toBe(GainMetric.CAN_GAIN);
    expect(game.currentPlayer.discard[0]?.name).toBe(Province.NAME);
  });
});

describe("Rule input mapping", () => {
  const input: ConditionSetList = {
    conditionSetList: 
      [{conditionSet: [{gainMetric: GainMetricFrontend.CARD_IN_DECK_COUNT, comparator: ThresholdType.GREATER_OR_EQUAL, amount: 1, cardList: [Silver.NAME]}], cardToGain: Province.NAME}]
  }
  const coins = 8;
  const game = new Game({p1gainRules: input, logMode: LogMode.CONSOLE_LOG, logLevel: LogLevel.DEBUG});
  game.currentPlayer.coins = coins;
  game.currentPlayer.effectResolver.gainCard(game.currentPlayer, Silver.NAME);
  game.currentPlayer.playBuyPhase();
  const conditionSet = game.currentPlayer.selector.conditionSets[0].set[0];
  it("does gain with a card count in deck rule", () => {
    expect(game.currentPlayer.selector.conditionSets.length).toBe(1);
    expect(conditionSet.metric).toBe(GainMetric.CARD_IN_DECK_COUNT);
    expect(conditionSet.card_references).toEqual([Silver.NAME]);
    expect(conditionSet.thresholdType).toEqual(ThresholdType.GREATER_OR_EQUAL);
    expect(conditionSet.threshold).toEqual(1);
    expect(game.currentPlayer.discard[1]?.name).toBe(Province.NAME);
  });
});