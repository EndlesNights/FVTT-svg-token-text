const MODULE_ID = "svg-token-text";
const MODULE_TITLE = "SVG Token Text";

Hooks.once('ready', async function () {
    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM){
        ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it.");
    }

    console.log(`${MODULE_TITLE} - Module Loaded!`);
});


Hooks.on('updateToken', async function (token, update, obj, userID){
    let src = token.texture.src;

    if(!validateSVG(src)){
        return;
    }

    let svgData = await fetch(src).then(response => response.text());

    //check for a custom attribute tag to that checks if the SVG should be dynamicly edited
    if(!validateDynamicSVG(svgData)){
        return;
    }

    const pattern = /@([\w.]+)/g;
    const matches = svgData.match(pattern).map(str => str.slice(1));
    
    for (const match of matches) {
        if ( hasKey(update, match)) {

            //Redraw the SVG if one of the drawn values is updated
            const priorVisible = token.object.visible;
            await token.object.draw();
            token.object.visible = priorVisible;

            return;
        }
    }
});

Hooks.once('init', async function() {
    libWrapper.register(
        MODULE_ID,
        "Token.prototype._draw",
        drawSVG
    );
});

async function drawSVG(wrapped){
    // return wrapped();
    
    const src = this.document.texture.src;

    if(!validateSVG(src)){
        return wrapped();
    }

    let svgData = await fetch(src).then(response => response.text());

    //check for a custom attribute tag to that checks if the SVG should be dynamicly edited
    if(!validateDynamicSVG(svgData)){
        return wrapped();
    }

    wrapped();
    this._cleanData();

    // Draw the token as invisible, so it will be safely revealed later
    this.visible = false;

    // Load token texture
    let texture;
    if ( this.isPreview ){
        texture = this._original.texture?.clone();
    }
    else {

        svgData = replaceObjectKeys(svgData, this.document.actor);
        const blob = new Blob([svgData], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        // const image = document.createElement('img');
        // image.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});
        // image.src = url;
    
        // texture = await new PIXI.Texture.from(svgData);

        texture = await loadTexture(url, {fallback: CONST.DEFAULT_TOKEN});
    }

    this.texture = texture;
    this.mesh = canvas.primary.addToken(this);
}

function replaceObjectKeys(svgData, data) {
    const outputString = svgData.replace(/@([\w.]+)/g, (match, key) => {
      const keys = key.split(".");
      let value = data;
      keys.forEach(k => {
        if(value[k] != undefined ){
            value = value[k];
        } else {
            //TODO make a fall back string option, otherwise use the current key
            value = key;
        }
      });
      
      return value;
    });
  
    return outputString;
}

function validateSVG(src){
    let rgx = new RegExp(`(\\.svg)(\\?.*)?`, "i");
    return rgx.test(src);
}

function validateDynamicSVG(svgData){
  // Create a dummy element to hold the svg string
  const dummyElement = document.createElement('div');
  dummyElement.innerHTML = svgData;
  const element = dummyElement.firstElementChild;

  // Check if the element has a dsvg attribute
  return element.hasAttribute('dsvg');
//   if (element.hasAttribute('dsvg')) {
//     // Get the value of the class attribute
//     const dynamicSVG = element.getAttribute('dsvg');
//     return !!dynamicSVG;
//   } else {
//     return false;
//   }
}

function hasKey(obj, key) {
    if (obj.hasOwnProperty(key)) {
      return true;
    } else {
      for (const prop in obj) {
        if (typeof obj[prop] === "object") {
          if (hasKey(obj[prop], key)) {
            return true;
          }
        }
      }
    }
    return false;
  }