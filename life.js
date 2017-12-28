Snowflake.onInit(() => {
	const canvas = document.getElementById('canvas'),
		snowflake = canvas.snowflake;

	iterateLife = () => {
		snowflake.iterate(
			c => c == 3,
			c => c < 2 || c > 3);
	};

	document.getElementById('iterate-life')
		.addEventListener('click', iterateLife);
	document.getElementById('animate-life')
		.addEventListener('click', animateLife);
	document.getElementById('stop-life')
		.addEventListener('click', stopLife);

	function iterateLife() {
		snowflake.iterate(
			c => c == 2,
			c => c < 1 || c > 2);
	}

	let animation;

	function animateLife() {
		const delay = (100 - document.getElementById('speed').value) * 10;
		animation = setInterval(iterateLife, delay);
	}

	function stopLife() {
		clearInterval(animation);
	}
});
