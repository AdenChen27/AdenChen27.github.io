function generate_qrcode() {
    var text = "https://adenchen27.github.io/func_image/func_image.html?y=";
    for (var i = 0; i < all_graph.length; ++i) {
        text += all_graph[i][2] + ";";
    }
    qrcode.makeCode(text);
}


function get_img() {
    const canvas = document.getElementById("graph");
    const img = canvas.toDataURL("image/png");
    console.log(`<img src='${img}'/>`);
    window.open('...').document.write(`<p>right click to download:</p><img src='${img}'/>`);
}
