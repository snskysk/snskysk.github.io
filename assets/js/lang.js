$(function () {
    var key = "language" + "=";
    var cookie = document.cookie + ";";
    var find = cookie.indexOf(key);
    var offset = find + key.length;
    var end = cookie.indexOf(";", offset);
    var val = unescape(cookie.substring(offset, end));
    if (val == "eng") {
      $(".eng").show();
      $(".jpn").hide();
    } else {
      $(".jpn").show();
      $(".eng").hide();
    }
  
    $(".language-btn-jp").click(function () {
      $(".jpn").show();
      $(".eng").hide();
      document.cookie = "language=jpn;";
    });
  
    $(".language-btn-en").click(function () {
      $(".jpn").hide();
      $(".eng").show();
      document.cookie = "language=eng;";
    });
  });