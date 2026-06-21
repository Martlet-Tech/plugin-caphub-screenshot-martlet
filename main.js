// ── Screenshot Plugin ──────────────────────────────────────
// F5 to start, left-drag to select region, release to capture.

var mode = null;
var overlay_handle = 0;
var startX = 0, startY = 0;

ctx.log("info", "screenshot plugin started — press F5 to capture, ESC to cancel");

function on_keyboard_down(e) {
    if (e.vk === 27) cancel_capture(); // ESC
}

function on_screenshot_capture() {
    startX = 0; startY = 0;
    start_capture();
}

function on_plugin_action(e) {
    if (e.plugin !== "screenshot") return;
    if (e.action === "screenshot.capture") {
        start_capture();
    }
}

function start_capture() {
    if (mode) return;
    mode = "selecting";
    startX = 0; startY = 0;
    var r = ctx.overlay.cmd(JSON.stringify({cmd:"create",x:0,y:0,w:0,h:0,t:false}));
    overlay_handle = parseInt(r) || 0;
    if (overlay_handle) ctx.log("debug", "screenshot overlay: " + overlay_handle);
}

function cancel_capture() {
    if (mode !== "selecting") return;
    mode = null;
    ctx.overlay.cmd(JSON.stringify({cmd:"destroy",h:overlay_handle}));
    overlay_handle = 0;
}

function on_mouse_down(e) {
    if (mode !== "selecting") return;
    if (e.button !== "Left") { cancel_capture(); return; }
    startX = e.x; startY = e.y;
}

function on_mouse_move(e) {
    if (mode !== "selecting") return;
    if (!startX && !startY) return;
    var x = Math.min(startX, e.x), y = Math.min(startY, e.y);
    var w = Math.abs(e.x - startX), h = Math.abs(e.y - startY);
    if (w < 2 && h < 2) return;
    ctx.overlay.cmd(JSON.stringify({cmd:"clear",h:overlay_handle}));
    ctx.overlay.cmd(JSON.stringify({cmd:"draw_rect",h:overlay_handle,x:x,y:y,rw:w,rh:h,color:0x00FF00,thickness:2}));
}

function on_mouse_up(e) {
    if (mode !== "selecting") return;
    mode = null;
    ctx.overlay.cmd(JSON.stringify({cmd:"destroy",h:overlay_handle}));
    overlay_handle = 0;

    if (e.button !== "Left") return;
    var x = Math.min(startX, e.x), y = Math.min(startY, e.y);
    var w = Math.abs(e.x - startX), h = Math.abs(e.y - startY);
    if (w < 5 || h < 5) return;

    var path = ctx.screen.capture(x, y, w, h);
    if (path) ctx.log("info", "screenshot saved: " + path);
}
