var _kk = [], magic = "38,38,40,40,37,39,37,39,66,65";
$(document).keydown(function(e) {
    _kk.push(e.keyCode);
    while (_kk.toString().indexOf(magic) >= 0) {
        _kk = [];
        WCF.System.Confirmation.show('Up for a game?', $.proxy(function (action) { 
            if (action == 'confirm') KonOpenClose($(".kon-popup")); 
            else return; 
        }));
    }
});

function KonOpenClose(popup) {
    if ($(".kon-wrapper").length == 0) $(popup).wrapInner("<div class='kon-wrapper'></div>");
    $(popup).show();
    $(popup).click(function(e) { if ( e.target == this ) if ($(popup).is(':visible')) $(popup).hide(); });
    $(popup).find("button[name=kon-close]").on("click", function() {
        if ($(".formElementError").is(':visible')) $(".formElementError").remove();
        $(popup).hide();
    });
}
