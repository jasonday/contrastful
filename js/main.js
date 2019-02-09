/* Contrast checking */

var contrast = {
    // Parse rgb(r, g, b) and rgba(r, g, b, a) strings into an array.
    // Adapted from https://github.com/gka/chroma.js
    parseRgb: function (css) {
        var i, m, rgb, _i, _j;
        if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
            rgb = m.slice(1, 4);
            for (i = _i = 0; _i <= 2; i = ++_i) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;
        } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
            rgb = m.slice(1, 5);
            for (i = _j = 0; _j <= 3; i = ++_j) {
                rgb[i] = +rgb[i];
            }
        }
        return rgb;
    },
    // Based on https://gist.github.com/comficker/871d378c535854c1c460f7867a191a5a#file-hex2rgb-js
    hexToRgb: function (hex) {
        hex = hex.trim();
        hex = hex[0] === '#' ? hex.substr(1) : hex;
        var bigint = parseInt(hex, 16), h = [];
        if (hex.length === 3) {
            h.push((bigint >> 4) & 255);
            h.push((bigint >> 2) & 255);
        } else {
            h.push((bigint >> 16) & 255);
            h.push((bigint >> 8) & 255);
        }
        h.push(bigint & 255);
        return 'rgb('+h.join()+')';
    },
    // Based on http://www.w3.org/TR/WCAG20/#relativeluminancedef
    relativeLuminance: function (c) {
        var lum = [];
        for (var i = 0; i < 3; i++) {
            var v = c[i] / 255;
            lum.push(v < 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        }
        return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
    },
    // Based on http://www.w3.org/TR/WCAG20/#contrast-ratiodef
    contrastRatio: function (x, y) {
        var l1 = contrast.relativeLuminance(contrast.parseRgb(x));
        var l2 = contrast.relativeLuminance(contrast.parseRgb(y));
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    check: function (x,y,z) {
        // comparison variations
        var color_combos = [
            {"color1": x,"color2":y},
            {"color1": y,"color2":z},
            {"color1": z,"color2":x},
            {"color1": x,"color2":z},
            {"color1": y,"color2":x},
            {"color1": z,"color2":y}
           ];

        // remove prior cards
        $('.color_cards .card').remove();

        $.each(color_combos, function(idx, obj) {
            var ratio = Math.round(contrast.contrastRatio(obj.color1, obj.color2) * 100) / 100,
                large,
                small;

            if(ratio >= 4.5){
                large = "Pass";
                small = "Pass";
            } else if(ratio > 3 && ratio < 4.5){
                large = "Pass";
                small = "Fail";
            } else if(ratio < 3){
                large = "Fail";
                small = "Fail";
            } else {
                large = "?";
                small = "?";
            }

            var card_template = `<div class="card col-sm-4 col-xs-12">
                <div class="card-wrap">
                    <h3 class="ratio">${ratio}:1</h3>
                    <div class="swatch" style="background-color: ${obj.color1}; color: ${obj.color2}">
                        <div class="eighteen">18px font</div>
                        <div class="fourteen">14px font</div>
                        <div class="button"><button style="border-color:${obj.color2}; color: ${obj.color2}">Button</button></div>
                    </div>
                    <div class="details">
                        <div class="${large}">font size > 18px/14px bold: ${large}</div>
                        <div class="${small}">font size < 18px: ${small}</div>
                        <div class="${large}">UI element: ${large}</div>
                    </div>
                </div>
            </div>`;

            $('.color_cards').append(card_template);
        });

    }
}

$('.color-picker').on("change", function(event){
    if($('#color-1').val().length > 1 && $('#color-2').val().length > 1 && $('#color-3').val().length > 1){
        var color1 = contrast.hexToRgb($('#color-1').val());
        var color2 = contrast.hexToRgb($('#color-2').val());
        var color3 = contrast.hexToRgb($('#color-3').val());
        console.log(color1, color2, color3);
        contrast.check(color1, color2, color3);
    }
})


