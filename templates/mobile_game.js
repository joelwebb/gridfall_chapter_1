// Initialize
$(function() {
    initGame();
    setTimeout(initializeMobileControls, 100);

    // Pause modal handlers
    $("#pause-button").on("click", function() {
        $("#pause-modal").show();
    });

    $("#resume-button").on("click", function() {
        $("#pause-modal").hide();
    });

    $("#return-menu-button").on("click", function() {
        window.location.href = "/dashboard";
    });

    $("#leave-battle-button").on("click", function() {
        window.location.href = "/map";
    });
});