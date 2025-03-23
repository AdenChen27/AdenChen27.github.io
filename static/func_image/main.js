var win_width,
    win_height, // init at get_page_size()
    axis_max_height,
    axis_max_width, // init at adjust_size()
    // color for graph (change automatically when `c_auto_color_change` === true)
    color_using_index = 0,
    graph_color       = ["#720000", "#007200", "#000072", "#727200", "#007272", "#720072"],
    
    all_graph         = [];
    // all_graph = [
    //     [expression1_in_format, color1, expression1], 
    //     [expression2_in_format, color2, expression2], 
    //     etc.
    // ]

var backing_store_ratio = context.webkitBackingStorePixelRatio ||
                        context.mozBackingStorePixelRatio ||
                        context.msBackingStorePixelRatio ||
                        context.oBackingStorePixelRatio ||
                        context.backingStorePixelRatio || 1,
    device_pixel_ratio = window.devicePixelRatio || 1;

var ratio = device_pixel_ratio / backing_store_ratio;


function get_page_size() {
    // get size of pag
    if (window.innerWidth) {
        win_width = window.innerWidth;
    } else if (document.body && document.body.clientWidth) {
        win_width = document.body.clientWidth;
    }
    if (window.innerHeight) {
        win_height = window.innerHeight;
    } else if (document.body && document.body.clientHeight) {
        win_height = document.body.clientHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight &&
        document.documentElement.clientWidth) {
        win_height = document.documentElement.clientHeight;
        win_width = document.documentElement.clientWidth;
    }
}


function draw_axis() {
    // draw axis on context
    // origin == middle of context
    context.beginPath();
    context.moveTo(-axis_max_width, 0);
    context.lineTo(axis_max_width, 0);
    context.moveTo(0, -axis_max_height);
    context.lineTo(0, axis_max_height);
    // arrow
    if (c_show_axis_arrow) {
        context.moveTo(0, -axis_max_height);
        context.lineTo(-c_arrow_size, -axis_max_height + c_arrow_size);
        context.moveTo(0, -axis_max_height);
        context.lineTo(c_arrow_size, -axis_max_height + c_arrow_size);

        context.moveTo(axis_max_width, 0);
        context.lineTo(axis_max_width - c_arrow_size, - c_arrow_size);
        context.moveTo(axis_max_width, 0);
        context.lineTo(axis_max_width - c_arrow_size, + c_arrow_size);
    }
    context.lineWidth = c_axis_line_width;
    context.strokeStyle = "#000";
    context.stroke();
}


function draw_axis_mark(gap_size) {
    context.font = c_axis_mark_font_size + "px arial,sans-serif";
    context.fillStyle = "#000000";
    var pos;
    var x = -Math.round(axis_max_width/gap_size)*gap_size;
    for (; x <= axis_max_width; x += gap_size) {
        pos = parseFloat((x/c_enlarge_val).toFixed(c_float_prec));
        context.fillText(String(pos), x + 5, c_axis_mark_font_size);
    }
    var y = -Math.round(axis_max_height/gap_size)*gap_size;
    for (; y <= axis_max_height; y += gap_size) {
        pos = parseFloat((-y/c_enlarge_val).toFixed(c_float_prec));
        context.fillText(String(pos), 5, y + c_axis_mark_font_size);
    }
}


function draw_guide_line(gap_size) {
    var x = -Math.round(axis_max_width/gap_size)*gap_size;
    for (; x <= axis_max_width; x += gap_size) {
        if (guide_line_checkbox.checked) {
            context.moveTo(x, -axis_max_height);
            context.lineTo(x, axis_max_height);
        } else if (axis_mark_checkbox.checked) {
            context.moveTo(x, -c_scale_line_size);
            context.lineTo(x, c_scale_line_size);
        }
    }
    var y = -Math.round(axis_max_height/gap_size)*gap_size;
    for (; y <= axis_max_height; y += gap_size) {
        if (guide_line_checkbox.checked) {
            context.moveTo(-axis_max_width, y);
            context.lineTo(axis_max_width, y);
        } else if (axis_mark_checkbox.checked) {
            context.moveTo(-c_scale_line_size, y);
            context.lineTo(c_scale_line_size, y);
        }
    }
    if (guide_line_checkbox.checked) {
        context.lineWidth = c_guide_line_width;
    } else {
        context.lineWidth = c_axis_line_width;
    }
    context.strokeStyle = "#000";
    context.stroke();
}


function get_guide_line_gap_size() {
    var gap = axis_max_width / 5 / c_enlarge_val;
    var digit_num = Math.ceil(Math.log(gap) / Math.log(10));
    var base = 10**(digit_num - 2);
    gap = Math.round(gap/base);
    // left with 2 digit
    if (gap % 10 <= 5) {
        gap += 5 - gap % 10;
    } else {
        gap += 10 - gap % 10;
    }
    // last digit round to 0 or 5
    return gap*base*c_enlarge_val;
}


