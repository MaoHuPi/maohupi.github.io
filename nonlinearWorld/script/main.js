const DEBUG = false;
const bgc = [0, 0, 255];

const cvs = document.getElementById('view'),
	ctx = cvs.getContext('2d');
[cvs.width, cvs.height] = [500, 500];

let scene = [
	{
		points: [
			[-0.5, 10, -10],
			[-0.5, 10, 10],
			[-0.5, -10, -10]
		],
		color: [255, 0, 0],
		opacity: 0.8
	},
	{
		points: [
			[-0.5, -10, 10],
			[-0.5, -10, -10],
			[-0.5, 10, 10]
		],
		color: [0, 255, 0],
		opacity: 0.8
	}
]

let [xm, ym] = [cvs.width / 2, cvs.height / 2];
let [px, py, pz] = [0, 0, 0];
let [theta1, theta2] = [0, 0];
let alpha = 1;

function render() {
	for (let xi = 0; xi < cvs.width; xi++) {
		for (let yi = 0; yi < cvs.width; yi++) {
			let colorList = [];

			let [s1, c1] = [Math.sin(theta1), Math.cos(theta1)],
				[s2, c2] = [Math.sin(theta2), Math.cos(theta2)];
			let r = Math.sqrt((xi - xm) ** 2 + (yi - ym) ** 2);
			let [dx, dy, dz] = [
				-1,
				alpha * (xi - xm),
				alpha * (ym - yi)
			]
			let [drd_x, drd_y, drd_z] = [-dy * s2 + dz * s1 * c2, dy * c2 + dz * s1 * s2, dz * c1],
				[d_x, d_y, d_z] = [-c1 * c2, -c1 * s2, s1];

			function convergeDistance(xi, yi, [A, B, C], [px, py, pz], [theta1, theta2], alpha) {
				let [ax, ay, az] = A,
					[bx, by, bz] = B,
					[cx, cy, cz] = C;
				let [abac_x, abac_y, abac_z] = [
					(by - ay) * (cz - az) - (cy - ay) * (bz - az),
					(bz - az) * (cx - ax) - (cz - az) * (bx - ax),
					(bx - ax) * (cy - ay) - (cx - ax) * (by - ay)
				]

				// step 1: get "d"
				let alpha_drd = (abac_x * drd_x + abac_y * drd_y + abac_z * drd_z),
					alpha_d = (abac_x * d_x + abac_y * d_y + abac_z * d_z),
					alpha_c = (abac_x * (px - ax) + abac_y * (py - ay) + abac_z * (pz - az));
				let f = d => d * r ** d * alpha_drd + d * alpha_d + alpha_c,
					f_d = d => alpha_drd * r ** d * (1 + d * Math.log/*ln*/(r)) + alpha_d;

				let d;
				if (r == 0) {
					d = -alpha_c / alpha_d;
				} else {
					let xn = 0;
					for (let i = 0; i < 3; i++) { xn = xn - f(xn) / f_d(xn); }
					d = xn;
				}
				if (DEBUG) console.log(d);

				// step 2: find converge point
				let drd = d * r ** d;
				let [x, y, z] = [px + d * d_x + drd * drd_x, py + d * d_y + drd * drd_y, pz + d * d_z + drd * drd_z];
				if (DEBUG) console.log(x, y, z);

				//step 3: calculate u, v
				let u, v;
				let [div_x, div_y, div_z] = [
					(cy - ay) * (bx - ax) - (by - ay) * (cx - ax),
					(cz - az) * (by - ay) - (bz - az) * (cy - ay),
					(cx - ax) * (bz - az) - (bx - ax) * (cz - az)
				];
				if (div_x !== 0) {
					v = (bx - ax - by + ay) * (x - ax) / div_x;
				} else if (div_y !== 0) {
					v = (by - ay - bz + az) * (y - ay) / div_y;
				} else if (div_z !== 0) {
					v = (bz - az - bx + ax) * (z - az) / div_z;
				}
				if (bx - ax !== 0) {
					u = ((x - ax) - v * (cx - ax)) / (bx - ax);
				} else if (by - ay !== 0) {
					u = ((y - ay) - v * (cy - ay)) / (by - ay);
				} else if (bz - az !== 0) {
					u = ((z - az) - v * (cz - az)) / (bz - az);
				}
				if (DEBUG) console.log(u, v);

				// step 4: filter
				if (DEBUG) console.log((u >= 0 && v >= 0 && u + v <= 1 && d >= 0) ? d : undefined);
				return (u >= 0 && v >= 0 && u + v <= 1 && d >= 0) ? d : undefined;
			}
			for (let tri of scene) {
				let d = convergeDistance(xi, yi, tri.points, [px, py, pz], [theta1, theta2], alpha);
				if (Number.isFinite(d)) {
					colorList.push({ d: d, color: tri.color, opacity: tri.opacity });
				}
			}
			// step 5: set color
			if (colorList.length > 0) {
				colorList = colorList.sort((a, b) => a.d - b.d);
				let color = [0, 0, 0];
				let opacity = 1;
				for (let data of colorList) {
					color[0] += data.color[0] * opacity * data.opacity;
					color[1] += data.color[1] * opacity * data.opacity;
					color[2] += data.color[2] * opacity * data.opacity;
					opacity = opacity * (1 - data.opacity);
					if (opacity == 0) break;
				}
				color[0] += bgc[0] * opacity;
				color[1] += bgc[1] * opacity;
				color[2] += bgc[2] * opacity;
				ctx.fillStyle = `rgb(${color.join(',')})`; // temp
			} else {
				ctx.fillStyle = `rgb(${bgc.join(',')})`;
			}
			ctx.fillRect(xi, yi, 1, 1);
		}
	}
}

let deltaTheta1 = Math.PI / 4;
let deltaTheta2 = Math.PI / 4;
let deltaFB = 0.1;
let deltaLR = 10;
let deltaUD = 10;
document.addEventListener('keydown', event => {
	switch (event.key) {
		case 'ArrowUp':
			theta1 += deltaTheta1;
			break;
		case 'ArrowDown':
			theta1 -= deltaTheta1;
			break;
		case 'ArrowLeft':
			theta2 += deltaTheta2;
			break;
		case 'ArrowRight':
			theta2 -= deltaTheta2;
			break;
		case 'w':
			px -= Math.cos(theta2) * deltaFB;
			py -= Math.sin(theta2) * deltaFB;
			break;
		case 's':
			px += Math.cos(theta2) * deltaFB;
			py += Math.sin(theta2) * deltaFB;
			break;
		case 'a':
			px += Math.sin(theta2) * deltaLR;
			py -= Math.cos(theta2) * deltaLR;
			break;
		case 'd':
			px -= Math.sin(theta2) * deltaLR;
			py += Math.cos(theta2) * deltaLR;
			break;
		case 'q':
			pz += deltaUD;
			break;
		case 'z':
			pz -= deltaUD;
			break;
	}
	render();
});

render();