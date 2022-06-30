/**
 * TODO:
 * check_date: check (yyyy, month day)/(yyyy, month) format
 * */
class Work {
    constructor(author, date, author_i, date_i) {
        // author & date in String
        // pre-`trim()` (might have spaces & stuff like "see also: ")
        this.author = author;
        this.date = date;
        // start index of author & date in essay
        this.author_i = author_i;
        this.date_i = date_i;
    }

    static is_citation(str) {
        // includes date
        return /, .*?\d{4}/.test(str) || str.includes(", n.d.")
    }

    static is_date(str) {
        str = str.trim();
        return str.endsWith("n.d.") || /\d{4}$/.test(str);
    }

    check_date() {
        // check citation date format
        // return error as string, if any
        // return false if no error found
        let raw_date = this.date.trim(); // date after `trim`
        if (raw_date === "n.d." || /^\d{4}[a-z]?$/.test(raw_date)) {
            return false;
        }
        return "date error";
    }

    check() {
        // check citation of work
        // stor citation error at `self.error`
        this.error = this.check_date();
    }

    static get_works_from_citation(str, index) {
        // str: String of a Parenthetical Citation (without the partentheses)
        // index: start index of str in essay
        // return an Array of Work
        let works = Array();

        for (let work of str.split(";")) {
            let elements = work.split(",");
            
            // elements[0] = elements[0].replace("see also", "").trim();
            // elements = elements.map(element => (element.trim()));

            const author = elements[0];
            const author_index = index;
            
            index += author.length + 1;

            for (let date of elements.slice(1)) {
                // console.log(author, date, index, author_index);
                works.push(new Work(author, date, author_index, index, false));
                index += date.length + 1;
            }
        }
        return works;
    }
}


function is_initials(str) {
    // return boolean
    // initials: e.g. "A. P."
    for (let c of str.replaceAll(".", "").split(" ")) {
        if (c.length > 1) {
            return false;
        }
    }
    return true;
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
    let works = Array();
    while ((match = re_inline_citation.exec(text)) != null) {
        if (Work.is_citation(match[0])) {
            works.push(...Work.get_works_from_citation(match[0], match.index));
        }
        matches.push(match);
    }
    // for (let work of works) {
    //     console.log(work);
    // }

    // // sort in alphabatic order
    // matches.sort(function (x, y) {
    //     x = x[0].toLowerCase();
    //     y = y[0].toLowerCase();
    //     if (x < y) {
    //         return -1;
    //     } else if (x == y) {
    //         return 0;
    //     }
    //     return 1;
    // });
    return works;
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
    const re = /^(.+?)\s\((.+?)\)/mg;
    while ((match = re.exec(references)) != null) {
        const authors = match[1];
        const date = match[2];
        for (let author of authors.split(",")) {
            author = author.replace("&", "").trim();
            // is initials
            if (is_initials(author)) {
                continue;
            }
            console.log(author);
        }
        console.log("\n");
        // console.log(match.length);
    }
}


function check() {
    for (let work of get_inline_citations()) {
        work.check();
        console.log(work);
    }
}

