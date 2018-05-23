var inputs = document.querySelectorAll(".inputfile");
Array.prototype.forEach.call(inputs, function(input) {
    var label = input.nextElementSibling,
        labelVal = label.innerHTML;

    input.addEventListener("change", function(e) {
        var fileName2 = "";
        if (this.files && this.files.length > 1)
            fileName2 = (
                this.getAttribute("data-multiple-caption") || ""
            ).replace("{count}", this.files.length);
        else fileName2 = e.target.value.split("\\").pop();

        if (fileName2) label.querySelector("span").innerHTML = fileName2;
        else label.innerHTML = labelVal;
    });
});
