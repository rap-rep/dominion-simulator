import { SimpleEnginePlayer } from "@src/core/bot_players/simple_engine_player";
import { Village } from "@src/core/cards/base/village";
import { Estate } from "@src/core/cards/basic/estate";
import { Silver } from "@src/core/cards/basic/silver";
import { Groom } from "@src/core/cards/menagerie/groom";
import { Horse } from "@src/core/cards/menagerie/horse";
import { Wharf } from "@src/core/cards/seaside/wharf";
import { Decision } from "@src/core/decisions";
import { Game } from "@src/core/game";
import { PlayerHelper } from "@src/core/helpers/player_helper";
import { LogLevel, LogMode } from "@src/core/logging/game_log";
import { GainMetric, GainMetricFrontend, OrderedGainCondition, ThresholdType } from "@src/core/logic/ordered_condition_gaining";
import { Player } from "@src/core/player";

describe("Groom gains a treasure", () => {
  const game = new Game();
  game.p1.hand = new Map();
  game.p1.addCardToHand(new Groom());
  game.p1.playActionPhase();
  it("a silver with default buy rules gains two silvers", () => {
    expect(game.p1.discard.length).toEqual(2);
    expect(game.p1.discard[0].name).toEqual(Silver.NAME);
    expect(game.p1.discard[1].name).toEqual(Silver.NAME);
  });
});

describe("Groom gains an Estate", () => {
    const game = new Game();
    // based on default buy rule for late turn estates
    game.turn = 20;
    game.p1.addCardToHand(new Groom());
    game.p1.playActionPhase();
    it("receives the Estate, card draw & action", () => {
      expect(game.p1.discard.length).toEqual(1);
      expect(game.p1.discard[0].name).toEqual(Estate.NAME);
      expect(game.p1.actions).toEqual(1);
      expect(PlayerHelper.countHandSize(game.p1)).toEqual(5);
    });
  });


  describe("Groom gains a Village", () => {
    const game = new Game({logLevel: LogLevel.INFO, logMode: LogMode.CONSOLE_LOG});

    // Simplified version of the API type used to create buy rules
    type ConditionSetList = {
        conditionSetList: [
          {
            conditionSet: [
              {
                gainMetric: string;
              },
            ];
            cardToGain: string;
          },
        ];
      };

    const conditions: ConditionSetList = {
        conditionSetList: [
            { 
                conditionSet: [{gainMetric: GainMetricFrontend.CAN_GAIN}],
                cardToGain: Village.NAME}
        ]
    }

    game.p1 = new Player("Village Idiot", game, conditions);
    // based on buy rule to buy villages if draw in deck
    game.p1.addCardToHand(new Groom(), true);
    game.p1.playActionPhase();
    it("receives the Village and Horse", () => {
      expect(game.p1.discard.length).toEqual(2);
      expect(game.p1.discard[0].name).toEqual(Village.NAME);
      expect(game.p1.discard[1].name).toEqual(Horse.NAME);
      expect(game.p1.actions).toEqual(0);
      expect(PlayerHelper.countHandSize(game.p1)).toEqual(5);
    });
  });