function format_expression(expression) {
    // format expression(val of y)
    return expression
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/\^/g, "**")
        .replace(/\[/g, "(")
        .replace(/\]/g, ")")
        .replace(/\{/g, "(")
        .replace(/\}/g, ")")
        .replace(/-?[0-9]+\.?[0-9]*([A-Za-z]+|\()/g,
            function(sub_expression) {
                for (var i = 0; i < sub_expression.length; ++i) {
                    if ("a" <= sub_expression[i] && sub_expression[i] <= "z") {
                        return sub_expression.substring(0, i) +
                            "*" + sub_expression.substring(i, sub_expression.length);
                    }
                }
            })
        .replace(/-[a-zA-z]/g, 
            function(sub_expression) {
                return "-1*" + sub_expression[1];
            })// "-x" -> "-1*x"
        // Math.constant
        .replace(/\be\b/g, "Math.E")
        .replace(/\bpi\b/g, "Math.PI")
        // Math.func
        .replace(/\babs\b/g, "Math.abs")
        .replace(/\bacos\b/g, "Math.acos")
        .replace(/\basin\b/g, "Math.asin")
        .replace(/\batan\b/g, "Math.atan")
        .replace(/\batan2\b/g, "Math.atan2")
        .replace(/\bceil\b/g, "Math.ceil")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\bfloor\b/g, "Math.floor")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\bln\b/g, "Math.log")
        .replace(/\bmax\b/g, "Math.max")
        .replace(/\bmin\b/g, "Math.min")
        .replace(/\bpow\b/g, "Math.pow")
        .replace(/\brandom\b/g, "Math.random")
        .replace(/\bround\b/g, "Math.round")
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\btan\b/g, "Math.tan");
}


function show_graph_info(expression) {
    // checking exoeression fits ax^2+bx+c
    var reg_exp = ["", "[1-9][0-9]*\\*x\\*\\*2", "[1-9][0-9]*\\*x", "[1-9][0-9]*"];
    var arrangement = [
        // a b c != 0
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
        // (a b != 0) || (a c != 0)
        [1, 2],
        [1, 3],
        [2, 1],
        [3, 1],
        // a != 0
        [1]
    ];
    var final_reg_exp;
    for (var i = 0; i < arrangement.length; ++i) {
        // arrangement[i] => final_reg_exp
        final_reg_exp = "/^\\-?" + reg_exp[arrangement[i][0]];
        for (var j = 1; j < arrangement[i].length; ++j) {
            final_reg_exp += "[+-]" + reg_exp[arrangement[i][j]];
        }
        final_reg_exp += "$/";
        if (eval(final_reg_exp).test(expression)) {
            // match case
            var nums = [0].concat(expression.match(/\-?[1-9][0-9]*/g));
            nums.splice(arrangement[i].indexOf(1) + 2, 1);
            var a = nums[arrangement[i].indexOf(1) + 1],
                b = nums[arrangement[i].indexOf(2) + 1],
                c = nums[arrangement[i].indexOf(3) + 1];
            var delta = b * b - 4 * a * c;
            // output result
            other_info_label.innerText += "Δ = " + delta + "\n";
            if (delta < 0) {
                other_info_label.innerText += "方程无实根";
            } else if (delta == 0) {
                other_info_label.innerText += "x1 = x2 = " + -b / (2 * a);
            } else {
                other_info_label.innerText +=
                    "x1 = " + parseFloat(((-b + Math.sqrt(delta)) / (2 * a)).toFixed(c_float_prec)) + "\n" +
                    "x2 = " + parseFloat(((-b - Math.sqrt(delta)) / (2 * a)).toFixed(c_float_prec));
            }
            return;
        }// end of match case
    }
    // end of checking exoeression fits ax^2+bx+c
}


function new_graph(expression, color, enlarge) {
    // draw new graph on context
    // return true if success
    err_msg_label.innerText = "";
    other_info_label.innerText = "";
    var step = c_graph_prec / c_enlarge_val;
    try {
        if (expression == "") {
            throw "expression empty";
        }

        show_graph_info(expression);
        context.beginPath();
        var x = -axis_max_width / enlarge + step;
        context.moveTo(x*enlarge, -eval(expression) * enlarge);
        for (; x <= axis_max_width / enlarge; x += step * enlarge) {
            context.lineTo(x*enlarge, -eval(expression) * enlarge);
        }
        context.lineWidth = c_graph_line_width;
        context.strokeStyle = color;
        context.stroke();

    } catch (err) {
        err_msg_label.innerText = "函数不符合规范";
        console.log(err);
        return false;
    }
    return true;
}


