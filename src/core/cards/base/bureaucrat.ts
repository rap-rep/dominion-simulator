import { Graph, PlayNode } from "@src/core/graph";
import { Card } from "../../card";
import { CardType, DeprecatedCardHeuristicType } from "@src/core/card_types";
import { Effect, EffectType, EffectPlayer } from "@src/core/effects";
import {
  HeuristicType,
  TerminalType,
} from "@src/core/logic/card_selector_types";
import { Decision, DecisionType } from "@src/core/decisions";
import { Silver } from "../basic/silver";

const Name = "Bureaucrat";

export class Bureaucrat extends Card {
  constructor() {
    super(Name, [CardType.ACTION]);
  }

  public static get NAME(): string {
    return Name;
  }

  static factoryGenerator(): Bureaucrat {
    return new Bureaucrat();
  }

  deprecatedHeuristicType(): DeprecatedCardHeuristicType {
    return DeprecatedCardHeuristicType.TERMINAL_PAYLOAD;
  }

  playGraph(): Graph {
    const graph = new Graph();

    const gainReference = new Decision(
      DecisionType.PLACEHOLDER,
      EffectPlayer.SELF,
    );
    gainReference.result = Silver.NAME;

    const gainSilver = new PlayNode(
      new Effect(
        EffectType.GAIN_FROM_SUPPLY_TO_DECK,
        EffectPlayer.SELF,
        undefined,
        gainReference,
        this,
      ),
    );
    const topdeckDecision = new Decision(
      DecisionType.TOPDECK_VICTORY,
      EffectPlayer.OPP,
      1,
      this,
    );
    const oppTopdeck = new PlayNode(topdeckDecision);
    const oppTopdeckApply = new PlayNode(
      new Effect(
        EffectType.TOPDECK,
        EffectPlayer.OPP,
        undefined,
        topdeckDecision,
        this,
      ),
    );

    graph.addNode(gainSilver);
    graph.addNode(oppTopdeck);
    graph.addNode(oppTopdeckApply);

    graph.addEdge(gainSilver, oppTopdeck);
    graph.addEdge(oppTopdeck, oppTopdeckApply);
    return graph;
  }

  cost(): number {
    return 4;
  }

  economyHeuristicValue(): number {
    return 0;
  }

  heuristicType(): HeuristicType {
    return HeuristicType.PAYLOAD_GAINER;
  }

  terminalType(): TerminalType {
    return TerminalType.TERMINAL;
  }
}
