
function is_author_name(str) {
  if (str === "Jr." || str === "Sr.") {
    return false;
  }
  // check if is initials
  for (let c of str.replaceAll(".", "").split(" ")) {
    if (c.length > 1) {
      return true;
    }
  }
  return false;
}


function is_date(str) {
  // return false if nothing matched
  // return "ND" for "n. d."
  // return "Y" when `str` matched for year
  // return "M" when `str` matched for month
  str = str.trim();
  if (/n\. ?d\./.test(str)) {
    return "n.d.";
  }
  if (/\d{4}[a-z]?$/.test(str)) {
    return "Y";
  }
  const months = [
    "January", "February", "March", "April", 
    "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];
  for (const month of months) {
    if (str.startsWith(month)) {
      return "M";
    }
  }
  return false;
}


function get_year_from_date(str) {
  // return 0 if "n.d."
  // return -1 if failed
  str = str.trim();
  if (/n\. ?d\./.test(str)) {
    return 0;
  }
  if (/^\d{4}/.test(str)) {
    return str.substring(0, 4).toString();
  }
  return -1;
}


class IntextWork {
  constructor(author, date, author_i, date_i, error=false, p_index=false) {
    // author & date in String
    // pre-`trim()` (might have spaces & stuff like "see also: ")
    this.author = author;
    this.date = date;
    // start index of author & date in essay
    this.author_i = author_i;
    this.date_i = date_i;
    this.error = error;

    // index of parentheses pair (for checking authors' order)
    if (p_index) {
      this.p_index = p_index;
    } else {
      this.p_index = author_i;
    }
  }

  get_date() {
    // let date = this.date.trim();
    // if (/[0-2]\d{3}[a-z]/.test(date)) {
    //   date = date.substring(0, 4);
    // }
    return get_year_from_date(this.date);
  }

  get_authors() {
    // get authors from `this.author`
    // return an Array of author names in string
    // "X & Y"/"X and Y" -> ["X", "Y"]
    // "X et al." -> ["X", "et al."]
    
    // test "X and Y"
    let authors;
    let match = /(\S+?) +?and +?(\S+?) *$/.exec(this.author);
    if (match) {
      authors = match.slice(1);
    } else {
      authors = this.author.split("&");
    }
    const author_n = authors.length;

    // "X et al." -> ["X", "et al."]
    if (authors[author_n - 1].includes("et al.")) {
      authors[author_n - 1] = authors[author_n - 1].replace("et al.", "");
      authors.push("et al.");
    }

    // delete apostrophes and the "see also: " stuff
    for (let i = 0; i < authors.length; i++) {
      authors[i] = authors[i].trim();
      // apostrophes
      if (authors[i].endsWith("’s")) {
        authors[i] = authors[i].slice(0, -2);
      } else if (authors[i].endsWith("’")) {
        authors[i] = authors[i].slice(0, -1);
      }

      // "see also" stuff
      match = /(see)( also)?:? (\S+?) *$/.exec(authors[i]);
      if (match) {
        authors[i] = match[3];
      }
    }
    return authors;
  }

  set_error(error) {
    this.error = error;
  }

  static is_parenthetical_citation(str) {
    // check if includes date
    return /, +?.*?\d{4}/.test(str) || str.includes(", n.d.");
  }

  static get_narrative_citation(str, index, essay_text) {
    // return `IntextWork` if found author
    // return `IntextWork` with `author`="" when can't find author & `str` is date
    // return false when 
    // str: String of whatever is in the parentheses
    // index: start index of str in essay
    // essay_text: essay in str
    if (!is_date(str)) {
      return false;
    }
    essay_text = essay_text.substring(0, index - 1);

    // check "(author) et al. "
    let match = /(\S+?) +?et +?al\. *?$/.exec(essay_text);
    if (match) {
      return new this(match[0], str, match.index, index);
    }
    
    // check "(author1) and (author2) "
    match = /(\S+?) +?and +?(\S+?) *$/.exec(essay_text);
    if (match) {
      return new this(match[0], str, match.index, index);
    }

    // check "(author) " (and author doesn't start with lower case letter)
    match = /(\S+?) *$/.exec(essay_text);
    if (match && !/[a-z]/.test(match[0][0])) {
      return new this(match[0], str, match.index, index);
    }

    // can't match nothing
    return new this("", str, index, index);
  }

  check_date() {
    // check citation date format
    // return error as string, if any
    // return false if no error found
    let raw_date = this.date.trim(); // date after `trim`
    if (raw_date === "n.d." || /^\d{4}[a-z]?$/.test(raw_date)) {
      return false;
    }
    return "DATE_ERROR";
  }

  check_author() {
    if (!this.author) {
      return "CANNOT_FIND_AUTHOR";
    }
    return false;
  }

  check() {
    // check citation of work
    // stor citation error at `self.error`
    if (!this.error) {
      this.error = this.check_author();
    }
    if (!this.error) {
      this.error = this.check_date();
    }
  }

  static get_parentical_citation(str, index) {
    // return an Array of IntextWork
    // str: String of a Parenthetical Citation (without the partentheses)
    // index: start index of str in essay
    let works = [];
    let cur_index = index;

    for (let work of str.split(";")) {
      let elements = work.split(",");

      const author = elements[0];
      const author_index = cur_index;

      cur_index += author.length + 1;

      let last_date = 0;
      for (let date of elements.slice(1)) {
        const date_type = is_date(date);
        if (!date_type){
          // don't even recognize
          works.push(new IntextWork(author, date, author_index, cur_index, "CANNOT_CHECK_THIS_YET", index));
        } else if (date_type === "M") {
          // is month (shouldn't be month in in text citation)
          works.push(new IntextWork(author, date, author_index, cur_index, "MONTH_IN_IN_TEXT_CITATION", index));
        } else {
          if (get_year_from_date(date) != -1 && last_date > get_year_from_date(date)) {
            // date order error
            works.push(new IntextWork(author, date, author_index, cur_index, "WRONG_DATE_ORDER", index));
          } else {
            // ok
            works.push(new IntextWork(author, date, author_index, cur_index, false, index));
          }
          last_date = get_year_from_date(date);
        }
        cur_index += date.length + 1;
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


function string_replace_at(str, s_index, e_index, replacement) {
  // replace `str`[`s_index`, `e_index` - 1] to `replacement`
  return str.substring(0, s_index) + 
    replacement + 
    str.substring(e_index);
}


class StyleControl {
  // doesn't suport overlap
  constructor (html_element) {
    this.html_element = html_element;
    this.text = html_element.innerText;
    this.buffer = Array();
    // array of style change requests that would be implemented with `this.flush()`
    // style change requests: {"s_index":, "e_index":, "new_str": }
    // [s_index, e_index)
  }

  replace(s_index, e_index, new_str) {
    this.buffer.push({
      "s_index": s_index, 
      "e_index": e_index, 
      "new_str": new_str, 
    });
  }

  add_class (s_index, e_index, css_class, tag_name="span") {
    const new_str = `<${tag_name} class='${css_class}'>` + 
      this.text.substring(s_index, e_index) + 
      `</${tag_name}>`;
    
    this.replace(s_index, e_index, new_str);
  }

  add_style (s_index, e_index, style, tag_name="span") {
    const new_str = `<${tag_name} style='${style}'>` + 
      this.text.substring(s_index, e_index) + 
      `</${tag_name}>`;

    this.replace(s_index, e_index, new_str);
  }

  add_color (s_index, e_index, tag_name="span") {
    this.add_style(s_index, e_index, tag_name);
  }

  add(s_index, e_index, attrs, tag_name="span") {
    let str_attrs = "";
    for (const key in attrs) {
      str_attrs += ` ${key}='${attrs[key]}'`;
    }
    const new_str = `<${tag_name} ${str_attrs}>` + 
      this.text.substring(s_index, e_index) + 
      `</${tag_name}>`;

    this.replace(s_index, e_index, new_str);
  }

  add_work(work) {
    // work: IntextWork
    if (!work.error) {
      this.add_class(work.date_i, work.date_i + work.date.length, "in-text-ok");
      this.add_class(work.author_i, work.author_i + work.author.length, "in-text-ok");
    }
    const error_element_attrs = {
      "error-msg": `${work.error}: {au:"${work.get_authors()}", date:"${work.get_date()}"}`, 
    };
    // error display
    let author_error = true;
    let date_error = true;
    if (work.error === "DATE_ERROR") {

      error_element_attrs["class"] = "in-text-error in-text-error-date";
      author_error = false;

    } else if (work.error === "WRONG_WORK_ORDER") {

      error_element_attrs["class"] = "in-text-error";
      error_element_attrs["error-msg"] = "WRONG_WORK_ORDER";

    } else if (work.error === "CANNOT_CHECK_THIS_YET") {

      error_element_attrs["class"] = "in-text-maybe-error in-text-error";
      error_element_attrs["error-msg"] = "CANNOT_CHECK_THIS_YET";

    } else if (work.error === "MONTH_IN_IN_TEXT_CITATION") {

      error_element_attrs["class"] = "in-text-error should-delete";
      author_error = false;

    } else {
      error_element_attrs["class"] = "in-text-error";
    }

    if (author_error) {
      this.add(work.author_i, work.author_i + work.author.length, error_element_attrs);
    }
    if (date_error) {
      this.add(work.date_i, work.date_i + work.date.length, error_element_attrs);
    }
  }

  flush () {
    // render all stylistic changes in buffer & return rendered text
    this.buffer.sort((a, b) => (a.s_index - b.s_index));
    let index_add = 0;
    let html = this.text;
    for (let i = 0; i < this.buffer.length; i++) {
      let s_index = this.buffer[i].s_index;
      let e_index = this.buffer[i].e_index;
      const new_str = this.buffer[i].new_str;

      if (i > 0 && s_index == this.buffer[i - 1].s_index) {
        continue;
      }
      s_index += index_add;
      e_index += index_add;

      html = string_replace_at(html, s_index, e_index, new_str);

      index_add += new_str.length - (e_index - s_index);
    }
    this.html_element.innerHTML = html;
  }
}


class Essay {
  // this.div: corresponding `div` in HTML
  // this.intext_citations: an Array of `IntextWork` objects
  constructor() {
    // read essay content & intext citations & disable `contentEditable`
    this.div = document.getElementById("essay");
    this.text = this.div.innerText.replaceAll("'", "’");
    this.div.contentEditable = "false";
    this.text_style_control = new StyleControl(this.div);

    this.get_intext_citations();
  }

  get_intext_citations() {
    // read in-text citations to `this.intext_citations`
    // const re_Intext_citation = /(?<=\().*?(?=\))/g;
    const re_Intext_citation = /\(.*?(?=\))/g;
    this.intext_citations = [];
    let match;
    while ((match = re_Intext_citation.exec(this.text)) != null) {
      // color parentheses
      match[0] = match[0].substring(1);
      match.index++;
      const left_index = match.index - 1;
      const right_index = match.index + match[0].length;
      this.text_style_control.add_class(left_index, left_index + 1, "in-text-parenthesis");
      this.text_style_control.add_class(right_index, right_index + 1, "in-text-parenthesis");
      
      // parenthetical citations
      if (IntextWork.is_parenthetical_citation(match[0])) {
        this.intext_citations.push(...IntextWork.get_parentical_citation(match[0], match.index));
        continue;
      }
      
      // narrative citations
      const work = IntextWork.get_narrative_citation(match[0], match.index, this.text);
      if (work) {
        this.intext_citations.push(work);
      } else {
        // can't recognize what's in the parentheses
        this.intext_citations.push(new IntextWork(match[0], match[0], match.index, match.index, "CANNOT_CHECK_THIS_YET"));
        // this.text_style_control.add(
        //   match.index, 
        //   match.index + match[0].length, 
        //   {"class": "in-text-maybe-error", "error-msg": "CANNOT_CHECK_THIS_YET"}
        // );
      }
    }
  }
}


class ReferenceList {
  // this.div: corresponding `div` in HTML
  // this.dworks: an Dictionary of `ReferenceListWork` representing the reference list
  //    return = {date1: [authors1, ], }
  constructor () {
    // 1. initialize `this.div` and disable `contentEditable` 
    // 2. read reference list to `this.dworks`
    this.div = document.getElementById("references");
    this.get_reference_list_dict();
  }

  set_error(line_i, error_msg) {
    const line = document.getElementById(`reference_line_${line_i}`);
    line.classList.add("unused-reference");
    line.classList.add("error-msg-on-hover");
    if (error_msg.startsWith("unused reference:")) {
      line.classList.add("should-delete");
    }
    line.setAttribute("error-msg", error_msg);
  }

  get_reference_list_dict(str) {
    // 1. reformat `this.div`
    //    A) remove empty lines in `references` div
    //    B) place each line within reference list in `p` tags with id=`reference_line_${index}` (`index` starts from 0)
    //      (e.g. <p id="reference_line_0">FIRST REFERENCED WORK</p>)
    // 2. read reference list to `this.dworks`

    const reference_list_lines = this.div.innerText
      .split(/\r?\n/)
      .filter(line => line.trim() !== "");
    const error_list = [];

    const re = /^(.+?)\s\((.+?)\)/;
    this.dworks = {};

    for (let index = 0; index < reference_list_lines.length; index++) {
      const line = reference_list_lines[index];
      reference_list_lines[index] = `<p id='reference_line_${index}'>${line}</p>`;
      
      // try match reference
      const match = re.exec(line);
      if (!match) {
        continue;
      }
      let authors = match[1].split(",");

      // extract date
      const date = get_year_from_date(match[2]);
      if (date == -1) {
        error_list.push([index, `cannot extract date from "${match[2]}"`]);
      }
      authors = authors.map(
        author => (author.replace("&", "").trim())
      ).filter(is_author_name);

      if (!(date in this.dworks)) {
        this.dworks[date] = [];
      }
      this.dworks[date].push(new ReferenceListWork(authors, date, index));
    }

    this.div.innerHTML = reference_list_lines.join("\n");
    for (const error_args of error_list) {
      this.set_error(...error_args);
    }
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


function check() {
  // disable `contentEditable` and read citations
  const essay = new Essay();
  const reference_list = new ReferenceList();
  document.getElementById("main-div").style.height = "90vh";
  document.getElementById("button-section").style.display = "none";

  // check each work in intext citation
  let last_work = null;
  for (let work of essay.intext_citations) {
    // check if work is in reference list
    work.check();
    const date = work.get_date();
    if (!work.error) {
      if (!(date in reference_list.dworks)) {
        // console.log(work, date);
        work.set_error("DATE_NOT_IN_REF_LIST");
      } else if (!reference_list_contains(reference_list.dworks[date], work)) { // check if contain authors
        work.set_error("NOT_IN_REF_LIST");
      }
      if (last_work && 
        last_work.p_index === work.p_index && 
        work.get_authors()[0][0] < last_work.get_authors()[0][0] &&
        !/^see/.test(work.author.trim())
      ) {
        work.set_error("WRONG_WORK_ORDER");
      }
    }
    // // print error message
    // if (work.error) {
    //   console.log(`(${work.author_i}, ${work.date_i}): \t` + 
    //     `[${work.error}] for in-text citation:` + 
    //     `{au:"${work.get_authors()}", date:"${work.get_date()}"}`);
    // }
    essay.text_style_control.add_work(work);

    last_work = work;
  }
  essay.text_style_control.flush();

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
    reference_list.set_error(work.index, `unused reference: work{au:[${work.authors}], date:"${work.date}"}`);
  }

}


// disable copy style
document.getElementById("essay").addEventListener("paste", (event) => {
    event.preventDefault();

    let paste = (event.clipboardData || window.clipboardData).getData('text');
    document.getElementById("essay").innerHTML = paste;
});


document.getElementById("references").addEventListener("paste", (event) => {
    event.preventDefault();

    let paste = (event.clipboardData || window.clipboardData).getData('text');
    document.getElementById("references").innerHTML = paste;
});
