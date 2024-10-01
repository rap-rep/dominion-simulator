import { XOR } from "ts-xor";
import { Card } from "../card";
import { Effect, EffectType, EffectPlayer } from "../effects";
import { NodeType, PlayNode } from "../graph";
import { Player } from "../player";
import { Decision } from "../decisions";
import { DecisionResolver } from "./decision_resolver";
import { PlayerHelper } from "../helpers/player_helper";
import { DurationPhase } from "../card_types";
import { EventRecordBuilder } from "../logging/event_record_builders";
import e from "express";

export class EffectResolver {
  decisionResolver: DecisionResolver;
  constructor() {
    this.decisionResolver = new DecisionResolver(this);
  }

  playCard(player: Player, card: Card) {
    player.game.gamelog.logCardPlay(card, player.name);
    player.inPlay.push(card);

    const node = card.playGraph().getStartNode();
    if (node) {
      this.resolveNode(player, node.node);
      this.playChildrenNodes(player, card, node);
    }
  }

  playDuration(player: Player, card: Card) {
    player.game.gamelog.logDuration(player, card);
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
    // TODO this does not currently support selecting the order that decisions are made in
    // This is a pretty major unimplemented aspect of Dominion; need to add a decision buffer/selector
    const gainedCard = player.game.kingdom.getTopOrError(card_name);
    player.game.kingdom.removeFromTop(gainedCard);
    player.game.gamelog.logGain(player, gainedCard);

    this.whenGainResolver(player, gainedCard);

    const handEffectResolution = this.handEffectGainResolver(
      player,
      gainedCard,
    );
    if (!handEffectResolution) {
      player.addToAllCards(gainedCard);
      player.discard.push(gainedCard);
    } else if (handEffectResolution === EffectType.TOPDECK) {
      player.addToAllCards(gainedCard);
    } else if (handEffectResolution === EffectType.TRASH_FROM_HAND) {
      // no player record-keeping needed
    } else {
      throw new Error(
        `handEffectGainResolver returned unsupported EffectAction '${handEffectResolution}'`,
      );
    }

    return gainedCard;
  }

  resolveEffect(player: Player, effectNode: XOR<Decision, Effect>) {
    if (effectNode.nodeType != NodeType.EFFECT) {
      throw new Error("Attempted to pass a decision into effect resolver");
    }

    const effect = effectNode as Effect;
    if (effect.effectType == EffectType.PLUS_COIN) {
      this.plusCoinResolver(player, effect);
    } else if (effect.effectType === EffectType.DRAW_CARD) {
      this.drawCardResolver(player, effect);
    } else if (effect.effectType === EffectType.TRASH_FROM_HAND) {
      this.trashFromHandResolver(player, effect);
    } else if (effect.effectType === EffectType.DISCARD_FROM_HAND) {
      this.discardFromHandResolver(player, effect);
    } else if (effect.effectType === EffectType.DRAW_TO) {
      this.drawToResolver(player, effect);
    } else if (effect.effectType === EffectType.PLUS_ACTION) {
      this.plusActionResolver(player, effect);
    } else if (effect.effectType === EffectType.PLUS_BUY) {
      this.plusBuyResolver(player, effect);
    } else if (effect.effectType === EffectType.GAIN_FROM_SUPPLY) {
      this.gainFromSupply(player, effect);
    } else if (effect.effectType === EffectType.TYPE_BONUSES) {
      this.awardTypeBonuses(player, effect);
    } else if (effect.effectType === EffectType.IN_HAND_FROM_SET_ASIDE) {
      this.putInHandFromSetAside(player, effect);
    } else if (effect.effectType === EffectType.EXILE_DISCARD) {
      this.discardExileResolver(player, effect);
    } else if (effect.effectType === EffectType.EXILE_FROM_PLAY) {
      this.exileFromPlayResolver(player, effect);
    } else {
      throw new Error(
        `Unable to resolve effect of EffectAction type ${effect.effectType}`,
      );
    }
    player.game.eventlog.logEffect(effect);
  }

  private gainFromSupply(player: Player, effect: Effect) {
    const cardToGain = effect.reference?.result as string;
    const gainedCard = this.gainCard(player, cardToGain);
    effect.result = gainedCard;
    effect.affects = gainedCard;
  }

  private awardTypeBonuses(player: Player, effect: Effect) {
    const typeCard = effect.reference?.result as Card;
    const fromCard = effect.fromCard;

    effect.affects = typeCard;

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

  private whenGainResolver(player: Player, card: Card) {
    const node = card.whenGainedGraph.getStartNode();
    if (node) {
      this.resolveNode(player, node.node);
      this.playChildrenNodes(player, card, node);
    }
  }

  private drawCardResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;

    for (let i = 0; i < amount; i++) {
      let cardDrawn = undefined;
      if (effect.effectPlayer == EffectPlayer.SELF) {
        cardDrawn = player.drawCard();
        if (cardDrawn) {
          player.game.eventQueryManager.recordEvent(
            EventRecordBuilder.draw(player, effect.fromCard, cardDrawn),
          );
        }
      } else {
        if (player.opponent) {
          cardDrawn = player.opponent.drawCard() || undefined;
          if (cardDrawn) {
            player.game.eventQueryManager.recordEvent(
              EventRecordBuilder.draw(
                player.opponent,
                effect.fromCard,
                cardDrawn,
              ),
            );
          }
        }
      }
    }
  }

