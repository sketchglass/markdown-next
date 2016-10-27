var parse = require("../lib/src/parser").parse
var elem = document.getElementById("textarea")
var preview = document.getElementById("preview")

elem.addEventListener("keydown", function(e) {
  try {
    preview.innerHTML = parse(elem.value)
  } catch(e) {
    console.error(e)
  }
})
