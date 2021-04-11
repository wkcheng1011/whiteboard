const h = (Math.random() * 360) | 0;
const s = "95%";
const l = "35%";

const c1 = `hsl(${h}, ${s}, ${l})`;
const c2 = `hsl(${(h + 120) % 360}, ${s}, ${l})`;

const c = `linear-gradient(${c1}, ${c2})`;
$(".q-top").css("background-image", c);