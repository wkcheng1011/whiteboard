for (const author of document.querySelectorAll(".author")) {
    const seed = [...author.textContent].map(a => a.charCodeAt(0)).reduce((a, b) => a+b);
    author.style.color = "#" + ((seed * 0xDEADBEEF % 0xFFFFFF) | 0).toString(16);
}