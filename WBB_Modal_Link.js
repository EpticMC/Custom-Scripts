$(document).ready(function() {
    $('a[href*="https://epticmc.com/board/28-administrator-application/"]').attr('id','adminapp');
    $('#adminapp').removeAttr('href');
    $('#adminapp').attr('title','Click to get to the admin application form');
    var modal = document.getElementById('errsyntax'), span = document.getElementById('close1');
        span.onclick  = function() { modal.style.display = "none"; }
        window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }
        $('#adminapp' ).click(function (){ modal.style.display = "block"; });
    });
});
