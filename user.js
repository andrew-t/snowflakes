Snowflake.onInit(() => {

	const canvas = document.getElementById('canvas'),
		snowflake = canvas.snowflake;

	const weights = {
		spread: 0,
		one: 2,
		two: 1,
		branch: 45,
		'pretty-spread': 1,
		'safe-spread': 2
	};

	Object.keys(snowflake.rules).forEach(rule => {
		const slider = document.getElementById(rule),
			step = document.getElementById(rule + '-once');
		slider.value = weights[rule];
		slider.addEventListener('change', e => {
			weights[rule] = parseInt(slider.value, 10);
			e.preventDefault();
		});
		step.addEventListener('click', e => {
			snowflake.iterate(rules[rule]);
			e.preventDefault();
		});
	});

	document.getElementById('reset')
		.addEventListener('click', e => {
			console.log('Resetting');
			snowflake.reset();
			e.preventDefault();
		});

	document.getElementById('undo')
		.addEventListener('click', e => {
			console.log('Undoing');
			snowflake.undo();
			e.preventDefault();
		});

	document.getElementById('iterate-once')
		.addEventListener('click', e => {
			console.log('Iterating randomly');
			snowflake.iterateRandomly(weights);
			e.preventDefault();
		});

	document.getElementById('iterate-many')
		.addEventListener('click', e => {
			console.log('Animating...', weights);
			e.preventDefault();
			snowflake.reset();
			let i = document.getElementById('iterations').value;
			const delay = (100 - document.getElementById('speed').value) * 10;
			if (document.getElementById('spread-first').checked)
				snowflake.iterate(snowflake.rules.spread);
			frame();

			function frame() {
				console.log('Animating a frame');
				try {
					snowflake.iterateRandomly(weights);
				} catch (e) {
					console.error(e);
				}
				if (--i)
					setTimeout(frame, delay);
			}
		});

});