  private trashFromHandResolver(player: Player, effect: Effect) {
    if (effect.effectPlayer !== EffectPlayer.SELF) {
      throw new Error("Trashing opponent's hand not supported");
    }

    const toTrash = effect.reference?.result as Card[];
    if (!toTrash) {
      throw new Error(
        "Cards to trash not defined (empty list should be specified if trashing none)",
      );
    }

    for (const card of toTrash) {
      player.removeCardFromHand(card, true);
      player.game.kingdom.trashCard(card);
      player.game.gamelog.log(`${player.name} trashes a ${card.name}`);
      player.game.eventQueryManager.recordEvent(
        EventRecordBuilder.trash(player, effect.fromCard, card),
      );
    }

    if (effect.reference) {
      effect.reference.result = undefined;
    }
  }

  private discardFromHandResolver(player: Player, effect: Effect) {
    const toDiscard = effect.reference?.result as Card[];
    if (!toDiscard) {
      throw new Error(
        "Cards to discard not defined (empty list should be specified if discarding none)",
      );
    }

    if (effect.effectPlayer === EffectPlayer.OPP && player.opponent) {
      player = player.opponent;
    }

    for (const card of toDiscard) {
      player.removeCardFromHand(card);
      player.discard.push(card);
      player.game.gamelog.log(`${player.name} discards a ${card.name}`);
      // TODO Record discard event via eventQueryManager
    }

    if (effect.reference) {
      effect.reference.result = undefined;
    }
  }

  private drawToResolver(player: Player, effect: Effect) {
    const amount = effect.affects as number;
    const handSize = PlayerHelper.countHandSize(player);

    const toDraw = Math.max(0, amount - handSize);

    for (let i = 0; i < toDraw; i++) {
      if (effect.effectPlayer == EffectPlayer.SELF) {
        const cardDrawn = player.drawCard();
        if (cardDrawn) {
          player.game.eventQueryManager.recordEvent(
            EventRecordBuilder.draw(player, effect.fromCard, cardDrawn),
          );
        }
      } else {
        if (player.opponent) {
          player.opponent?.drawCard();
          const cardDrawn = player.opponent?.drawCard();
          if (cardDrawn) {
            player.game.eventQueryManager.recordEvent(
              EventRecordBuilder.draw(
                player.opponent,
                effect.fromCard,
                cardDrawn,
              ),
            );
          }
        }
      }
    }
  }

  private handEffectGainResolver(
    player: Player,
    card: Card,
  ): EffectType | undefined {
    // Walks through the cards in hand looking for any decisions that need to happen while gaining a card
    // Returns the action type taken on the card, or undefined if none taken
    for (const handCardStack of player.hand.values()) {
      if (handCardStack.length > 0) {
        const inHandCard = handCardStack[0];
        const decision = inHandCard.whenInHandWhileGaining(card);
        if (decision) {
          this.decisionResolver.resolveDecision(player, decision);
          if (
            decision.result === EffectType.TOPDECK ||
            EffectType.TRASH_FROM_HAND
          ) {
            return decision.result as EffectType;
          }
        }
      }
    }
  }

  private exileFromPlayResolver(player: Player, effect: Effect): void {
    player.inPlay = player.inPlay.filter(item => item !== effect.fromCard);
    this.addToExile(player, effect.fromCard);
  }

  private addToExile(player: Player, card: Card){
    const exileStack = player.exile.get(card.name);
    if (exileStack){
      exileStack.push(card);
    }
    else{
      player.exile.set(card.name, [card]);
    }
  }

  private discardExileResolver(player: Player, exileEffect: Effect): void {
    const discardFromExile = exileEffect.reference?.result as boolean;
    if (discardFromExile) {
      const cardName = exileEffect.fromCard.name;
      const exiledCardStack = player.exile.get(cardName);
      if (exiledCardStack) {
        for (const card of exiledCardStack) {
          player.discard.push(card);
        }
        player.exile.delete(cardName);
      }
    }
  }

  private putInHandFromSetAside(player: Player, effect: Effect): boolean {
    const fromCard = effect.fromCard;
    const setAsideCards = fromCard.setAsideDecision?.result as Card[];
    effect.affects = setAsideCards;
    for (const setAsideCard of setAsideCards) {
      player.addCardToHand(setAsideCard);
    }
    if (fromCard.setAsideDecision) {
      fromCard.setAsideDecision.result = undefined;
    }

    return false;
  }
}
