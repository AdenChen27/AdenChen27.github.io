function tprint(...args) {
    var temp = document.getElementById("temp");
    for (var i in args) {
        temp.value += args[i] + " ";
    }
    temp.value += "\n";
}

function get_inline_citations(){
    var text = document.getElementById("essay").value;
    var matches = [];
    const re = /\([A-Za-z&0-9,. ;]+\)/g;

    while ((match = re.exec(text)) != null) {
        matches.push(match);
    }

    matches.sort(function (x, y) {
        x = x[0].toLowerCase();
        y = y[0].toLowerCase();
        if (x < y) {
            return -1;
        } else if (x == y) {
            return 0;
        }
        return 1;
    });

    for (var i in matches) {
        var index = matches[i].index;
        var str = matches[i][0];
        // if is (year) then ...
        tprint(matches[i].index, matches[i][0])
        // separate citation citaing multiple
    }
}


function check() {
    get_inline_citations();
}

