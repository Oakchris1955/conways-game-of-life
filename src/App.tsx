import React, { useEffect, useRef } from 'react';

/** Function obtained from https://stackoverflow.com/a/50371323 */
function contains(arr: any[], element: any) {
	return arr.some(elem =>{
		return JSON.stringify(element) === JSON.stringify(elem);
	});
}

function App() {
	let cells: [number, number][] = [];
	let xOffset = 0,
		yOffset = 0;
	let scale = 100;

	let proceedGeneration = false;

	let lastMouseDown = 0;

	function updateGeneration() {
		const cells_to_check: [number, number][] = [];
		for (const cell of cells) {
			for (let x_offset = -1; x_offset <= 1; x_offset++) {
				for (let y_offset = -1; y_offset <= 1; y_offset++) {
					let cell_to_check: [number, number] = [cell[0] + x_offset, cell[1] + y_offset];
					if (!contains(cells_to_check, cell_to_check)) {
						cells_to_check.push(cell_to_check)
					}
				}
			}
		}
		
		const new_cells: [number, number][] = [];

		for (const cell of cells_to_check) {
			let neighbours = 0;
			let cell_is_alive = contains(cells, cell);
			for (let x_offset = -1; x_offset <= 1; x_offset++) {
				for (let y_offset = -1; y_offset <= 1; y_offset++) {
					let neighbour: [number, number] = [cell[0] + x_offset, cell[1] + y_offset];
					if (!(neighbour[0] === cell[0] && neighbour[1] === cell[1])) {
						if (contains(cells, neighbour)) {
							neighbours++
						}
					}
				}
			}

			switch (neighbours) {
				case 3:
					new_cells.push(cell)
					break;
				case 2:
					if (cell_is_alive) {
						new_cells.push(cell)
					}
			}
		}

		cells = new_cells;
	}

	function updateCanvas(canvas: HTMLCanvasElement, shouldProceed: boolean = true) {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "black";
		for (const cell of cells) {
			if (cell[0] >= -xOffset / scale - 1 && cell[0] < -xOffset / scale + 10 &&
				cell[1] >= -yOffset / scale - 1 && cell[1] < -yOffset / scale + 10) {
				ctx.fillRect(cell[0] * scale + xOffset, cell[1] * scale + yOffset, scale, scale)
			}
		}

		if (proceedGeneration && shouldProceed) {
			updateGeneration()
		}
	}

	function getClickCoords(canvas: HTMLCanvasElement, clickEvent: MouseEvent): [number, number] {
		const x = (clickEvent.offsetX) / canvas.offsetWidth * canvas.width - xOffset;
		const y = (clickEvent.offsetY) / canvas.offsetHeight * canvas.width - yOffset;
		return [x, y]
	}

	function handleMove(event: MouseEvent) {
		if (event.buttons === 1) {
			xOffset += event.movementX
			yOffset += event.movementY
			console.log(xOffset, yOffset)
		}
	}

	function handleMouseDown() {
		lastMouseDown = Date.now();
	}

	function handleClick(canvas: HTMLCanvasElement, clickEvent: MouseEvent) {
		if (Date.now() - lastMouseDown < 100) {
			const clickCoords: [number, number] = getClickCoords(canvas, clickEvent);
			const canvasCoords: [number, number] = 
			[
				Math.floor(clickCoords[0] / scale),
				Math.floor(clickCoords[1] / scale)
			];
			console.log(`Click at pixel (${clickCoords[0]}, ${clickCoords[1]})`);
			// Check if current coordinates are unique in cells (this way no duplicates are created)
			if (!contains(cells, canvasCoords)) {
				cells.push(canvasCoords)	
			} else {
				cells = cells.filter(cell => !(cell[0] === canvasCoords[0] && cell[1] === canvasCoords[1]))
			}
			// Lastly, update canvas without proceeding a generation
			updateCanvas(canvas, false)
		}
	}

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			canvas.addEventListener('click', (event) => {handleClick(canvas, event)})
			canvas.addEventListener('mousedown', handleMouseDown)
			canvas.addEventListener('mousemove', handleMove)
			setInterval(() => updateCanvas(canvas), 50);
		}
		console.log("useEffect hook just got executed")
	});

	return (
		<main style={{width: "100%", height: "100vh", display: "flex", flexDirection: "column",alignItems: "center", justifyContent: "center"}}>
			<canvas ref={canvasRef} style={{borderStyle: "solid", width: "80vw", height: "80vw"}} width={1000} height={1000}/>
			<br/>
			<button onClick={() => {proceedGeneration = !proceedGeneration}}>Start</button>
		</main>
	);
}

export default App;
