class Snowflake {
	constructor(options = {}) {
		/*	  ____
			 /    \
			/      \
			\      / |
			 \____/  | c
			__
			a   b   */
		this.b = options.size || 9;
		this.a = this.b / 2;
		this.c = this.a * Math.sqrt(3);
		if (this.canvas = options.canvas) {
			this.ctx = this.canvas.getContext('2d');
			this.ctx.fillStyle = options.fillStyle || '#6cf';
			if (options.strokeStyle) {
				this._stroke = true;
				this.ctx.strokeStyle = options.strokeStyle;
				this.ctx.lineWidth = options.lineWidth || 1;
			}
		}
		this.reset();
	}

	reset() {
		this.history = [{ '0,0': true }];
		this.frame = 0;
	}

	get cells() {
		return this.history[this.frame];
	}

	startNewFrame() {
		const newFrame = Snowflake.clone(this.cells);
		this.history.length = ++this.frame;
		this.history.push(newFrame);
		return newFrame;
	}

	undo() {
		if (this.frame > 0) {
			--this.frame;
			this.draw();
		}
	}

	draw() {
		if (this.ctx) {
			this.ctx.clearRect(0, 0,
				this.canvas.width, this.canvas.height);
			for (let i in this.cells) {
				const c = Snowflake.i2coords(i);
				this.hex(c.x, c.y);
			}
		}
	}

	hex(x, y) { /*
		y           x
		.         .
		. _/ \_/.\_
		.  \_/.\_/ 
		. _/.\_/ \_
		. .\_/ \_/ 
		0 _/ \_/ \_     */
		const o = {
			x: x * (this.a + this.b) + this.canvas.width / 2,
			y: y * this.c * 2 +
				x * this.c + this.canvas.height / 2
		};
		this.ctx.beginPath();
		this.ctx.moveTo(o.x, o.y);
		this.ctx.lineTo(o.x + this.b, o.y);
		this.ctx.lineTo(o.x + this.b + this.a, o.y - this.c);
		this.ctx.lineTo(o.x + this.b, o.y - 2 * this.c);
		this.ctx.lineTo(o.x, o.y - 2 * this.c);
		this.ctx.lineTo(o.x - this.a, o.y - this.c);
		this.ctx.closePath();
		this.ctx.fill();
		if (this._stroke)
			this.ctx.stroke();
	}

	iterate(rule) {
		// Loop through all spaces touching a current cell:
		const done = {},
			oldCells = this.cells;
		this.startNewFrame();
		for (let cell in this.cells)
			for (let neighbour of Snowflake.neighbours(cell))
				if (!done[neighbour]) {
					done[neighbour] = true;
					// Count the alive neighbours of each space.
					let aliveCount = 0,
						alive = [[], []];
					for (let d of Snowflake.directions) {
						const a = oldCells[Snowflake.offset(neighbour, d)],
							b = oldCells[Snowflake.offset(neighbour, d, 2)];
						alive[0].push(!!a);
						alive[1].push(!!(a && b));
						if (a)
							++aliveCount;
					}
					// Add the cell if it matches the rule
					if (rule(aliveCount, alive[0], alive[1]))
						this.cells[neighbour] = true;
				}
		this.draw();
	}

	iterateRandomly(weights) {
		const t = Snowflake.total(weights);
		let r = Math.random() * t;
		for (const rule in weights) {
			r -= weights[rule];
			if (r < 0) {
				console.log('Chose rule ' + rule);
				this.iterate(this.rules[rule]);
				break;
			}
		}
	}

	static count(arr) {
		let c = 0;
		for (let x of arr)
			if (x)
				++c;
		return c;
	}

	static total(arr) {
		let c = 0;
		for (let x in arr)
			c += arr[x];
		return c;
	}

	static offset(start, direction, distance = 1) {
		const c = Snowflake.i2coords(start);
		return Snowflake.coords2i({
			x: c.x + direction.x * distance,
			y: c.y + direction.y * distance
		});
	}

	static* neighbours(i, n = 1) {
		for (let d of Snowflake.directions)
			yield Snowflake.offset(i, d, n);
	}

	static i2coords(i) {
		const p = i.split(',').map(x => parseInt(x, 10));
		return { x: p[0], y: p[1] };
	}

	static coords2i(coords) {
		return `${coords.x},${coords.y}`;
	}

	static clone(x) {
		return JSON.parse(JSON.stringify(x));
	}

	static init(canvas) {
		console.log(`Initialising canvas "${canvas.id}"`);
		canvas.snowflake = new Snowflake({
			canvas,
			size: parseFloat(canvas.getAttribute('data-size'))
		});
	}
}

// No idea if there's a syntax for a static getter generator?
Object.defineProperty(Snowflake, 'directions', {
	get: function*() {
		yield { x: 0, y: 1 };
		yield { x: 1, y: 0 };
		yield { x: 1, y: -1 };
		yield { x: 0, y: -1 };
		yield { x: -1, y: 0 };
		yield { x: -1, y: 1 };
	}
});

Snowflake.prototype.rules = {
	spread: c => c >= 1,
	'pretty-spread': c => (c >= 1 && c < 4),
	one: c => c == 1,
	two: c => c == 2,
	branch: (c, a, b) => Snowflake.count(b) == 1,
	'safe-spread': (c, a) => {
		if (c < 1 || c > 3)
			return false;
		let on = a[0],
			changes = 0;
		for (let curr of a)
			if (a != on) {
				on = a;
				++changes;
			}
		return changes < 2;
	}		
};

Snowflake._initCbs = [];
Snowflake.onInit = cb => {
	if (Snowflake._initCbs)
		Snowflake._initCbs.push(cb);
	else
		cb();
};
document.addEventListener('DOMContentLoaded', e => {
	const canvases = document.getElementsByClassName('snowflake-canvas');
	console.log(`Initialising ${canvases.length} canvases`);
	for (let i = 0; i < canvases.length; ++i)
		Snowflake.init(canvases[i]);
	Snowflake._initCbs.forEach(cb => cb());
	delete Snowflake._initCbs;
});
