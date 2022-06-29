class Work {
    #index; // int
    // author & date: str
    #author;
    #date;
    constructor(index, author, date) {
        self.#index = index;
        self.#author = author;
        self.#date = date;
    }

    static is_citation(str) {
        return /, .*?\d{4}/.test(str) || str.includes(", n.d.")
    }

    static is_date(str) {
        str = str.trim();
        return str.endsWith("n.d.") || /\d{4}$/.test(str);
    }

    static get_works_from_citation(str, index) {
        for (let work of str.split(";")) {
            let elements = work.split(",");
            elements[0] = elements[0].replace("see also", "").trim();
            elements = elements.map(element => (element.trim()));

            const author = elements[0];
            console.log(author);
            for (let date of elements.slice(1)) {
                console.log(date);
            }
        }
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
    // const re_sub_citation = /(?<=;).*?|.*?(?=;))/g; // get each citation inside a pair of parentheses
    // const a = /(?<=\()(.*?;?)+?.*?(?=\))/g;
    // const re2 = //g; // Narative Citation

    // matches = everything in parentheses
    while ((match = re_inline_citation.exec(text)) != null) {
        matches.push(match);
    }


    // filter: keep if contain ", [date]" or ", n.d."
    matches = matches.filter(match => (Work.is_citation(match[0])));

    for (let match of matches) {
        console.log(match[0].split(";"));
        // separating multiple works
        Work.get_works_from_citation(match[0], match.index)
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

