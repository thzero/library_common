import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Queue from '../utility/list/queue.js';
import PriorityQueue from '../utility/list/priorityQueue.js';
import DoubleLinkedList from '../utility/list/doubleLinked.js';

describe('Queue', () => {
	it('is FIFO', () => {
		const queue = new Queue();
		for (const value of ['a', 'b', 'c']) queue.enqueue(value);
		assert.deepEqual([queue.dequeue(), queue.dequeue(), queue.dequeue()], ['a', 'b', 'c']);
	});

	it('reports length and emptiness consistently through the compaction cycle', () => {
		const queue = new Queue();
		assert.equal(queue.isEmpty(), true);
		assert.equal(queue.length(), 0);

		for (let i = 0; i < 10; i++) queue.enqueue(i);
		// dequeue one at a time; the internal offset compaction must never make
		// isEmpty() and length() disagree
		for (let i = 0; i < 10; i++) {
			assert.equal(queue.isEmpty(), queue.length() === 0, `after ${i} dequeues`);
			queue.dequeue();
		}
		assert.equal(queue.isEmpty(), true);
		assert.equal(queue.length(), 0);
	});

	it('returns undefined when empty', () => {
		assert.equal(new Queue().dequeue(), undefined);
		assert.equal(new Queue().peek(), undefined);
	});
});

describe('PriorityQueue', () => {
	it('dequeues in ascending priority order', () => {
		const queue = new PriorityQueue();
		for (const priority of [5, 1, 4, 2, 3]) queue.enqueue({ priority });
		const order = [];
		while (queue.length() > 0) order.push(queue.dequeue().priority);
		assert.deepEqual(order, [1, 2, 3, 4, 5]);
	});

	it('handles a single element', () => {
		const queue = new PriorityQueue();
		queue.enqueue({ priority: 1 });
		assert.equal(queue.dequeue().priority, 1);
		assert.equal(queue.length(), 0);
	});

	// Known defect, not yet fixed: dequeue() has no empty guard, so _swap(0, -1)
	// runs and leaves a stray "-1" property behind. It does return undefined, so
	// this documents the current behaviour rather than asserting it is correct.
	it('returns undefined when empty (but see the missing empty guard)', () => {
		const queue = new PriorityQueue();
		assert.equal(queue.dequeue(), undefined);
		assert.equal(queue.length(), 0);
	});
});

describe('DoubleLinkedList', () => {
	it('adds, finds and removes', () => {
		const list = new DoubleLinkedList();
		list.add('a', 1);
		list.add('b', 2);
		assert.equal(list.length, 2);
		assert.equal(list.has('a'), true);
		assert.equal(list.get('b').proxy, 2);
		list.remove('a');
		assert.equal(list.length, 1);
		assert.equal(list.has('a'), false);
	});

	it('cycles the pointer forward and back', () => {
		const list = new DoubleLinkedList();
		for (const id of ['a', 'b', 'c']) list.add(id, id);
		assert.equal(list.pointer.processId, 'a');
		assert.equal(list.incrementPointer().processId, 'b');
		assert.equal(list.incrementPointer().processId, 'c');
		assert.equal(list.incrementPointer().processId, 'a', 'wraps to head');
		assert.equal(list.decrementPointer().processId, 'c', 'wraps to tail');
	});

	// Known defect, not yet fixed: add() with an existing id overwrites the map
	// entry but leaves the old node linked, so it can never be unlinked again.
	it('leaks a node when the same id is added twice (known defect)', () => {
		const list = new DoubleLinkedList();
		list.add('a', 1);
		list.add('a', 2);
		assert.equal(list.length, 1, 'the map dedupes');
		list.remove('a');
		assert.equal(list.length, 0);
		// the orphaned first node is still linked from head; walking the chain
		// still reaches it even though the list reports empty
		assert.notEqual(list.pointer, null, 'orphaned node remains reachable');
	});
});
