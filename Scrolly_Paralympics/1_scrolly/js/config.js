
// Sucht die IDs aller Elemente mit der Klasse `scrolly` raus und initialisiert ein Scrollytelling
Array.from(document.querySelectorAll(".scrolly")).forEach(scrolly => {
	init(scrolly.id)
})

function handleStepEnter(response, images, figure) {
	let img = figure.querySelector("img");
	let src = images[response.index];

	// remove/restore any previously moved or cloned sketch in this figure
	const prev = figure.querySelector('.sketch-clone, .sketch-moved');
	if (prev) {
		if (prev.classList.contains('sketch-moved') && prev._placeholder) {
			prev._placeholder.parentNode.insertBefore(prev, prev._placeholder);
			prev._placeholder.remove();
			delete prev._placeholder;
			prev.classList.remove('sketch-moved');
		} else {
			prev.remove();
		}
	}

	if (src && src.startsWith('#')) {
		if (img) img.style.display = 'none';
		const orig = document.querySelector(src);
		if (orig) {
			// move the original element into the figure so the p5 canvas stays attached
			if (orig.parentNode !== figure) {
				if (!orig._placeholder) {
					const ph = document.createElement('div');
					ph.className = 'sketch-placeholder';
					orig.parentNode.insertBefore(ph, orig);
					orig._placeholder = ph;
				}
				figure.appendChild(orig);
				orig.classList.add('sketch-moved');
				// ensure the moved element is visible and redraw the p5 canvas
				try {
					orig.style.display = '';
				} catch (e) {}
				try { window.dispatchEvent(new Event('resize')); } catch(e){}
				try { if (typeof redraw === 'function') redraw(); } catch(e){}
			}
		}
	} else {
		if (img) {
			img.style.display = '';
			img.src = src || '';
		}
	}

	console.log("Step", response.index, "entered the stage. The direction is", response.direction);
}

function handleStepExit(response) {
	// restore any moved sketch when exiting a step (in case another step expects an image)
	let figure = document.querySelector(`#${response.element.closest('.scrolly')?.id} .figure`);
	if (figure) {
		const moved = figure.querySelector('.sketch-moved');
		if (moved && moved._placeholder) {
			moved._placeholder.parentNode.insertBefore(moved, moved._placeholder);
			moved._placeholder.remove();
			delete moved._placeholder;
			moved.classList.remove('sketch-moved');
		}
		const img = figure.querySelector('img');
		if (img) img.style.display = '';
	}

	console.log("Step", response.index, "exited the stage. The direction is", response.direction)
}


// generic window resize listener event
function handleResize(figure, scroller) {


	// 2. tell scrollama to update new element dimensions
	scroller.resize();
}

function init(id) {

	// initialize the scrollama
	let scroller = scrollama();


	// Make a list of all the images shown during the scrolling
	// we get all the `.step`-elements and make a list of image paths from `data-img`
	let images = [... document.querySelectorAll(`#${id} .step`)].map(d => d.getAttribute("data-img"))
	let figure = document.querySelector(`#${id} .figure`)


	// force a resize on load to ensure proper dimensions are sent to scrollama
	handleResize(figure, scroller);

	scroller
		.setup({
			step: `#${id} .step`,
			offset: 1,
			debug: false
		})
		.onStepEnter((response) => {handleStepEnter(response, images, figure)})
		.onStepExit((response)  => { handleStepExit(response)})
}
