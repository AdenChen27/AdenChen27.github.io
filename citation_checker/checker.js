/**
 * TODO:
 * check_date: check (yyyy, month day)/(yyyy, month) format
 * */

// var reference_list_dict;

class IntextWork {
  constructor(author, date, author_i, date_i) {
    // author & date in String
    // pre-`trim()` (might have spaces & stuff like "see also: ")
    this.author = author;
    this.date = date;
    // start index of author & date in essay
    this.author_i = author_i;
    this.date_i = date_i;
  }

  get_date() {
    // return date
    return this.date.trim();
  }

  get_authors() {
    // return an Array of author names in string
    // "X & Y" -> ["X", "Y"]
    // "X et al." -> ["X", "et al."]
    let authors = this.author.split("&"); // CHECK FORMAT
    const author_n = authors.length;
    if (authors[author_n - 1].includes("et al.")) {
      authors[author_n - 1] = authors[author_n - 1].replace("et al.", "");
      authors.push("et al.");
    }
    return authors.map(str => (str.trim()));
  }

  set_error(error) {
    this.error = error;
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
    // return an Array of IntextWork
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
        works.push(new IntextWork(author, date, author_index, index, false));
        index += date.length + 1;
      }
    }
    return works;
  }

  static get_intext_citations() {
    var matches = [];
    const text = document.getElementById("essay").innerText;
    const re_Intext_citation = /(?<=\().*?(?=\))/g; // Parenthetical Citations
    // const re_sub_citation = /(?<=;).*?|.*?(?=;))/g; // get each citation inside a pair of parentheses
    // const a = /(?<=\()(.*?;?)+?.*?(?=\))/g;
    // const re2 = //g; // Narative Citation

    // matches = everything in parentheses
    let works = new Array();
    let match;
    while ((match = re_Intext_citation.exec(text)) != null) {
      if (IntextWork.is_citation(match[0])) {
        works.push(...IntextWork.get_works_from_citation(match[0], match.index));
      }
      matches.push(match);
    }
    
    return works;
  }
}


class ReferenceListWork {
  constructor(authors, date, index) {
    // list of authors' names in String
    this.authors = authors;
    // date
    this.date = date;
    // index in reference list
    this.index = index;
  }

  equals(Intext_work) {
    if (Intext_work.get_date() !== this.date) {
      return false;
    }
    const authors = this.authors;
    const authors_n = authors.length;
    const Intext_work_authors = Intext_work.get_authors();
    const Intext_work_authors_n = Intext_work_authors.length;
    // Intext_work_authors should be ["first author", "et al."]

    if (Intext_work_authors[0] !== authors[0]) {
      return false;
    }
    if (authors_n >= 3 && Intext_work_authors_n === 2) {
      // test if used "et al."
      return Intext_work_authors[1] === "et al.";
    } else if (authors_n === 2 && Intext_work_authors_n === 2) {
      return Intext_work_authors[1] === authors[1];
    } else {
      return authors_n === 1 && Intext_work_authors_n === 1;
    }
  }

  static get_reference_list_dict(str) {
    // remove empty lines in `references` div
    // place each line within reference list in `p` tags with id=`reference_line_${index}` (`index` starts from 0)
    //  (e.g. <p id="reference_line_0">FIRST REFERENCED WORK</p>)
    // return an Dictionary of `ReferenceListWork` representing the reference list
    // return = {date1: [authors1, ], }

    // const references_text;
    const reference_list_div = document.getElementById("references");

    const reference_list_lines = reference_list_div.innerText
      .split(/\r?\n/)
      .filter(line => line.trim() !== "");

    const re = /^(.+?)\s\((.+?)\)/;
    let works = {};

    for (let index in reference_list_lines) {
      const line = reference_list_lines[index];
      const match = re.exec(line);
      let authors = match[1].split(",");
      const date = match[2];

      authors = authors.map(
        author => (author.replace("&", "").trim())
      ).filter(
        author => !(is_initials(author))
      );

      if (!(date in works)) {
        works[date] = new Array();
      }
      works[date].push(new ReferenceListWork(authors, date, index));

      reference_list_lines[index] = `<p id='reference_line_${index}'>${line}</p>`;
      index++;
    }

    reference_list_div.innerHTML = reference_list_lines.join("\n");

    return works;
  }

  static reference_list_color_line(line_i, color) {
    const line = document.getElementById(`reference_line_${line_i}`);
    line.classList.add("unused-reference");
    line.classList.add("error-msg-on-hover");
    line.setAttribute("error-msg", "unused reference");
  }
}


function reference_list_contains(reference_list, work) {
  // `reference_list`: Array of ReferenceListWork
  // `work`: IntextWork
  for (let work1 of reference_list) {
    if (work1.equals(work)) {
      work1.used = true;
      return true;
    }
  }
  return false;
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
    temp.innerText += args[i] + " ";
  }
  temp.innerText += "\n";
}


function test() {
  const references = document.getElementById("references").innerText;
  const works = ReferenceListWork.get_reference_list_dict(references);
  console.log(works);
}


function check() {
  // disable `contentEditable` and read citations
  document.getElementById("references").contentEditable = "false";
  document.getElementById("essay").contentEditable = "false";
  const reference_list_dict = ReferenceListWork.get_reference_list_dict();
  const intext_citations = IntextWork.get_intext_citations();

  // check each work in intext citation
  for (let work of intext_citations) {
    work.check();
    const date = work.get_date();
    // check if work is in reference list
    if (!work.error) {
      if (!(date in reference_list_dict)) {
        work.set_error("work not in reference list");
      } else if (!reference_list_contains(reference_list_dict[date], work)) { // check if contain authors
        work.set_error("work not in reference list");
      }
    }
    // print error message
    if (work.error) {
      tprint(`${work.author_i}: \t[${work.error}] for in-text citation {author: "${work.get_authors()}", date: "${work.get_date()}"}`);
    }
  }
  const unused_references = Array();
  for (let date in reference_list_dict) {
    for (let work of reference_list_dict[date]) {
      if (!work.used) {
        unused_references.push(work);
      }
    }
  }
  unused_references.sort(function(x, y) {
    x = x.index;
    y = y.index;
    return x - y;
  });
  for (let work of unused_references) {
    ReferenceListWork.reference_list_color_line(work.index, "rgb(200, 0, 0)")
    // tprint(`unused reference: {author: "${work.authors[0]}", date: "${work.date}"}`);
  }
}