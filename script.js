/*

hexagon directions:

 y           x
 .         .
 . _/ \_/.\_
 .  \_/.\_/ 
 . _/.\_/ \_
 . .\_/ \_/ 
 0 _/ \_/ \_

     ____
    /    \
   /      \
   \      / |
    \____/  | c
   __
   a   b
*/
const a = 4, b = 9, c = 7;

let cells;
let draw = () => {};

document.addEventListener('DOMContentLoaded', e => {
	const canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d');
	ctx.fillStyle = '#6cf';
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1;

	draw = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i in cells) {
			const c = i2coords(i);
			hex(c.x, c.y);
		}
	};

	init();
	go(35, {
		spread: 2,
		one: 3,
		branch: 30
	});

	function hex(x, y) {
		const o = {
			x: x * (a + b) + 500,
			y: y * c * 2 + x * c + 500
		};
		ctx.beginPath();
		ctx.moveTo(o.x, o.y);
		ctx.lineTo(o.x + b, o.y);
		ctx.lineTo(o.x + b + a, o.y - c);
		ctx.lineTo(o.x + b, o.y - 2 * c);
		ctx.lineTo(o.x, o.y - 2 * c);
		ctx.lineTo(o.x - a, o.y - c);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
});

function init() {
	cells = { '0,0': true };
	draw();
}

function iterate(rule) {
	// Loop through all spaces touching a current cell:
	const done = {},
		oldCells = clone(cells);
	for (let cell in cells)
		for (let neighbour of neighbours(cell))
			if (!done[neighbour]) {
				done[neighbour] = true;
				// Count the alive neighbours of each space.
				let aliveCount = 0,
					alive = [[], []];
				for (let d of directions()) {
					const a = oldCells[offset(neighbour, d)],
						b = oldCells[offset(neighbour, d, 2)];
					alive[0].push(!!a);
					alive[1].push(!!(a && b));
					if (a)
						++aliveCount;
				}
				// Add the cell if it matches the rule
				if (rule(aliveCount, alive[0], alive[1]))
					cells[neighbour] = true;
			}
	draw();
}

// eg, go(100, { spread: 20, branch: 1})
function go(n, weights) {
	for (let i = 0; i < n; ++i)
		iterateRandomly(weights);
}

function iterateRandomly(weights) {
	const t = total(weights);
	let r = Math.random() * t;
	for (const rule in weights) {
		r -= weights[rule];
		if (r < 0) {
			console.log('Chose rule ' + rule);
			iterate(rules[rule]);
			break;
		}
	}
}

const rules = {
	spread: c => c >= 1,
	one: c => c == 1,
	branch: (c, a, b) => count(b) == 1
};

function count(arr) {
	let c = 0;
	for (let x of arr)
		if (x)
			++c;
	return c;
}

function total(arr) {
	let c = 0;
	for (let x in arr)
		c += arr[x];
	return c;
}

function* directions(n = 1) {
	yield { x: 0, y: n };
	yield { x: n, y: 0 };
	yield { x: n, y: -n };
	yield { x: 0, y: -n };
	yield { x: -n, y: 0 };
	yield { x: -n, y: n };
}

function offset(start, direction, distance = 1) {
	const c = i2coords(start);
	return coords2i({
		x: c.x + direction.x * distance,
		y: c.y + direction.y * distance
	});
}

function* neighbours(i, n = 1) {
	for (let d of directions())
		yield offset(i, d, n);
}

function i2coords(i) {
	const p = i.split(',').map(x => parseInt(x, 10));
	return { x: p[0], y: p[1] };
}

function coords2i(coords) {
	return `${coords.x},${coords.y}`;
}

function clone(x) {
	return JSON.parse(JSON.stringify(x));
}
