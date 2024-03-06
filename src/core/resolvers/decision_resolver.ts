import { XOR } from "ts-xor";
import { Effect, EffectAction, EffectPlayer } from "../effects";
import { NodeType, PlayNode } from "../graph";
import { Player } from "../player";
import { Decision, DecisionType } from "../decisions";
import { EffectResolver } from "./effect_resolver";

export class DecisionResolver {
  effectResolver: EffectResolver;
  constructor(effectResolver: EffectResolver) {
    this.effectResolver = effectResolver;
  }

  resolveDecision(player: Player, decisionNode: XOR<Decision, Effect>) {
    if (decisionNode.nodeType != NodeType.DECISION) {
      throw new Error("Attempted to pass an effect into decision resolver");
    }

    const decision = decisionNode as Decision;
    if (decision.decisionType == DecisionType.GAIN_CARD_UP_TO) {
      this.gainCardUptoResolver(player, decision);
    } else if (decision.decisionType == DecisionType.SELECT_EFFECT) {
      player.makeDecision(decision);
    } else if (decision.decisionType == DecisionType.SET_ASIDE_ON_FROM_HAND) {
      player.makeDecision(decision);
    } else {
      throw new Error(
        `Unable to resolve effect of DecisionType ${decision.decisionType}`,
      );
    }
  }

  private gainCardUptoResolver(player: Player, decision: Decision) {
    if (decision.effectPlayer == EffectPlayer.SELF) {
      player.makeDecision(decision);
    } else if (decision.effectPlayer == EffectPlayer.OPP) {
      player.opponent?.makeDecision(decision);
    }
  }
}
