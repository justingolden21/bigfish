// https://codepen.io/nitishkmrk/pen/vaoWye

function drawRipple(evt) {
	if (evt.clientX == 0 && evt.clientY == 0) return; // automated, ignore it
	let node = document.querySelector('.ripple');
	let newNode = node.cloneNode(true);
	newNode.classList.add('animate');
	newNode.style.left = evt.clientX - 4 + 'px';
	newNode.style.top = evt.clientY - 4 + 'px';
	node.parentNode.replaceChild(newNode, node);
}

window.addEventListener('click', drawRipple);
