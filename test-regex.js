const imgAttrs = 'src="data:image/png;base64,..." style="width: 300px; height: 150px; display: block;" data-align="center"';
const regex = /style="[^"]*width:\s*(\d+)px/i;
const match = imgAttrs.match(regex);
console.log("Match:", match ? match[1] : null);