function renew_graph() {
    reset_canvas();
    var text_x = -axis_max_width + c_font_size + c_rect_size,
        text_y = -axis_max_height + c_font_size,
        rect_x = -axis_max_width + c_font_size - c_rect_size / 2,
        rect_y = -axis_max_height + c_rect_size / 2;

    context.font = c_font_size + "px arial,sans-serif";
    for (var i in all_graph) {
        if (new_graph(all_graph[i][0], all_graph[i][1], c_enlarge_val)) {
            context.fillStyle = "#000";
            context.fillText("y = " + all_graph[i][2], text_x, text_y);
            context.fillStyle = all_graph[i][1];
            context.fillRect(rect_x, rect_y, c_rect_size, c_rect_size);
            text_y += c_rect_size * 1.2;
            rect_y += c_rect_size * 1.2;
        } else {
            all_graph.splice(i, 1);
        }
    }
    var scale = get_guide_line_gap_size() / c_enlarge_val;
    enlarge_val_input.value = parseFloat(scale.toFixed(c_float_prec));
}


function sth_fun(func) {
    if (func == "Aden") {
        window.open("https://AdenChenAn.github.io");
        return true;
    } else if (func == "github") {
        window.open("https://github.com/AdenChenAn/js_function_plotting");
        return true;
    }
    return false;
}


function add_new_graph(func, color) {
    if (sth_fun(func)) {
        return ;
    }

    if (func.length <= 0) {
        renew_graph();
        return ;
    }
    if (!color) {
        color = color_selector.value;
    }
    all_graph.push([
        format_expression(func),
        color,
        func
    ]);
    for (var i = 0; i < all_graph.length - 1; ++i) {
        if (all_graph[i][0] == all_graph[all_graph.length - 1][0]) {
            // when new graph is same as graph that's drawn
            all_graph.splice(i, 1);
            break;
        }
    }
    if (c_auto_color_change) {
        color_using_index = (color_using_index + 1) % graph_color.length;
        color_selector.value = graph_color[color_using_index];
    }
    renew_graph();
}


function adjust_size() {
    get_page_size();
    graph.style.height      = Math.round(win_height * c_graph_canvas_height) + "px";
    graph.style.width       = Math.round(win_width * c_graph_canvas_width) + "px";
    
    graph.height            = Math.round(win_height * c_graph_canvas_height) * ratio;
    graph.width             = Math.round(win_width * c_graph_canvas_width) * ratio;
    
    input_area.style.height = Math.round(win_height * c_graph_canvas_height) - 10 + "px"; // -10: padding
    input_area.style.width  = Math.round(win_width * c_input_area_width) + "px";
    
    axis_max_height         = Math.round(graph.height / 2);
    axis_max_width          = Math.round(graph.width / 2);
}


function reset_canvas() {
    // clear canvas and redraw axis
    adjust_size();
    context.translate(0.5, 0.5);
    context.translate(axis_max_width, axis_max_height);

    var guide_line_gap_size = get_guide_line_gap_size();
    draw_guide_line(guide_line_gap_size);
    if (axis_checkbox.checked) {
        draw_axis();
    }
    if (axis_mark_checkbox.checked) {
        draw_axis_mark(guide_line_gap_size);
    }
}


function clear_all() {
    reset_canvas();
    all_graph = [];
    other_info_label.innerText = "";
    err_msg_label.innerText = "";
}


graph.addEventListener("mousemove", function(event) {
    var rect_pos = graph.getBoundingClientRect();
    var x = (event.clientX - rect_pos.left) * graph.width / rect_pos.width,
        y = (event.clientY - rect_pos.top) * graph.height / rect_pos.height;
    x -= axis_max_width;
    y = axis_max_height - y;
    x /= c_enlarge_val;
    y /= c_enlarge_val;
    mouse_pos_label.innerText = "x: " + x.toFixed(c_float_prec) + ", y:" + y.toFixed(c_float_prec);
}, false);


y_val_input_box.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // enter
        add_new_graph(y_val_input_box.value);
    }
}, false);


enlarge_val_input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { // enter
        c_enlarge_val = 150 / enlarge_val_input.value;
        renew_graph();
    }
}, false);


function mousewheel_handle(event) {
    if (event.deltaY <= 0) {
        c_enlarge_val *= 1.1;
    } else {
        c_enlarge_val /= 1.1;
    }
    renew_graph();
}


function init_by_arg() {
    var reg = new RegExp("(^|&)y=([^&]*)(&|$)", "i");
    var y = window.location.search.substr(1).match(reg);
    if (!y) {
        return null;
    }
    y = unescape(y[2]).split(";");
    for (var i = 0; i < y.length; ++i) {
        add_new_graph(y[i]);
    }
}


init_by_arg();
guide_line_checkbox.onchange = renew_graph;
axis_checkbox.onchange       = renew_graph;
axis_mark_checkbox.onchange  = renew_graph;
window.onresize              = renew_graph;
document.onresize            = renew_graph;
graph.onmousewheel           = mousewheel_handle;
renew_graph();
