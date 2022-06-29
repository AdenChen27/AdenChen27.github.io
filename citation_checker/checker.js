class work {
    // index: int
    // author & date: str
    constructor(index, author, date) {
        self.index = index;
        self.author = author;
        self.date = author;
    }
}


function tprint(...args) {
    var temp = document.getElementById("temp");
    for (var i in args) {
        temp.value += args[i] + " ";
    }
    temp.value += "\n";
}

function get_inline_citations(){
    var matches = [];
    const text = document.getElementById("essay").value;
    const re_inline_citation = /(?<=\().*?(?=\))/g; // Parenthetical Citations
    const re_sub_citation = /(?<=;).*?|.*?(?=;))/g; // get each citation inside a pair of parentheses
    // const a = /(?<=\()(.*?;?)+?.*?(?=\))/g;
    // const re2 = //g; // Narative Citation

    // matches = everything in parentheses
    while ((match = re_inline_citation.exec(text)) != null) {
        matches.push(match);
    }


    // filter: keep if contain ", [date]" or ", n.d."
    matches = matches.filter(match => (
        /, .*?\d{4}/.test(match[0]) || match[0].includes(", n.d.")
    ));

    for (let match of matches) {
        var index = match.index;
        var str = match[0];
        // separating multiple works
        console.log(str.split(";"));
        for (let work of str.split(";")) {
            console.log(work.trim());

        }
        // tprint(str);

        // if is (year) then ...
    };

    // sort in alphabatic order
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
}


function test() {
    // // var date = /\([0-9]{4}[a-z]?\)/g;
    // var date = /\(/g;
    // // const references = document.getElementById("references").value.split("\n");
    // references.forEach(function (reference) {
    //     const date_i = reference.search(date);
    //     // console.log(reference.substring(0, date_i));
    //     // console.log(reference);
    //     // console.log();
    //     // tprint(reference.substring(0, date_i));
    //     var names = reference.substring(0, date_i).split(",");
    //     names = names.filter(name => !(name.includes("."))); // Digest of Education Statistics Table 226.10.
    //     console.log(names);
    //     tprint(names);
    //     // console.log(
    // });

    const references = document.getElementById("references").value;
    const re = /(.+?)\s\((.+?)\)/g;
    while ((match = re.exec(references)) != null) {
        // matches.push(match);
        console.log(match);
        console.log(match.length);
    }
}


function check() {
    get_inline_citations();
}

