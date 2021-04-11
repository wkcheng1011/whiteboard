const h = (Math.random() * 360) | 0;
const s = "95%";
const l = "35%";

const c1 = `hsl(${h}, ${s}, ${l})`;
const c2 = `hsl(${(h + 120) % 360}, ${s}, ${l})`;

const c = `linear-gradient(${c1}, ${c2})`;
$(".q-top").css("background-image", c);

const simplemde = new SimpleMDE({
    status: false,
    toolbar: false,
    toolbarTips: false
});
simplemde.togglePreview();

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
    for (const radio of document.querySelectorAll("input[type=radio]")) {
        radio.checked = false;
    }
});