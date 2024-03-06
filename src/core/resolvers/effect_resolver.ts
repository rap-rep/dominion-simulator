import { XOR } from "ts-xor";
import { Card } from "../card";
import { Effect, EffectAction, EffectPlayer } from "../effects";
import { NodeType, PlayNode } from "../graph";
import { Player } from "../player";
import { Decision } from "../decisions";
import { DecisionResolver } from "./decision_resolver";
import { PlayerHelper } from "../helpers/default_decisions";
import { DurationPhase } from "../card_types";

export class EffectResolver {
  decisionResolver: DecisionResolver;
  constructor() {
    this.decisionResolver = new DecisionResolver(this);
  }

  playCard(player: Player, card: Card) {
    player.inPlay.push(card);

    const node = card.playGraph().getStartNode();
    if (node) {
      this.resolveNode(player, node.node);
      this.playChildrenNodes(player, card, node);
    }
  }

  playDuration(player: Player, card: Card) {
    card.durationPhase = DurationPhase.PREPARED_FOR_CLEANUP;
    const durationPlayGraph = card.durationPlayGraph();
    if (!durationPlayGraph) {
      throw new Error(
        `Trying to play a duration for a card that has no duration play graph: ${card.name}`,
      );
    }
    const node = durationPlayGraph.getStartNode();
    if (node) {
      this.resolveNode(player, node.node);
      this.playChildrenNodes(player, card, node);
    }
  }

  private playChildrenNodes(player: Player, card: Card, node: PlayNode) {
    const childrenNodes = node.children;
    if (childrenNodes) {
      for (const node of childrenNodes) {
        this.resolveNode(player, node.node);
        this.playChildrenNodes(player, card, node);
      }
    }
  }

  resolveNode(player: Player, node: XOR<Decision, Effect>) {
    if (node && node.nodeType == NodeType.EFFECT) {
      this.resolveEffect(player, node);
    } else if (node && node.nodeType == NodeType.DECISION) {
      this.decisionResolver.resolveDecision(player, node);
    } else {
      throw new Error(`Unknown node type '${node.nodeType}', can not resolve!`);
    }
  }

  gainCard(player: Player, card_name: string): Card {
    const gainedCard = player.game.kingdom.getTopOrError(card_name);
    player.game.kingdom.removeFromTop(gainedCard);

    if (!this.handEffectGainResolver(player, gainedCard)) {
      player.discard.push(gainedCard);
    }

    return gainedCard;
  }

  resolveEffect(player: Player, effectNode: XOR<Decision, Effect>) {
    if (effectNode.nodeType != NodeType.EFFECT) {
      throw new Error("Attempted to pass a decision into effect resolver");
    }

    const effect = effectNode as Effect;
    if (effect.action == EffectAction.PLUS_COIN) {
      this.plusCoinResolver(player, effect);
    } else if (effect.action === EffectAction.DRAW_CARD) {
      this.drawCardResolver(player, effect);
    } else if (effect.action === EffectAction.DRAW_TO) {
      this.drawToResolver(player, effect);
    } else if (effect.action === EffectAction.PLUS_ACTION) {
      this.plusActionResolver(player, effect);
    } else if (effect.action === EffectAction.PLUS_BUY) {
      this.plusBuyResolver(player, effect);
    } else if (effect.action === EffectAction.GAIN_FROM_SUPPLY) {
      this.gainFromSupply(player, effect);
    } else if (effect.action === EffectAction.TYPE_BONUSES) {
      this.awardTypeBonuses(player, effect);
    } else if (effect.action === EffectAction.IN_HAND_FROM_SET_ASIDE) {
      this.putInHandFromSetAside(player, effect);
    } else {
      throw new Error(
        `Unable to resolve effect of EffectAction type ${effect.action}`,
      );
    }
  }

  private gainFromSupply(player: Player, effect: Effect) {
    const cardToGain = effect.reference?.result as string;
    const gainedCard = this.gainCard(player, cardToGain);
    effect.result = gainedCard;
  }

  private awardTypeBonuses(player: Player, effect: Effect) {
    const typeCard = effect.reference?.result as Card;
    const fromCard = effect.fromCard;

    const bonusMap = fromCard.typeBonusMap();
    if (bonusMap.size < 1) {
      throw new Error(
        `Trying to award type bonuses using a card '${effect.fromCard.name}' with none`,
      );
    }

    for (const type of bonusMap.keys()) {
      if (typeCard.types.includes(type)) {
        const effect = bonusMap.get(type);
        if (!effect) {
          throw new Error("Effect not defined");
        }
        this.resolveEffect(player, effect);
      }
    }
  }

  private plusCoinResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;

    if (effect.effectPlayer == EffectPlayer.SELF) {
      player.coins += amount;
    }
  }

  private plusActionResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;
    if (effect.effectPlayer == EffectPlayer.SELF) {
      player.actions += amount;
    }
  }

  private plusBuyResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;
    if (effect.effectPlayer == EffectPlayer.SELF) {
      player.buys += amount;
    }
  }

  private drawCardResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;

    for (let i = 0; i < amount; i++) {
      if (effect.effectPlayer == EffectPlayer.SELF) {
        player.drawCard();
      } else {
        player.opponent?.drawCard();
      }
    }
  }

  private drawToResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;
    const handSize = PlayerHelper.countHandSize(player);

    const toDraw = Math.max(0, amount - handSize);

    for (let i = 0; i < toDraw; i++) {
      if (effect.effectPlayer == EffectPlayer.SELF) {
        player.drawCard();
      } else {
        player.opponent?.drawCard();
      }
    }
  }

  private handEffectGainResolver(player: Player, card: Card): boolean {
    // Returns true if the gained card was moved and should no longer be placed in discard
    for (const handCardStack of player.hand.values()) {
      if (handCardStack.length > 0) {
        const inHandCard = handCardStack[0];
        const decision = inHandCard.inHandWhileGaining(card);
        if (decision) {
          this.decisionResolver.resolveDecision(player, decision);
          if (decision.result === EffectAction.TOPDECK || EffectAction.TRASH) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private putInHandFromSetAside(player: Player, effect: Effect): boolean {
    const fromCard = effect.fromCard;
    const setAsideCards = fromCard.setAsideDecision?.result as Card[];
    for (const setAsideCard of setAsideCards) {
      player.addCardToHand(setAsideCard);
    }
    if (fromCard.setAsideDecision) {
      fromCard.setAsideDecision.result = undefined;
    }

    return false;
  }
}
