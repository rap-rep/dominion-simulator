/*
 * Underpins the decision/event directed acylic graph structure for applying game effects
 */

import { Decision } from "./decisions";
import { Effect } from "./effects";
import { DirectedAcyclicGraph } from "typescript-graph";

import type { XOR } from "ts-xor";
import { randomUUID } from "crypto";

export enum NodeType {
  DECISION = "Decision",
  EFFECT = "Effect",
}

export class PlayNode {
  id: string;
  node: XOR<Decision, Effect>;
  children: PlayNode[];

  constructor(node: XOR<Decision, Effect>) {
    this.id = randomUUID();
    this.node = node;
    this.children = [];
  }
}

export class Graph {
  private graph: DirectedAcyclicGraph<PlayNode>;
  private startNode: PlayNode | undefined;

  constructor() {
    this.graph = new DirectedAcyclicGraph<PlayNode>((n: PlayNode) => n.id);
  }

  addNode(node: PlayNode): void {
    this.graph.insert(node);
    if (this.startNode === undefined) {
      this.startNode = node;
    }
  }

  addEdge(node1: PlayNode, node2: PlayNode): void {
    this.graph.addEdge(node1.id, node2.id);
    node1.children.push(node2);
  }

  getStartNode(): PlayNode {
    if (!this.startNode) {
      throw new Error("Tried to access start node, but no nodes exist");
    }
    const startNode = this.graph.getNode(this.startNode?.id);
    if (!startNode) {
      throw new Error(
        `Could not find start node in graph, even though one was created: ${this.startNode}`,
      );
    }
    return startNode;
  }
}
