

function num_of_circles(x) {
    let ret = 0;
    for (let d of x.toString()) {
        d = Number(d);
        if ([1, 2, 3, 5, 7].includes(d)) {
            ret += 0;
        } else if ([4, 6, 9, 0].includes(d)) {
            ret += 1;
        } else if (d == 8) {
            ret += 2;
        }
    }
    return ret;
}


function num_of_digits(x) {
    return x.toString().length;
}

function num_of_1_in_binary(x) {
    return x.toString(2).split('1').length - 1;
}


const all_operators = [
    (function (x, y) {
        return 2 * x - y;
    }), 
    (function (x, y) {
        return num_of_digits(x) + num_of_digits(y);
    }), 
    (function (x, y) {
        return 2 * x * x + 3;
    }), 
    (function (x, y) {
        return num_of_1_in_binary(x) + num_of_1_in_binary(y);
    }), 
    (function (x, y) {
        return num_of_circles(x) + num_of_circles(y);
    }), 
    /*
    (function (x, y) {
        return num_of_1_in_binary(x^y);
    }),
    */
];
/*
const hints = [
    "Probably I should multiply 2 to the first number and see what's going on 🤔",
    "Probably I should check the digits of each number 🤔",
    "Probably I should check the square of first number and ignore the second one 🤔",
    "Probably I should think about the binary form of a number 🤔",
    "Probably I should search what is homeomorphism 🤔"

];
*/
const questions = [
    {
        func: (function (x, y) {return 2 * x - y;}), 
        hints: ["Maybe I should recall my elementary school arithmetic 🤔",
        "I should probably multiply 2 to the first number and see what's going on 🤯"]
    }, 
    {
        func: (function (x, y) {return num_of_digits(x) + num_of_digits(y);}), 
        hints: ["Forget all the mathematics 🤔"]
    },
    {
        func: (function (x, y) {return 2 * x * x + 3;}), 
        hints: ["I should probably check the square of first number and ignore the second one 🤔"]
    },
    {
        func: (function (x, y) {return num_of_1_in_binary(x) + num_of_1_in_binary(y);}), 
        hints: ["I should potentially think about the binary form 🤔"]
    },
    {
        func: (function (x, y) {return num_of_circles(x) + num_of_circles(y);}), 
        hints: ["I should plausibly not search up what homeomorphism means 🤔"]
    }
];


function generate_operator() {
    function add(a, b) {return a + b;}
    return add;
}
var question_operator = null;
var question_lvalue = null;
var question_rvalue = null;
var answer = null;
var score = null;
var current_level = null;
var clues_used_for_level = null;
var hints_used_for_level = null;
const num_level = all_operators.length;


function add_new_clue(lvalue, rvalue) {
    const clueListContainer = document.getElementById("clue-list-container");
    const answer = question_operator(lvalue, rvalue);
    
    const clueContainer = document.createElement("div");
    clueContainer.innerHTML += `
    <div class="d-flex justify-content-center mb-3">
        <span class="entry">${lvalue}</span>
        <span class="entry">?</span>
        <span class="entry">${rvalue}</span>
        <span class="entry">=</span>
        <span class="entry">${answer}</span>
    </div>
    `;
    
    clueListContainer.appendChild(clueContainer);
    document.getElementById('input-num-l').value = '';
    document.getElementById('input-num-r').value = '';
}

function display_element_by_id(id) {
    document.getElementById(id).style.display = "block";
}

function hide_element_by_id(id) {
    document.getElementById(id).style.display = "none";
}

// function toggle_element_hidden(id) {
//     const element = document.getElementById(id);
//     if (element.style.display === "none") {
//         element.style.display = "block";
//     } else {
//         element.style.display = "none";
//     }
// }


function check_input(lvalue, rvalue) {
    return !isNaN(lvalue) && !isNaN(rvalue) && 
        !((lvalue == question_lvalue && rvalue == question_rvalue) || 
        (rvalue == question_lvalue && lvalue == question_rvalue));
}


function add_new_clue_from_input() {
    const lvalue_str = document.getElementById("input-num-l").value;
    const rvalue_str = document.getElementById("input-num-r").value;
    const lvalue = Number(lvalue_str);
    const rvalue = Number(rvalue_str);

    // const input_error_display = document.getElementById("input-error-message");
    if (lvalue_str && rvalue_str && check_input(lvalue, rvalue)) {
        add_new_clue(lvalue, rvalue);
        hide_element_by_id("input-error-message");
        clues_used_for_level += 1;
        score -= 1;
        set_span_val("score-record", score);
    } else {
        display_element_by_id("input-error-message");
    }
}


function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function check_answer() {
    const input = document.getElementById("question-answer").value;
    if (input && Number(input) == answer) {
        display_element_by_id("right-answer-message");
        hide_element_by_id("wrong-answer-message");
        next_level();
    } else {
        hide_element_by_id("right-answer-message");
        display_element_by_id("wrong-answer-message");
        alert("You Lose! Restart Game?");
        init_game();
    }
}

function set_span_val(span_id, value) {
    document.getElementById(span_id).innerText = value;
}


function init_level(level) {
    set_span_val("current-level", level);
    document.getElementById("question-answer").value = "";
    document.getElementById("clue-list-container").innerHTML = "";
    question_lvalue = randint(0, 19);
    question_rvalue = randint(0, 19);
    hints_used_for_level = 0;
    clues_used_for_level = 0;
    set_span_val("question-num-l", question_lvalue);
    set_span_val("question-num-r", question_rvalue);
    set_span_val("hint-message", "");
    set_span_val("num-hints-used", hints_used_for_level);
    
    clues_used_for_level = 0;
    
    // question_operator = generate_operator();
    question_operator = questions[level - 1].func;
    answer = question_operator(question_lvalue, question_rvalue);
    // document.getElementById("question-answer").innerText = answer;
}


// global init
// <input> trigger buttons on enter
function add_click_button_event_on_enter(input_id, button_id) {
    document.getElementById(input_id).addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById(button_id).click();
        }
    });
}

add_click_button_event_on_enter("question-answer", "check-answer-button");
add_click_button_event_on_enter("input-num-l", "submit-input");
add_click_button_event_on_enter("input-num-r", "submit-input");


function display_hint() {
    if (hints_used_for_level >= 2) {
        alert("You've already used all hints!");
        return ;
    }
    set_span_val("hint-message", questions[current_level - 1].hints[hints_used_for_level]);
    hints_used_for_level += 1;
    set_span_val("num-hints-used", hints_used_for_level);
    if (hints_used_for_level == 1) {
        score -= 20;
    } else if (hints_used_for_level >= 2) {
        score -= 40;
    }
    set_span_val("score-record", score);
}


function init_game() {
    score = 0;
    current_level = 1;
    
    set_span_val("score-record", score);
    init_level(1);
}


function next_level() {
    if (current_level == num_level) {
        alert(`You Win! Score: ${score + 100}`);
        init_game();
        return ;
    }

    current_level += 1;
    clues_used_for_level = 0;
    // let score_for_level = 100 - clues_used_for_level;
    // if (hints_used_for_level == 1) {
    //     score_for_level -= 20;
    // } else if (hints_used_for_level >= 2) {
    //     score_for_level -= 60;
    // }
    // score += score_for_level;
    score += 100;
    
    set_span_val("current-level", current_level);
    set_span_val("score-record", score);
    init_level(current_level);
}



init_game();

// for (let i = 1; i <= 30; i += 1) {
//     add_new_clue(1, 2);
// }

