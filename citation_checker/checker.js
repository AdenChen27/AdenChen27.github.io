/**
 * TODO:
 * check_date: check (yyyy, month day)/(yyyy, month) format
 * */
class InlineWork {
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
        // return an Array of InlineWork
        let works = new Array();

        for (let work of str.split(";")) {
            let elements = work.split(",");
            
            // elements[0] = elements[0].replace("see also", "").trim();
            // elements = elements.map(element => (element.trim()));

            const author = elements[0];
            const author_index = index;
            
            index += author.length + 1;

            for (let date of elements.slice(1)) {
                // console.log(author, date, index, author_index);
                works.push(new InlineWork(author, date, author_index, index, false));
                index += date.length + 1;
            }
        }
        return works;
    }
}


class ReferenceListWork {
    constructor (authors, date) {
        // list of authors' names in String
        this.authors = authors;
        // date
        this.date = date;
    }

    static get_reference_list_works_dict(str) {
        // str: reference list in String
        // return an Dictionary of `ReferenceListWork` representing the reference list
        // return = {date1: [authors1, ], }
        const re = /^(.+?)\s\((.+?)\)/mg;
        let works = {};
        let match;
        while ((match = re.exec(str)) != null) {
            let authors = match[1].split(",");
            const date = match[2];
            authors = authors.map(author => (author.replace("&", "").trim()));
            authors = authors.filter(author => !(is_initials(author)));
            if (!(date in works)) {
                works[date] = new Array();
            }
            works[date].push(new ReferenceListWork(authors, date));
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
    let works = new Array();
    while ((match = re_inline_citation.exec(text)) != null) {
        if (InlineWork.is_citation(match[0])) {
            works.push(...InlineWork.get_works_from_citation(match[0], match.index));
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
    const references = document.getElementById("references").value;
    const works = ReferenceListWork.get_reference_list_works_dict(references);
    console.log(works);
}


function check() {
    for (let work of get_inline_citations()) {
        work.check();
        console.log(work);
    }
}

