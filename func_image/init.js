// config
var c_enlarge_val         = 30,

    c_graph_line_width    = 2,
    c_axis_line_width     = 3,
    c_guide_line_width    = 1,

    c_font_size           = 27,
    c_axis_mark_font_size = 20,

    c_rect_size           = 20, // size of rect showing graph color

    c_float_prec          = 5,
    c_graph_prec          = 0.1,
    
    c_arrow_size          = 10,
    c_scale_line_size     = 15,

    c_show_axis_arrow     = true,
    c_auto_color_change   = true,

    c_graph_canvas_height = 0.95,
    c_graph_canvas_width  = 0.75,
    c_input_area_width    = 0.2,

    c_qrcode_size         = 100;

var graph               = document.getElementById("graph"),

    y_val_input_box     = document.getElementById("y_val"),
    enlarge_val_input   = document.getElementById("enlarge_val_input"),

    guide_line_checkbox = document.getElementById("guide_line_checkbox"),
    axis_checkbox       = document.getElementById("axis_checkbox"),
    axis_mark_checkbox  = document.getElementById("axis_mark_checkbox"),

    other_info_label    = document.getElementById("other_info"),
    err_msg_label       = document.getElementById("err_msg"),
    mouse_pos_label     = document.getElementById("mouse_pos"),

    color_selector      = document.getElementById("color"),

    input_area          = document.getElementById("input_area"),
    context             = graph.getContext("2d");

var qrcode = new QRCode("qrcode", {
    text: "",
    width: c_qrcode_size,
    height: c_qrcode_size,
    colorDark : "#000",
    colorLight : "#FFF",
    correctLevel : QRCode.CorrectLevel.H
});
