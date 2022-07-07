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
    // return an Array of IntextWork
    // str: String of a Parenthetical Citation (without the partentheses)
    // index: start index of str in essay
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
}


class Essay {
  // this.div: corresponding `div` in HTML
  // this.intext_citations: an Array of `IntextWork` objects

  get_intext_citations() {
    // read intext citations to `this.intext_citations`
    var matches = [];
    const text = document.getElementById("essay").innerText;
    const re_Intext_citation = /(?<=\().*?(?=\))/g; // Parenthetical Citations
    // const re_sub_citation = /(?<=;).*?|.*?(?=;))/g; // get each citation inside a pair of parentheses
    // const a = /(?<=\()(.*?;?)+?.*?(?=\))/g;
    // const re2 = //g; // Narative Citation

    // matches = everything in parentheses
    this.intext_citations = new Array();
    let match;
    while ((match = re_Intext_citation.exec(text)) != null) {
      if (IntextWork.is_citation(match[0])) {
        this.intext_citations.push(...IntextWork.get_works_from_citation(match[0], match.index));
      }
      matches.push(match);
    }
    // return works;
  }

  init() {
    // read essay content & intext citations & disable `contentEditable`
    this.div = document.getElementById("essay");
    this.div.contentEditable = "false";
    this.get_intext_citations();
  }
}

class ReferenceList {
  // this.div: corresponding `div` in HTML
  // this.dworks: an Dictionary of `ReferenceListWork` representing the reference list
  //    return = {date1: [authors1, ], }

  get_reference_list_dict(str) {
    // 1. reformat `this.div`
    //    A) remove empty lines in `references` div
    //    B) place each line within reference list in `p` tags with id=`reference_line_${index}` (`index` starts from 0)
    //      (e.g. <p id="reference_line_0">FIRST REFERENCED WORK</p>)
    // 2. read reference list to `this.dworks`

    const reference_list_lines = this.div.innerText
      .split(/\r?\n/)
      .filter(line => line.trim() !== "");

    const re = /^(.+?)\s\((.+?)\)/;
    this.dworks = {};

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

      if (!(date in this.dworks)) {
        this.dworks[date] = new Array();
      }
      this.dworks[date].push(new ReferenceListWork(authors, date, index));

      reference_list_lines[index] = `<p id='reference_line_${index}'>${line}</p>`;
      index++;
    }

    this.div.innerHTML = reference_list_lines.join("\n");
  }

  reference_list_color_line(line_i, color) {
    const line = document.getElementById(`reference_line_${line_i}`);
    line.classList.add("unused-reference");
    line.classList.add("error-msg-on-hover");
    line.setAttribute("error-msg", "unused reference");
  }

  init () {
    // 1. initialize `this.div` and disable `contentEditable` 
    // 2. read reference list to `this.dworks`
    this.div = document.getElementById("references");
    this.get_reference_list_dict();
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
  const essay = new Essay();
  const reference_list = new ReferenceList();
  essay.init();
  reference_list.init();
  // document.getElementById("references").contentEditable = "false";
  // const reference_list_dict = ReferenceListWork.get_reference_list_dict();

  // check each work in intext citation
  for (let work of essay.intext_citations) {
    work.check();
    const date = work.get_date();
    // check if work is in reference list
    if (!work.error) {
      if (!(date in reference_list.dworks)) {
        work.set_error("work not in reference list");
      } else if (!reference_list_contains(reference_list.dworks[date], work)) { // check if contain authors
        work.set_error("work not in reference list");
      }
    }
    // print error message
    if (work.error) {
      tprint(`${work.author_i}: \t[${work.error}] for in-text citation {author: "${work.get_authors()}", date: "${work.get_date()}"}`);
    }
  }

  // unused reference in reference list
  const unused_references = Array();
  for (let date in reference_list.dworks) {
    for (let work of reference_list.dworks[date]) {
      if (!work.used) {
        unused_references.push(work);
      }
    }
  }
  for (let work of unused_references) {
    reference_list.reference_list_color_line(work.index, "rgb(200, 0, 0)")
  }
}