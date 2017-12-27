document.addEventListener('DOMContentLoaded', e => {

	const weights = {
		spread: 0,
		one: 4,
		branch: 25,
		'pretty-spread': 2
	};

	Object.keys(rules).forEach(rule => {
		const slider = document.getElementById(rule),
			step = document.getElementById(rule + '-once');
		slider.value = weights[rule];
		slider.addEventListener('change', e => {
			weights[rule] = slider.value;
			e.preventDefault();
		});
		step.addEventListener('click', e => {
			iterate(rules[rule]);
			e.preventDefault();
		});
	});

	document.getElementById('reset')
		.addEventListener('click', e => {
			console.log('Resetting');
			init();
			e.preventDefault();
		});

	document.getElementById('iterate-once')
		.addEventListener('click', e => {
			console.log('Iterating randomly');
			iterateRandomly(weights);
			e.preventDefault();
		});

	document.getElementById('iterate-many')
		.addEventListener('click', e => {
			console.log('Animating...');
			e.preventDefault();
			init();
			let i = document.getElementById('iterations').value;
			const delay = (100 - document.getElementById('speed').value) * 10;
			if (document.getElementById('spread-first').checked)
				iterate(rules.spread);
			frame();

			function frame() {
				console.log('Animating a frame');
				iterateRandomly(weights);
				if (--i)
					setTimeout(frame, delay);
			}
		});

});
